export function getRootPath(): string {
	return '/';
}

export function getPublicURL(): string {
	const path = window.location.href;
	return path;
}

export function getAssetsPath(): string {
	return getRootPath() + 'api/assets/';
}
