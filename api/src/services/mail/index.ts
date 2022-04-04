import fse from 'fs-extra';
import { Knex } from 'knex';
import { Liquid } from 'liquidjs';
import path from 'path';
import getDatabase from '../../database';
import env from '../../env';
import { InvalidPayloadException } from '../../exceptions';
import logger from '../../logger';
import { AbstractServiceOptions } from '../../types';
import { Accountability, SchemaOverview } from '@directus/shared/types';
import getMailer from '../../mailer';
import { Transporter, SendMailOptions } from 'nodemailer';
import { Url } from '../../utils/url';

const liquidEngine = new Liquid({
	root: [path.resolve(env.EXTENSIONS_PATH, 'templates'), path.resolve(__dirname, 'templates')],
	extname: '.liquid',
});

export type EmailOptions = SendMailOptions & {
	template?: {
		name: string;
		data: Record<string, any>;
	};
};

export class MailService {
	schema: SchemaOverview;
	accountability: Accountability | null;
	knex: Knex;
	mailer: Transporter;

	constructor(opts: AbstractServiceOptions) {
		this.schema = opts.schema;
		this.accountability = opts.accountability || null;
		this.knex = opts?.knex || getDatabase();
		this.mailer = getMailer();

		this.mailer.verify((error) => {
			if (error) {
				logger.warn(`Email connection failed:`);
				logger.warn(error);
			}
		});
	}

	async send(options: EmailOptions): Promise<void> {
		const { template, ...emailOptions } = options;
		let { html } = options;

		const defaultTemplateData = await this.getDefaultTemplateData();

		const from = `${defaultTemplateData.projectName} <${options.from || (env.EMAIL_FROM as string)}>`;

		if (template) {
			let templateData = template.data;

			templateData = {
				...defaultTemplateData,
				...templateData,
			};

			html = await this.renderTemplate(template.name, templateData);
		}

		if (typeof html === 'string') {
			// Some email clients start acting funky when line length exceeds 75 characters. See #6074
			html = html
				.split('\n')
				.map((line) => line.trim())
				.join('\n');
		}

		await this.mailer.sendMail({ ...emailOptions, from, html });
	}

	private async renderTemplate(template: string, variables: Record<string, any>) {
		const customTemplatePath = path.resolve(env.EXTENSIONS_PATH, 'templates', template + '.liquid');
		const systemTemplatePath = path.join(__dirname, 'templates', template + '.liquid');

		const templatePath = (await fse.pathExists(customTemplatePath)) ? customTemplatePath : systemTemplatePath;

		if ((await fse.pathExists(templatePath)) === false) {
			throw new InvalidPayloadException(`Template "${template}" doesn't exist.`);
		}

		const templateString = await fse.readFile(templatePath, 'utf8');
		const html = await liquidEngine.parseAndRender(templateString, variables);

		return html;
	}

	private async getDefaultTemplateData() {
		const projectInfo = await this.knex
			.select(['project_name', 'project_logo', 'project_color'])
			.from('directus_settings')
			.first();

		return {
			projectName: projectInfo?.project_name || 'Directus',
			projectColor: projectInfo?.project_color || '#546e7a',
			projectLogo: getProjectLogoURL(projectInfo?.project_logo),
		};

		function getProjectLogoURL(logoID?: string) {
			const projectLogoUrl = new Url(env.PUBLIC_URL);

			if (logoID) {
				projectLogoUrl.addPath('assets', logoID);
			} else {
				projectLogoUrl.addPath('admin', 'img', 'directus-white.png');
			}

			return projectLogoUrl.toString();
		}
	}
}
