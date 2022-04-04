import { Range } from '@directus/drive';
import { Router } from 'express';
import { pick } from 'lodash';
import ms from 'ms';
import { ASSET_TRANSFORM_QUERY_KEYS, SYSTEM_ASSET_ALLOW_LIST } from '../constants';
import getDatabase from '../database';
import env from '../env';
import { InvalidQueryException, RangeNotSatisfiableException } from '../exceptions';
import useCollection from '../middleware/use-collection';
import { AssetsService, PayloadService } from '../services';
import { TransformationParams, TransformationMethods, TransformationPreset } from '../types/assets';
import asyncHandler from '../utils/async-handler';
import helmet from 'helmet';
import { merge } from 'lodash';
import { getConfigFromEnv } from '../utils/get-config-from-env';

const router = Router();

router.use(useCollection('directus_files'));

router.get(
	'/:pk',
	// Validate query params
	asyncHandler(async (req, res, next) => {
		const payloadService = new PayloadService('directus_settings', { schema: req.schema });
		const defaults = { storage_asset_presets: [], storage_asset_transform: 'all' };

		const database = getDatabase();
		const savedAssetSettings = await database
			.select('storage_asset_presets', 'storage_asset_transform')
			.from('directus_settings')
			.first();

		if (savedAssetSettings) {
			await payloadService.processValues('read', savedAssetSettings);
		}

		const assetSettings = savedAssetSettings || defaults;

		const transformation = pick(req.query, ASSET_TRANSFORM_QUERY_KEYS);

		if ('key' in transformation && Object.keys(transformation).length > 1) {
			throw new InvalidQueryException(`You can't combine the "key" query parameter with any other transformation.`);
		}

		if ('transforms' in transformation) {
			let transforms: unknown;

			// Try parse the JSON array
			try {
				transforms = JSON.parse(transformation['transforms'] as string);
			} catch {
				throw new InvalidQueryException(`"transforms" Parameter needs to be a JSON array of allowed transformations.`);
			}

			// Check if it is actually an array.
			if (!Array.isArray(transforms)) {
				throw new InvalidQueryException(`"transforms" Parameter needs to be a JSON array of allowed transformations.`);
			}

			// Check against ASSETS_TRANSFORM_MAX_OPERATIONS
			if (transforms.length > Number(env.ASSETS_TRANSFORM_MAX_OPERATIONS)) {
				throw new InvalidQueryException(
					`"transforms" Parameter is only allowed ${env.ASSETS_TRANSFORM_MAX_OPERATIONS} transformations.`
				);
			}

			// Check the transformations are valid
			transforms.forEach((transform) => {
				const name = transform[0];

				if (!TransformationMethods.includes(name)) {
					throw new InvalidQueryException(`"transforms" Parameter does not allow "${name}" as a transformation.`);
				}
			});

			transformation.transforms = transforms;
		}

		const systemKeys = SYSTEM_ASSET_ALLOW_LIST.map((transformation) => transformation.key!);
		const allKeys: string[] = [
			...systemKeys,
			...(assetSettings.storage_asset_presets || []).map((transformation: TransformationParams) => transformation.key),
		];

		// For use in the next request handler
		res.locals.shortcuts = [...SYSTEM_ASSET_ALLOW_LIST, ...(assetSettings.storage_asset_presets || [])];
		res.locals.transformation = transformation;

		if (
			Object.keys(transformation).length === 0 ||
			('transforms' in transformation && transformation.transforms!.length === 0)
		) {
			return next();
		}

		if (assetSettings.storage_asset_transform === 'all') {
			if (transformation.key && allKeys.includes(transformation.key as string) === false) {
				throw new InvalidQueryException(`Key "${transformation.key}" isn't configured.`);
			}

			return next();
		} else if (assetSettings.storage_asset_transform === 'presets') {
			if (allKeys.includes(transformation.key as string)) return next();
			throw new InvalidQueryException(`Only configured presets can be used in asset generation.`);
		} else {
			if (transformation.key && systemKeys.includes(transformation.key as string)) return next();
			throw new InvalidQueryException(`Dynamic asset generation has been disabled for this project.`);
		}
	}),

	helmet.contentSecurityPolicy(
		merge(
			{
				useDefaults: false,
				directives: {
					defaultSrc: ['none'],
				},
			},
			getConfigFromEnv('ASSETS_CONTENT_SECURITY_POLICY')
		)
	),

	// Return file
	asyncHandler(async (req, res) => {
		const id = req.params.pk?.substring(0, 36);

		const service = new AssetsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const transformation: TransformationParams | TransformationPreset = res.locals.transformation.key
			? (res.locals.shortcuts as TransformationPreset[]).find(
					(transformation) => transformation.key === res.locals.transformation.key
			  )
			: res.locals.transformation;

		let range: Range | undefined = undefined;

		if (req.headers.range) {
			// substring 6 = "bytes="
			const rangeParts = req.headers.range.substring(6).split('-');

			range = {
				start: rangeParts[0] ? Number(rangeParts[0]) : 0,
				end: rangeParts[1] ? Number(rangeParts[1]) : undefined,
			};

			if (Number.isNaN(range.start) || Number.isNaN(range.end)) {
				throw new RangeNotSatisfiableException(range);
			}
		}

		const { stream, file, stat } = await service.getAsset(id, transformation, range);

		const access = req.accountability?.role ? 'private' : 'public';

		res.attachment(file.filename_download);
		res.setHeader('Content-Type', file.type);
		res.setHeader('Accept-Ranges', 'bytes');
		res.setHeader('Cache-Control', `${access}, max-age=${ms(env.ASSETS_CACHE_TTL as string) / 1000}`);

		if (range) {
			res.setHeader('Content-Range', `bytes ${range.start}-${range.end || stat.size - 1}/${stat.size}`);
			res.status(206);
			res.setHeader('Content-Length', (range.end ? range.end + 1 : stat.size) - range.start);
		} else {
			res.setHeader('Content-Length', stat.size);
		}

		if ('download' in req.query === false) {
			res.removeHeader('Content-Disposition');
		}

		if (req.method.toLowerCase() === 'head') {
			res.status(200);
			res.setHeader('Accept-Ranges', 'bytes');
			res.setHeader('Content-Length', stat.size);

			return res.end();
		}

		stream.pipe(res);
	})
);

export default router;
