import { toArray } from '@directus/shared/utils';
import logger from '../logger';
import { URL } from 'url';

/**
 * Check if url matches allow list either exactly or by domain+path
 */
export default function isUrlAllowed(url: string, allowList: string | string[]): boolean {
	const urlAllowList = toArray(allowList);

	if (urlAllowList.includes(url)) return true;

	const parsedWhitelist = urlAllowList.map((allowedURL) => {
		try {
			const { hostname, pathname } = new URL(allowedURL);
			return hostname + pathname;
		} catch {
			logger.warn(`Invalid URL used "${url}"`);
		}
	});

	try {
		const { hostname, pathname } = new URL(url);
		return parsedWhitelist.includes(hostname + pathname);
	} catch {
		return false;
	}
}
