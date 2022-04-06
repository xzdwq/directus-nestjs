<template>
	<div class="w-full">
		<div v-if="props.store.length > 0 || cardStore.getSearchProductQuery" class="w-full">
			<!-- Products filter bar -->
			<div class="mt-2 p-1 flex items-center w-full">
				<!-- <div>{{ t('product_request.product_title') }}:</div> -->
				<!-- <search-input
					v-model="generalSearchQuery"
					class="!h-[32px]"
					open
					:delay="600"
					@update:modelValue="onGeneralSearch"
				/> -->
				<div class="relative mr-2 whitespace-nowrap text-[#a2b5cd] font-semibold ml-auto order-2">
					{{ t('item_count', props.store.length) }} {{ t('of') }} {{ cardStore.getOrder.product_list.length }}
				</div>
			</div>
			<!-- Products -->
			<v-table
				v-model:headers="tableHeaders"
				class="mt-1 pr-1 !lg:h-full !h-[calc(100vh-360px)] w-full !overflow-y-scroll"
				:loading="cardStore.getSearchProductLoad"
				:items="props.store"
				:row-height="70"
				fixed-header
				show-expand-row
				show-header-expand-row="collapsed"
				item-key="id"
				@update:searchQuery="onSearchQuery"
			>
				<template #item-expanded="{ item }">
					<div class="flex p-2">
						<q-input
							v-model="item.article"
							:label="t('product_request.manufacturers_article')"
							color="primary"
							class="w-[450px] pr-4"
							type="text"
							:readonly="true"
						/>
						<q-input
							v-model="item.product_list_selected[0].article"
							:label="t('product_request.manufacturers_article')"
							color="primary"
							class="w-[450px]"
							type="text"
							:readonly="true"
						/>
					</div>
					<div class="flex p-2">
						<q-input
							v-model="item.unit"
							:label="t('product_request.unit_measurement')"
							color="primary"
							class="w-[450px] pr-4"
							type="text"
							:readonly="true"
						/>
						<q-input
							v-model="item.product_list_selected[0].unit"
							:label="t('product_request.unit_measurement')"
							color="primary"
							class="w-[450px]"
							type="text"
							:readonly="true"
						/>
					</div>
					<div class="flex p-2">
						<q-input
							v-model="item.product_group"
							:label="t('product_request.product_group')"
							color="primary"
							class="w-[450px] pr-4"
							type="text"
							:readonly="true"
						/>
						<q-input
							v-model="item.product_list_selected[0].product_group"
							:label="t('product_request.product_group')"
							color="primary"
							class="w-[450px]"
							type="text"
							:readonly="true"
						/>
					</div>
					<div class="flex p-2">
						<q-input
							v-model="item.file"
							:label="t('product_request.file')"
							color="primary"
							class="w-[450px] pr-4"
							type="text"
							:readonly="true"
						/>
						<q-input
							v-model="item.product_list_selected[0].file"
							:label="t('product_request.file')"
							color="primary"
							class="w-[450px]"
							type="text"
							:readonly="true"
						/>
					</div>
					<div class="flex p-2">
						<q-input
							v-model="item.comment"
							:label="t('product_request.comment')"
							color="primary"
							class="w-[450px] pr-4"
							type="text"
							:readonly="true"
						/>
						<q-input
							v-model="item.product_list_selected[0].comment"
							:label="t('product_request.comment')"
							color="primary"
							class="w-[450px]"
							type="text"
							:readonly="true"
						/>
					</div>
				</template>
				<template v-if="route.name.includes('active')" #item-append="{ item }">
					<div class="w-[130px]">
						<div
							class="w-full cursor-pointer p-1 text-white rounded-sm duration-300 flex justify-center"
							:class="[
								!item.product_list_analog.length ? 'bg-green-400 hover:bg-green-500' : 'bg-blue-400 hover:bg-blue-500',
							]"
							@click.stop="onNomenclature(item)"
						>
							<span>{{ !item.product_list_analog.length ? t('create') : t('edit') }}</span>
						</div>
						<div
							class="
								w-full
								mt-1
								cursor-pointer
								p-1
								bg-gray-400
								hover:bg-gray-500
								text-white
								rounded-sm
								duration-300
								flex
								justify-center
							"
							@click.stop
						>
							<span>{{ t('selecting') }}</span>
						</div>
					</div>
				</template>
			</v-table>
		</div>
		<v-info v-else :title="t('product_request.no_data')" center class="pt-[50px]">
			<div>
				{{ t('product_request.no_data_products_info') }}
			</div>
		</v-info>
	</div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { HeaderRaw } from '@/components/v-table/types';

import { useCardStore } from '../../stores/card.ts';

const { t } = useI18n();
const cardStore = useCardStore(),
	route = useRoute(),
	router = useRouter(),
	generalSearchQuery = ref();

let searchQuery;

const props = defineProps({
	// eslint-disable-next-line vue/require-default-prop
	store: [Array],
});

// Table headers
const tableHeaders = ref<HeaderRaw[]>([
	{
		text: t('product_request.original_entry'),
		value: 'name',
		width: 450,
		cellWrap: true,
	},
	{
		text: t('product_request.selected_entry'),
		value: 'product_list_selected[0].name',
		width: 450,
		cellWrap: true,
		emptyText: t('product_request.waiting_filled'),
	},
]);

const onSearchQuery = (params): void => {
	searchQuery = JSON.stringify(params);
	cardStore.searchProductQuery = searchQuery;
	cardStore.getProductQuery;
};

const onNomenclature = (item): void => {
	const containerId = item.product_list_analog[0]?.id || 0;
	router.push(`${route.params.primaryKey}/nomenclature/${item.id}/${containerId}`);
};

// const onGeneralSearch = (): void => {
// 	cardStore.searchProductQuery = generalSearchQuery.value;
// 	cardStore.getProductQuery;
// };
</script>
