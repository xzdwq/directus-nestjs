<template>
	<div>
		<!-- UOM -->
		<div class="flex items-center w-full pt-2">
			<div class="text-bold w-[200px]">{{ t('product_request.base_uom') }}:</div>
			<q-select
				v-model="itemForm.uom"
				outlined
				use-input
				map-options
				:options="itemForm.uom_list"
				option-value="id"
				option-label="name"
				color="primary"
				class="custom-min flex-1 pl-2"
				:rules="[() => !!itemForm.uom]"
				@filter="(val, upd, abort) => filterUOM({ val, upd, abort }, 'uom_list', 'name')"
			/>
		</div>
		<!-- UOM storage balances -->
		<div class="flex items-center w-full pt-2">
			<div class="text-bold w-[200px]">{{ t('product_request.uom_storage_balances') }}:</div>
			<q-select
				v-model="itemForm.uom_storage_balances"
				outlined
				use-input
				map-options
				:options="itemForm.uom_storage_balances_list"
				option-value="id"
				option-label="name"
				color="primary"
				class="custom-min flex-1 pl-2"
				:rules="[() => !!itemForm.uom_storage_balances]"
				@filter="(val, upd, abort) => filterUOM({ val, upd, abort }, 'uom_storage_balances_list', 'name')"
			/>
		</div>
		<!-- UOM reports -->
		<div class="flex items-center w-full pt-2">
			<div class="text-bold w-[200px]">{{ t('product_request.uom_reports') }}:</div>
			<q-select
				v-model="itemForm.uom_reports"
				outlined
				use-input
				map-options
				:options="itemForm.uom_reports_list"
				option-value="id"
				option-label="name"
				color="primary"
				class="custom-min flex-1 pl-2"
				:rules="[() => !!itemForm.uom_reports]"
				@filter="(val, upd, abort) => filterUOM({ val, upd, abort }, 'uom_reports_list', 'name')"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import { useNomenclatureStore } from '../../../stores/nomenclature.ts';

interface Props {
	indexGroup: string;
	indexItem: number | null;
}

const props = withDefaults(defineProps<Props>(), {
	indexGroup: '',
	indexItem: null,
});

const { t } = useI18n(),
	nomenclatureStore = useNomenclatureStore();

const { containerAnalogue } = storeToRefs(nomenclatureStore);
const itemForm = ref(containerAnalogue.value[props.indexGroup][props.indexItem].uom);

const filterUOM = ({ val, upd }, propList: string, propName: string): void => {
	if (!itemForm.value?.id && !val) {
		upd(() => {
			itemForm.value[propList] = nomenclatureStore.getUOMList;
		});
		return;
	}
	upd(() => {
		itemForm.value[propList] = nomenclatureStore.getUOMList.filter(
			(v) => v[propName].toLowerCase().indexOf(val.toLowerCase()) > -1
		);
	});
};
</script>
