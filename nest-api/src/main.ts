import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');

import logger from '@src/core/logger';
import { AppModule } from '@src/app.module';

async function run() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bufferLogs: true,
	});
	const config = app.get(ConfigService),
		http_resolve_log = config.get('logger').http_resolve_log,
		noauth_user_mask = config.get('logger').noauth_user_mask,
		api_global_prefix = config.get('api_global_prefix');

	app.setGlobalPrefix(api_global_prefix);
	app.enableCors({
		origin: [/^(.*)/],
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
		preflightContinue: false,
		optionsSuccessStatus: 204,
	});

	// Логирование HTTP запросов в зависимости от значения http_resolve_log
	morgan.token('user', (req: any) => (req.user ? req.user.email : noauth_user_mask));
	morgan.format('combined', config.get('logger').morgan_format);
	app.use(
		morgan('combined', {
			skip: (req, res) => res.statusCode >= 400,
			stream: {
				write: (message: string) => {
					http_resolve_log ? logger.info(message) : null;
				},
			},
		}),
	);

	const PORT = config.get('nest_port'),
		MODE = config.get('mode');

	await app.listen(PORT, '0.0.0.0', async () =>
		logger.info(
			`Server nest-api running on port ${PORT}. Application on url ${await app.getUrl()}. Process ID: ${
				process.pid
			}. MODE: ${MODE}`,
			'NestApp',
		),
	);
}
run();
