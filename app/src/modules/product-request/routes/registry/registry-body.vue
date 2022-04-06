<template>
	<div>
		<!-- Filter bar -->
		<div class="flex flex-nowrap items-center w-full">
			<div
				v-for="(item, idx) in FilterItems"
				:key="item.code"
				class="px-1 first:px-0 last:px-0"
				:class="{ 'ml-auto order-2': item.align === 'right' }"
			>
				<div
					class="cursor-pointer p-1 text-white rounded-sm duration-100"
					:class="{
						'bg-[color:var(--primary)]': !item.pressed,
						'bg-[color:var(--primary-150)]': item.pressed,
						hidden: item.hidden === props.type,
					}"
					@click="onSetFilter(item.code, idx)"
				>
					{{ t(item.name) }}
				</div>
			</div>
		</div>
		<!-- Table -->
		<v-table
			v-model="ordersStore.selectionWritable"
			v-model:headers="tableHeaders"
			class="!h-[calc(100vh-188px)] mt-2"
			:loading="ordersStore.load"
			:items="ordersStore.getOrders"
			:row-height="60"
			show-resize
			show-select
			selection-use-keys
			fixed-header
			item-key="id"
			@dblclick:row="onRowDblClick"
		>
			<template #header-context-menu="{ header }">
				<v-list v-if="header.inputSearch?.enable">
					<v-list-item>
						<div>
							<input
								:data-index="header.value"
								:value="header.inputSearch.value.value"
								type="search"
								class="rounded-sm w-full border-0 border-b-[1px] border-gray-400 px-1 text-gray-500 text-sm pr-3"
								:placeholder="header.inputSearch?.placeholder"
								@input="onSearchQuery($event, header.value)"
								@click.stop
							/>
							<v-icon
								:name="header.inputSearch.value.value ? 'close' : 'search'"
								:data-index="header.value"
								:font-size="17"
								class="!absolute right-0 cursor-pointer"
								:class="[header.inputSearch.value.value ? '!text-red-400' : '!text-gray-400']"
								@click.stop="onClearInput($event, header.value)"
							/>
						</div>
					</v-list-item>
				</v-list>
			</template>
		</v-table>
		<!-- Pagination -->
		<div class="sticky bottom-0 flex items-center justify-between w-full bg-white">
			<div class="inline-block">
				<v-pagination
					v-if="ordersStore.getTotalPages > 1"
					:total-visible="7"
					:length="ordersStore.getTotalPages"
					show-first-last
					:model-value="ordersStore.getPage"
					@update:model-value="toPage"
				/>
			</div>
			<div v-if="!ordersStore.load" class="flex items-center justify-end w-[240px]">
				<span class="w-auto mr-4">{{ t('qty_rows') }}:</span>
				<v-select
					:model-value="`${ordersStore.getLimit}`"
					:items="['10', '25', '50', '100', '500', 'All']"
					inline
					@update:model-value="setLimit"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useOrderStore } from '../stores/orders.ts';
import { HeaderRaw } from '@/components/v-table/types';
import { OrderSearchType } from '@directus/nest-api/general-types';

interface Props {
	type: string;
	isReload: boolean;
}
const props = withDefaults(defineProps<Props>(), {
	type: 'active',
	isReload: false,
});

const { t, n } = useI18n(),
	delaySearchTimer = ref();

const router = useRouter();

const ordersStore = useOrderStore();
ordersStore.loadOrders(t, n, props.type);

ordersStore.selectionWritable = [];

let selectedFilter = [],
	searchQuery;
// Filtre
const onSetFilter = (code, idx): void => {
	if (!ordersStore.load) {
		ordersStore.page = 1;
		(selectedFilter = []), (ordersStore.selectionWritable = []);
		const currentPressed = FilterItems.value[idx].pressed;
		let countPressed = 0;

		if (code === 'clear_all_filters') {
			if (!currentPressed) {
				selectedFilter = [];
				FilterItems.value.forEach((i) => {
					i.code !== 'clear_all_filters' ? (i.pressed = false) : (i.pressed = true);
				});
			}
		} else {
			const clearBtn = FilterItems.value.find((i) => i.code === 'clear_all_filters');
			FilterItems.value[idx].pressed = !FilterItems.value[idx].pressed;
			clearBtn.pressed = false;
			FilterItems.value.forEach((i) => {
				if (i.pressed) {
					countPressed++;
					selectedFilter.push(i.code);
				}
			});
			if (countPressed === 0) {
				clearBtn.pressed = true;
				selectedFilter = [];
			}
		}
		ordersStore.loadOrders(t, n, props.type, selectedFilter.join(','), searchQuery);
	}
};

const FilterItems = ref([
	{
		code: 'all_unallocated_orders',
		name: 'product_request.all_unallocated_orders',
		pressed: false,
		// hidden: 'archive'
	},
	{
		code: 'my_orders',
		name: 'product_request.my_orders',
		pressed: false,
	},
	{
		code: 'clear_all_filters',
		name: 'clear_all_filters',
		pressed: true,
		align: 'right',
	},
]);
// Table headers
const tableHeaders = ref<HeaderRaw[]>([
	{
		text: t('product_request.order_number'),
		value: 'order_number',
		width: 140,
		inputSearch: {
			enable: true,
			placeholder: t('search'),
			type: 'number',
			strict: false,
			value: {},
		},
	},
	{
		text: t('product_request.status'),
		value: 'status_link.status_type.name',
		width: 140,
		cellWrap: true,
		inputSearch: {
			enable: true,
			placeholder: t('search'),
			value: {},
		},
	},
	{
		text: t('product_request.priority'),
		value: 'priority.name',
		width: 140,
		inputSearch: {
			enable: true,
			placeholder: t('search'),
			value: {},
		},
		class: 'flex items-center',
		render: (item): string => {
			if (item.priority.code == 'low')
				return `<i class="font-material not-italic text-green-300 mr-1">trip_origin</i> ${item.priority.name}`;
			else if (item.priority.code == 'middle')
				return `<i class="font-material not-italic text-yellow-300 mr-1">trip_origin</i> ${item.priority.name}`;
			else if (item.priority.code == 'high')
				return `<i class="font-material not-italic text-red-400 mr-1">trip_origin</i> ${item.priority.name}`;
			else return `<i class="font-material not-italic mr-1">trip_origin</i> ${item.priority.name}`;
		},
		// renderClass: (item) => {
		//   if(item.priority.code == 'low') return 'text-green-500'
		//   if(item.priority.code == 'middle') return 'text-yellow-300'
		//   if(item.priority.code == 'high') return 'text-red-500'
		// }
	},
	{
		text: t('theme'),
		value: 'theme',
		sortable: true,
		// width: '10fr',
		width: 200,
		inputSearch: {
			enable: true,
			placeholder: t('search'),
			value: {},
		},
		cellWrap: true,
		class: 'select-text cursor-text leading-[18px]',
	},
	{
		text: t('product_request.order_initiator'),
		value: 'initiator.person.full_name_ru',
		width: 140,
		inputSearch: {
			enable: true,
			placeholder: t('search'),
			value: {},
		},
		cellWrap: true,
		tooltip: {
			text: false,
			class: 'underline',
			map: 'initiator.unit_position.position.name',
		},
	},
	{
		text: t('product_request.order_executor'),
		value: 'executor.person.full_name_ru',
		width: 140,
		inputSearch: {
			enable: true,
			placeholder: t('search'),
			value: {},
		},
		cellWrap: true,
		tooltip: {
			text: false,
			class: 'underline',
			map: 'executor.unit_position.position.name',
		},
	},
	{
		text: t('product_request.qty_products'),
		value: 'product_list',
		width: 120,
		count: true,
		// class: 'text-center w-full'
	},
]);

function toPage(newPage): void {
	ordersStore.page = newPage;
	ordersStore.loadOrders(t, n, props.type, selectedFilter.join(','), searchQuery);
}

function setLimit(newLimit): void {
	ordersStore.page = 1;
	ordersStore.limit = newLimit;
	ordersStore.loadOrders(t, n, props.type, selectedFilter.join(','), searchQuery);
}

const onSearchQuery = (event: Event, headerName: string): void => {
	const header = tableHeaders.value.find((i) => i.value === headerName);
	header.inputSearch.value = {
		index: headerName,
		value: event.target.value,
		type: header.inputSearch?.type,
		strict: header.inputSearch?.strict,
	} as OrderSearchType;
	ordersStore.selectionWritable = [];
	ordersStore.page = 1;

	let searchQuery: Array<OrderSearchType> = [];
	tableHeaders.value.forEach((i) => {
		if (i.inputSearch && i.inputSearch.value.index) searchQuery.push(i.inputSearch.value);
	});
	clearTimeout(delaySearchTimer.value);
	delaySearchTimer.value = setTimeout(() => {
		ordersStore.loadOrders(t, n, props.type, selectedFilter.join(','), JSON.stringify(searchQuery));
	}, 600);
};

function onClearInput(event: Event, headerName: string): void {
	const header = tableHeaders.value.find((i) => i.value === headerName);
	header.inputSearch.value = {};
	setTimeout(() => document.querySelector(`[data-index="${headerName}"]`).dispatchEvent(new Event('input')));
}

const onRowDblClick = (item): void => {
	ordersStore.selectionWritable = [];
	router.push(`${props.type}/${item.id}`);
};

const reload = (): void => {
	ordersStore.loadOrders(t, n, props.type, selectedFilter.join(','), searchQuery);
};

watch((): void => props.isReload, reload);
</script>
