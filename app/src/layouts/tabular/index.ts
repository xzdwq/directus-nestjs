import { defineLayout } from '@directus/shared/utils';
import TabularLayout from './tabular.vue';
import TabularOptions from './options.vue';
import TabularActions from './actions.vue';

import { useI18n } from 'vue-i18n';
import { ref, computed, watch, toRefs } from 'vue';

import { HeaderRaw, Item } from '@/components/v-table/types';
import { Field } from '@directus/shared/types';
import { useRouter } from 'vue-router';
import { debounce, clone } from 'lodash';
import { useCollection } from '@directus/shared/composables';
import { useItems } from '@directus/shared/composables';
import adjustFieldsForDisplays from '@/utils/adjust-fields-for-displays';
import hideDragImage from '@/utils/hide-drag-image';
import { getDefaultDisplayForType } from '@/utils/get-default-display-for-type';
import { useSync } from '@directus/shared/composables';
import { LayoutOptions, LayoutQuery } from './types';
import { syncRefProperty } from '@/utils/sync-ref-property';
import { useFieldsStore } from '@/stores';

export default defineLayout<LayoutOptions, LayoutQuery>({
	id: 'tabular',
	name: '$t:layouts.tabular.tabular',
	icon: 'reorder',
	component: TabularLayout,
	slots: {
		options: TabularOptions,
		sidebar: () => undefined,
		actions: TabularActions,
	},
	setup(props, { emit }) {
		const { t, n } = useI18n();

		const router = useRouter();

		const fieldsStore = useFieldsStore();

		const selection = useSync(props, 'selection', emit);
		const layoutOptions = useSync(props, 'layoutOptions', emit);
		const layoutQuery = useSync(props, 'layoutQuery', emit);

		const { collection, filter, filterUser, search } = toRefs(props);

		const { info, primaryKeyField, fields: fieldsInCollection, sortField } = useCollection(collection);

		const { sort, limit, page, fields, fieldsWithRelational } = useItemOptions();

		const { items, loading, error, totalPages, itemCount, totalCount, changeManualSort, getItems } = useItems(
			collection,
			{
				sort,
				limit,
				page,
				fields: fieldsWithRelational,
				filter,
				search,
			}
		);

		const {
			tableSort,
			tableHeaders,
			tableRowHeight,
			onRowClick,
			onSortChange,
			onAlignChange,
			activeFields,
			tableSpacing,
		} = useTable();

		const showingCount = computed(() => {
			if ((itemCount.value || 0) < (totalCount.value || 0) && filterUser.value) {
				if (itemCount.value === 1) {
					return t('one_filtered_item');
				}

				return t('start_end_of_count_filtered_items', {
					start: n((+page.value - 1) * limit.value + 1),
					end: n(Math.min(page.value * limit.value, itemCount.value || 0)),
					count: n(itemCount.value || 0),
				});
			}

			if (itemCount.value === 1) {
				return t('one_item');
			}

			return t('start_end_of_count_items', {
				start: n((+page.value - 1) * limit.value + 1),
				end: n(Math.min(page.value * limit.value, itemCount.value || 0)),
				count: n(itemCount.value || 0),
			});
		});

		return {
			tableHeaders,
			items,
			loading,
			error,
			totalPages,
			tableSort,
			onRowClick,
			onSortChange,
			onAlignChange,
			tableRowHeight,
			page,
			toPage,
			itemCount,
			totalCount,
			fieldsInCollection,
			fields,
			limit,
			activeFields,
			tableSpacing,
			primaryKeyField,
			info,
			showingCount,
			sortField,
			changeManualSort,
			hideDragImage,
			refresh,
			resetPresetAndRefresh,
			selectAll,
			filter,
			search,
		};

		async function resetPresetAndRefresh() {
			await props?.resetPreset?.();
			refresh();
		}

		function refresh() {
			getItems();
		}

		function toPage(newPage: number) {
			page.value = newPage;
		}

		function selectAll() {
			if (!primaryKeyField.value) return;
			const pk = primaryKeyField.value;
			selection.value = clone(items.value).map((item) => item[pk.field]);
		}

		function useItemOptions() {
			const page = syncRefProperty(layoutQuery, 'page', 1);
			const limit = syncRefProperty(layoutQuery, 'limit', 25);
			const defaultSort = computed(() => (primaryKeyField.value ? [primaryKeyField.value?.field] : []));
			const sort = syncRefProperty(layoutQuery, 'sort', defaultSort);
			const fieldsDefaultValue = computed(() => {
				return fieldsInCollection.value
					.filter((field: Field) => !field.meta?.hidden)
					.slice(0, 4)
					.map(({ field }: Field) => field)
					.sort();
			});

			const fields = syncRefProperty(layoutQuery, 'fields', fieldsDefaultValue);

			const fieldsWithRelational = computed(() => {
				if (!props.collection) return [];
				return adjustFieldsForDisplays(fields.value, props.collection);
			});

			return { sort, limit, page, fields, fieldsWithRelational };
		}

		function useTable() {
			const tableSort = computed(() => {
				if (!sort.value?.[0]) {
					return null;
				} else if (sort.value?.[0].startsWith('-')) {
					return { by: sort.value[0].substring(1), desc: true };
				} else {
					return { by: sort.value[0], desc: false };
				}
			});

			const localWidths = ref<{ [field: string]: number }>({});

			watch(
				() => layoutOptions.value,
				() => {
					localWidths.value = {};
				}
			);

			const saveWidthsToLayoutOptions = debounce(() => {
				layoutOptions.value = Object.assign({}, layoutOptions.value, {
					widths: localWidths.value,
				});
			}, 350);

			const activeFields = computed<(Field & { key: string })[]>({
				get() {
					if (!collection.value) return [];

					return fields.value
						.map((key) => ({ ...fieldsStore.getField(collection.value!, key), key }))
						.filter((f) => f && f.meta?.special?.includes('no-data') !== true) as (Field & { key: string })[];
				},
				set(val) {
					fields.value = val.map((field) => field.field);
				},
			});

			const tableHeaders = computed<HeaderRaw[]>({
				get() {
					return activeFields.value.map((field) => {
						let description: string | null = null;

						const fieldParts = field.key.split('.');

						if (fieldParts.length > 1) {
							const fieldNames = fieldParts.map((fieldKey, index) => {
								const pathPrefix = fieldParts.slice(0, index);
								const field = fieldsStore.getField(collection.value!, [...pathPrefix, fieldKey].join('.'));
								return field?.name ?? fieldKey;
							});

							description = fieldNames.join(' -> ');
						}

						return {
							text: field.name,
							value: field.key,
							description,
							width: localWidths.value[field.key] || layoutOptions.value?.widths?.[field.key] || null,
							align: layoutOptions.value?.align?.[field.key] || 'left',
							field: {
								display: field.meta?.display || getDefaultDisplayForType(field.type),
								displayOptions: field.meta?.display_options,
								interface: field.meta?.interface,
								interfaceOptions: field.meta?.options,
								type: field.type,
								field: field.field,
								collection: field.collection,
							},
							sortable:
								['json', 'o2m', 'm2o', 'm2m', 'm2a', 'file', 'files', 'alias', 'presentation', 'translations'].includes(
									field.type
								) === false && field.key.includes('.') === false,
						} as HeaderRaw;
					});
				},
				set(val) {
					const widths = {} as { [field: string]: number };

					val.forEach((header) => {
						if (header.width) {
							widths[header.value] = header.width;
						}
					});

					localWidths.value = widths;

					saveWidthsToLayoutOptions();

					fields.value = val.map((header) => header.value);
				},
			});

			const tableSpacing = syncRefProperty(layoutOptions, 'spacing', 'cozy');

			const tableRowHeight = computed<number>(() => {
				switch (tableSpacing.value) {
					case 'compact':
						return 32;
					case 'cozy':
					default:
						return 48;
					case 'comfortable':
						return 64;
				}
			});

			return {
				tableSort,
				tableHeaders,
				tableSpacing,
				tableRowHeight,
				onRowClick,
				onSortChange,
				onAlignChange,
				activeFields,
				getFieldDisplay,
			};

			function onRowClick({ item, event }: { item: Item; event: PointerEvent }) {
				if (props.readonly === true || !primaryKeyField.value) return;

				const primaryKey = item[primaryKeyField.value.field];

				if (props.selectMode || selection.value?.length > 0) {
					if (selection.value?.includes(primaryKey) === false) {
						selection.value = selection.value.concat(primaryKey);
					} else {
						selection.value = selection.value.filter((item) => item !== primaryKey);
					}
				} else {
					const next = router.resolve(`/content/${collection.value}/${encodeURIComponent(primaryKey)}`);

					if (event.ctrlKey || event.metaKey) window.open(next.href, '_blank');
					else router.push(next);
				}
			}

			function onSortChange(newSort: { by: string; desc: boolean }) {
				let sortString = newSort.by;
				if (!newSort.by) {
					sort.value = [];
					return;
				}
				if (newSort.desc === true) {
					sortString = '-' + sortString;
				}
				sort.value = [sortString];
			}

			function onAlignChange(field: string, align: 'left' | 'center' | 'right') {
				layoutOptions.value = Object.assign({}, layoutOptions.value, {
					align: {
						...(layoutOptions.value?.align ?? {}),
						[field]: align,
					},
				});
			}

			function getFieldDisplay(fieldKey: string) {
				const field = fieldsInCollection.value.find((field: Field) => field.field === fieldKey);

				if (!field?.meta?.display) return null;

				return {
					display: field.meta.display,
					options: field.meta.display_options,
				};
			}
		}
	},
});
