<template>
	<div>
		<div class="text-bold w-full pt-2">{{ t('product_request.weight_dimensions_special_conditions') }}</div>
		<div class="flex items-center w-full pt-2">
			<v-checkbox v-model="weightCharacteristic.inherited_analogs_container" />
			<div class="pl-4">{{ t('product_request.inherited_analogs_container') }}</div>
		</div>
		<!-- Mass -->
		<div class="flex items-center w-full pt-2">
			<div class="text-bold w-[200px]">{{ t('product_request.mass') }}:</div>
			<q-input
				v-model="weightCharacteristic.mass"
				outlined
				type="number"
				min="0.001"
				step="1"
				color="primary"
				class="custom-min flex-1 pl-2"
				:placeholder="t('product_request.enter_value')"
			/>
			<q-select
				v-model="weightCharacteristic.mass_uom"
				outlined
				map-options
				:options="weightCharacteristic.mass_list"
				option-value="id"
				option-label="name"
				color="primary"
				class="custom-min flex-1 pl-2 min-w-[300px]"
			/>
		</div>
		<!-- Lenght -->
		<div class="flex items-center w-full pt-2">
			<div class="text-bold w-[200px]">{{ t('product_request.length') }}:</div>
			<q-input
				v-model="weightCharacteristic.length"
				outlined
				type="number"
				min="0.001"
				step="1"
				color="primary"
				class="custom-min flex-1 pl-2"
				:placeholder="t('product_request.enter_value')"
			/>
			<q-select
				v-model="weightCharacteristic.length_uom"
				outlined
				map-options
				:options="weightCharacteristic.length_list"
				option-value="id"
				option-label="name"
				color="primary"
				class="custom-min flex-1 pl-2 min-w-[300px]"
			/>
		</div>
		<!-- Width -->
		<div class="flex items-center w-full pt-2">
			<div class="text-bold w-[200px]">{{ t('product_request.width') }}:</div>
			<q-input
				v-model="weightCharacteristic.width"
				outlined
				type="number"
				min="0.001"
				step="1"
				color="primary"
				class="custom-min flex-1 pl-2"
				:placeholder="t('product_request.enter_value')"
			/>
			<q-select
				v-model="weightCharacteristic.width_uom"
				outlined
				map-options
				:options="weightCharacteristic.width_list"
				option-value="id"
				option-label="name"
				color="primary"
				class="custom-min flex-1 pl-2 min-w-[300px]"
			/>
		</div>
		<!-- Height -->
		<div class="flex items-center w-full pt-2">
			<div class="text-bold w-[200px]">{{ t('product_request.height') }}:</div>
			<q-input
				v-model="weightCharacteristic.height"
				outlined
				type="number"
				min="0.001"
				step="1"
				color="primary"
				class="custom-min flex-1 pl-2"
				:placeholder="t('product_request.enter_value')"
			/>
			<q-select
				v-model="weightCharacteristic.height_uom"
				outlined
				map-options
				:options="weightCharacteristic.height_list"
				option-value="id"
				option-label="name"
				color="primary"
				class="custom-min flex-1 pl-2 min-w-[300px]"
			/>
		</div>
		<div class="flex items-center justify-between w-full pt-2">
			<!-- Oversized -->
			<div class="flex">
				<v-checkbox v-model="weightCharacteristic.is_oversized" />
				<div class="pl-4">{{ t('product_request.oversized') }}</div>
			</div>
			<!-- Full container load -->
			<div class="flex">
				<v-checkbox v-model="weightCharacteristic.is_fcl" />
				<div class="pl-4">{{ t('product_request.fcl') }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
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
	nomenclatureStore = useNomenclatureStore(),
	{ containerAnalogue } = storeToRefs(nomenclatureStore);

const weightCharacteristic = ref(containerAnalogue.value[props.indexGroup][props.indexItem].weight_characteristic);
</script>
