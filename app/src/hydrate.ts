import { setLanguage } from '@/lang/set-language';
import { register as registerModules, unregister as unregisterModules } from '@/modules/register';
import { getBasemapSources } from '@/utils/geometry/basemap';
import {
	useAppStore,
	useCollectionsStore,
	useFieldsStore,
	useLatencyStore,
	useInsightsStore,
	usePermissionsStore,
	usePresetsStore,
	useRelationsStore,
	useRequestsStore,
	useServerStore,
	useSettingsStore,
	useUserStore,
	useNotificationsStore,
} from '@/stores';
import { useTranslationStrings } from '@/composables/use-translation-strings';

type GenericStore = {
	$id: string;
	hydrate?: () => Promise<void>;
	dehydrate?: () => Promise<void>;

	[key: string]: any;
};

export function useStores(
	stores = [
		useCollectionsStore,
		useFieldsStore,
		useUserStore,
		useRequestsStore,
		usePresetsStore,
		useSettingsStore,
		useServerStore,
		useLatencyStore,
		useRelationsStore,
		usePermissionsStore,
		useInsightsStore,
		useNotificationsStore,
	]
): GenericStore[] {
	return stores.map((useStore) => useStore()) as GenericStore[];
}

export async function hydrate(): Promise<void> {
	const stores = useStores();

	const appStore = useAppStore();
	const userStore = useUserStore();
	const serverStore = useServerStore();
	const permissionsStore = usePermissionsStore();
	const { refresh: hydrateTranslationStrings } = useTranslationStrings();

	if (appStore.hydrated) return;
	if (appStore.hydrating) return;

	appStore.hydrating = true;

	try {
		/**
		 * @NOTE
		 * Multiple stores rely on the userStore to be set, so they can fetch user specific data. The
		 * following makes sure that the user store is always fetched first, before we hydrate anything
		 * else.
		 */
		await userStore.hydrate();

		let lang = 'en-US';
		if (serverStore.info?.project?.default_language) lang = serverStore.info.project.default_language;

		if (userStore.currentUser?.role) {
			await permissionsStore.hydrate();
			const hydratedStores = ['userStore', 'permissionsStore'];

			await Promise.all(stores.filter(({ $id }) => !hydratedStores.includes($id)).map((store) => store.hydrate?.()));
			await registerModules();
			await hydrateTranslationStrings();

			if (userStore.currentUser?.language) lang = userStore.currentUser?.language;
		}

		await setLanguage(lang);

		appStore.basemap = getBasemapSources()[0].name;
	} catch (error: any) {
		appStore.error = error;
	} finally {
		appStore.hydrating = false;
	}

	appStore.hydrated = true;
}

export async function dehydrate(stores = useStores()): Promise<void> {
	const appStore = useAppStore();

	if (appStore.hydrated === false) return;

	for (const store of stores) {
		await store.dehydrate?.();
	}

	unregisterModules();

	appStore.hydrated = false;
}
