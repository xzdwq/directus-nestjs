import cookieParser from 'cookie-parser';
import express, { Request, Response, RequestHandler } from 'express';
import fse from 'fs-extra';
import path from 'path';
import qs from 'qs';
import helmet from 'helmet';

import activityRouter from './controllers/activity';
import assetsRouter from './controllers/assets';
import authRouter from './controllers/auth';
import collectionsRouter from './controllers/collections';
import dashboardsRouter from './controllers/dashboards';
import extensionsRouter from './controllers/extensions';
import fieldsRouter from './controllers/fields';
import filesRouter from './controllers/files';
import foldersRouter from './controllers/folders';
import graphqlRouter from './controllers/graphql';
import itemsRouter from './controllers/items';
import notFoundHandler from './controllers/not-found';
import panelsRouter from './controllers/panels';
import notificationsRouter from './controllers/notifications';
import permissionsRouter from './controllers/permissions';
import presetsRouter from './controllers/presets';
import relationsRouter from './controllers/relations';
import revisionsRouter from './controllers/revisions';
import rolesRouter from './controllers/roles';
import serverRouter from './controllers/server';
import settingsRouter from './controllers/settings';
import usersRouter from './controllers/users';
import utilsRouter from './controllers/utils';
import webhooksRouter from './controllers/webhooks';
import sharesRouter from './controllers/shares';
import { isInstalled, validateDatabaseConnection, validateDatabaseExtensions, validateMigrations } from './database';
import emitter from './emitter';
import env from './env';
import { InvalidPayloadException } from './exceptions';
import { getExtensionManager } from './extensions';
import logger, { expressLogger } from './logger';
import authenticate from './middleware/authenticate';
import getPermissions from './middleware/get-permissions';
import cache from './middleware/cache';
import { checkIP } from './middleware/check-ip';
import cors from './middleware/cors';
import errorHandler from './middleware/error-handler';
import extractToken from './middleware/extract-token';
import rateLimiter from './middleware/rate-limiter';
import sanitizeQuery from './middleware/sanitize-query';
import schema from './middleware/schema';

import { track } from './utils/track';
import { validateEnv } from './utils/validate-env';
import { validateStorage } from './utils/validate-storage';
import { register as registerWebhooks } from './webhooks';
import { flushCaches } from './cache';
import { registerAuthProviders } from './auth';
import { Url } from './utils/url';
import { getConfigFromEnv } from './utils/get-config-from-env';
import { merge } from 'lodash';

export default async function createApp(): Promise<express.Application> {
	validateEnv(['KEY', 'SECRET']);

	if (!new Url(env.PUBLIC_URL).isAbsolute()) {
		logger.warn('PUBLIC_URL should be a full URL');
	}

	await validateStorage();

	await validateDatabaseConnection();
	await validateDatabaseExtensions();

	if ((await isInstalled()) === false) {
		logger.error(`Database doesn't have Directus tables installed.`);
		process.exit(1);
	}

	if ((await validateMigrations()) === false) {
		logger.warn(`Database migrations have not all been run`);
	}

	await flushCaches();

	await registerAuthProviders();

	const extensionManager = getExtensionManager();

	await extensionManager.initialize();

	const app = express();

	app.disable('x-powered-by');
	app.set('trust proxy', env.IP_TRUST_PROXY);
	app.set('query parser', (str: string) => qs.parse(str, { depth: 10 }));

	app.use(
		helmet.contentSecurityPolicy(
			merge(
				{
					useDefaults: true,
					directives: {
						// Unsafe-eval is required for vue3 / vue-i18n / app extensions
						scriptSrc: ["'self'", "'unsafe-eval'"],

						// Even though this is recommended to have enabled, it breaks most local
						// installations. Making this opt-in rather than opt-out is a little more
						// friendly. Ref #10806
						upgradeInsecureRequests: null,

						// These are required for MapLibre
						// https://cdn.directus.io is required for images/videos in the official docs
						workerSrc: ["'self'", 'blob:'],
						childSrc: ["'self'", 'blob:'],
						imgSrc: ["'self'", 'data:', 'blob:', 'https://cdn.directus.io'],
						mediaSrc: ["'self'", 'https://cdn.directus.io'],
						connectSrc: ["'self'", 'https://*'],
					},
				},
				getConfigFromEnv('CONTENT_SECURITY_POLICY_')
			)
		)
	);

	await emitter.emitInit('app.before', { app });

	await emitter.emitInit('middlewares.before', { app });

	app.use(expressLogger);

	app.use((req, res, next) => {
		(
			express.json({
				limit: env.MAX_PAYLOAD_SIZE,
			}) as RequestHandler
		)(req, res, (err: any) => {
			if (err) {
				return next(new InvalidPayloadException(err.message));
			}

			return next();
		});
	});

	app.use(cookieParser());

	app.use(extractToken);

	app.use((_req, res, next) => {
		res.setHeader('X-Powered-By', 'Directus');
		next();
	});

	if (env.CORS_ENABLED === true) {
		app.use(cors);
	}

	app.get('/', (_req, res, next) => {
		if (env.ROOT_REDIRECT) {
			res.redirect(env.ROOT_REDIRECT);
		} else {
			next();
		}
	});

	if (env.SERVE_APP) {
		const adminPath = require.resolve('@directus/app');
		const adminUrl = new Url(env.PUBLIC_URL).addPath('admin');

		// Set the App's base path according to the APIs public URL
		const html = await fse.readFile(adminPath, 'utf8');
		const htmlWithBase = html.replace(/<base \/>/, `<base href="${adminUrl.toString({ rootRelative: true })}/" />`);

		const noCacheIndexHtmlHandler = (_req: Request, res: Response) => {
			res.setHeader('Cache-Control', 'no-cache');
			res.send(htmlWithBase);
		};

		app.get('/admin', noCacheIndexHtmlHandler);
		app.use('/admin', express.static(path.join(adminPath, '..')));
		app.use('/admin/*', noCacheIndexHtmlHandler);
	}

	// use the rate limiter - all routes for now
	if (env.RATE_LIMITER_ENABLED === true) {
		app.use(rateLimiter);
	}

	app.use(authenticate);

	app.use(checkIP);

	app.use(sanitizeQuery);

	app.use(cache);

	app.use(schema);

	app.use(getPermissions);

	await emitter.emitInit('middlewares.after', { app });

	await emitter.emitInit('routes.before', { app });

	app.use('/api/auth', authRouter);

	app.use('/api/graphql', graphqlRouter);

	app.use('/api/activity', activityRouter);
	app.use('/api/assets', assetsRouter);
	app.use('/api/collections', collectionsRouter);
	app.use('/api/dashboards', dashboardsRouter);
	app.use('/api/extensions', extensionsRouter);
	app.use('/api/fields', fieldsRouter);
	app.use('/api/files', filesRouter);
	app.use('/api/folders', foldersRouter);
	app.use('/api/items', itemsRouter);
	app.use('/api/notifications', notificationsRouter);
	app.use('/api/panels', panelsRouter);
	app.use('/api/permissions', permissionsRouter);
	app.use('/api/presets', presetsRouter);
	app.use('/api/relations', relationsRouter);
	app.use('/api/revisions', revisionsRouter);
	app.use('/api/roles', rolesRouter);
	app.use('/api/server', serverRouter);
	app.use('/api/settings', settingsRouter);
	app.use('/api/shares', sharesRouter);
	app.use('/api/users', usersRouter);
	app.use('/api/utils', utilsRouter);
	app.use('/api/webhooks', webhooksRouter);

	// Register custom endpoints
	await emitter.emitInit('routes.custom.before', { app });
	app.use(extensionManager.getEndpointRouter());
	await emitter.emitInit('routes.custom.after', { app });

	app.use(notFoundHandler);
	app.use(errorHandler);

	await emitter.emitInit('routes.after', { app });

	// Register all webhooks
	await registerWebhooks();

	track('serverStarted');

	await emitter.emitInit('app.after', { app });

	return app;
}
