<template>
	<div class="w-full h-full">
		<div v-if="nomenclatureStore.loadAnalogList" class="w-full h-full absolute disabled z-[1]" />
		<q-form ref="analogItemForm" class="pb-4">
			<!-- Full name -->
			<div class="flex items-center w-full">
				<div class="text-bold w-[200px]">{{ t('product_request.full_name') }}:</div>
				<div class="pl-2">
					<v-checkbox v-model="itemForm.is_full_name" @update:modelValue="onCheckFullName($event)" />
				</div>
				<q-input
					v-model="itemForm.full_name"
					outlined
					color="primary"
					class="custom-min flex-1 pl-2"
					:rules="[(val) => val && val.length > 0]"
					:readonly="itemForm.is_full_name"
				/>
			</div>
			<!-- Item type -->
			<div class="flex items-center w-full pt-2">
				<div class="text-bold w-[200px]">{{ t('product_request.item_type') }}:</div>
				<div class="flex-1">
					<q-select
						v-model="itemForm.item_type"
						outlined
						:options="itemForm.item_type_list"
						option-value="name"
						option-label="name"
						color="primary"
						class="custom-min flex-1 pl-2"
					/>
				</div>
			</div>
			<!-- Nomenclature type -->
			<div class="flex items-center w-full pt-2">
				<div class="text-bold w-[200px]">{{ t('product_request.nomenclature_type') }}:</div>
				<div class="flex items-center flex-1 max-w-[200px]">
					<q-select
						v-model="itemForm.kind"
						outlined
						map-options
						:options="itemForm.kind_list"
						option-value="value"
						option-label="name"
						color="primary"
						class="custom-min flex-1 pl-2"
					/>
				</div>
				<!-- Kit -->
				<div class="flex items-center flex-1">
					<q-separator vertical class="!ml-1" />
					<v-checkbox
						v-model="itemForm.is_kit"
						@update:modelValue="(val) => (itemForm.subkind = !val ? '' : itemForm.subkind)"
					/>
					<div class="pl-2">{{ t('product_request.set') }}:</div>
					<div class="flex-1 pl-2">
						<q-select
							v-model="itemForm.subkind"
							outlined
							map-options
							:options="itemForm.subkind_list"
							option-value="value"
							option-label="name"
							color="primary"
							class="custom-min flex-1 pl-2"
							:readonly="!itemForm.is_kit"
						/>
					</div>
				</div>
			</div>
			<!-- Nomenclature class -->
			<div class="flex items-center w-full pt-2">
				<div class="text-bold w-[200px]">{{ t('product_request.nomenclature_class') }}:</div>
				<q-select
					v-model="itemForm.class"
					outlined
					map-options
					:options="itemForm.class_list"
					option-value="value"
					option-label="name"
					color="primary"
					class="custom-min flex-1 pl-2"
					@update:model-value="(val) => onClassChange(val)"
				/>
			</div>
			<!-- Product type -->
			<div class="flex items-center w-full pt-2">
				<div class="text-bold w-[200px]">{{ t('product_request.product_type') }}:</div>
				<q-input v-model="itemForm.product_type" outlined color="primary" class="custom-min flex-1 pl-2" />
			</div>
			<!-- Add product type -->
			<div class="flex items-center w-full pt-2">
				<div class="text-bold w-[200px]">{{ t('product_request.add_product_type') }}:</div>
				<q-input v-model="itemForm.additional_options" outlined color="primary" class="custom-min flex-1 pl-2" />
			</div>
			<!-- Modele Article Size -->
			<div class="flex items-center w-full pt-2">
				<div class="text-bold w-[200px]">{{ t('product_request.model_article_typesize') }}:</div>
				<div class="flex items-center flex-1">
					<q-input
						v-model="itemForm.ic"
						outlined
						color="primary"
						class="custom-min flex-1 pl-2"
						:error="[(val) => val && val.length > 0]"
					/>
				</div>
				<!-- Type -->
				<div class="flex-1 pl-2">
					<q-select
						v-model="itemForm.code_type"
						outlined
						map-options
						:options="itemForm.code_type_list"
						option-value="id"
						option-label="name"
						color="primary"
						class="custom-min"
					/>
				</div>
			</div>
			<!-- Trademark or ND -->
			<div class="flex items-center w-full pt-2">
				<div class="text-bold w-[200px]">{{ t('product_request.trademark_nd') }}:</div>
				<q-select
					v-model="itemForm.suplr"
					outlined
					use-input
					map-options
					option-value="id"
					option-label="name"
					color="primary"
					class="custom-min flex-1 pl-2"
					input-debounce="700"
					:options="itemForm.suplr_list"
					:rules="[() => !!itemForm.suplr]"
					@filter="
						(val, upd, abort) => {
							filterSUPLR({ val, upd, abort });
						}
					"
				/>
			</div>
			<!-- Status -->
			<div class="flex items-center w-full pt-2">
				<div class="text-bold w-[200px]">{{ t('product_request.status') }}:</div>
				<q-select
					v-model="itemForm.status"
					outlined
					map-options
					:options="itemForm.status_list"
					option-value="name"
					option-label="name"
					color="primary"
					class="custom-min flex-1 pl-2"
				/>
			</div>
			<!-- UOM -->
			<uom :index-group="indexGroup" :index-item="indexItem" />
			<!-- Status localization -->
			<div class="flex items-center w-full pt-2">
				<div class="text-bold w-[200px]">{{ t('product_request.localization_status') }}:</div>
				<q-select
					v-model="itemForm.status_localization"
					outlined
					map-options
					:options="itemForm.status_localization_list"
					option-value="value"
					option-label="name"
					color="primary"
					class="custom-min flex-1 pl-2"
				/>
			</div>
			<q-separator class="!mt-3" />
			<!-- Classifiers -->
			<classifiers class="w-full" :index-group="indexGroup" :index-item="indexItem" />
			<q-separator class="!mt-3" />
			<!-- Product group -->
			<product-group class="w-full" :index-group="indexGroup" :index-item="indexItem" />
			<q-separator class="!mt-3" />
			<!-- Supplier product groups -->
			<supplier-product-group class="w-full" :index-group="indexGroup" :index-item="indexItem" />
			<q-separator class="!mt-3" />
			<!-- Weight and dimensions and special conditions -->
			<weight-characteristic class="w-full" :index-group="indexGroup" :index-item="indexItem" />
			<q-separator class="!mt-3" />
			<!-- External certification -->
			<div class="flex items-center w-full pt-2">
				<v-checkbox v-model="itemForm.external_certification" />
				<div class="pl-4">{{ t('product_request.external_certification') }}</div>
			</div>
			<q-separator class="!mt-3" />
			<!-- Container compound -->
			<div class="pt-2">
				<compound title="Базовый состав Sever Minerals" />
			</div>
		</q-form>
		<!-- Dialog -->
		<v-dialog v-model="confirmDialog.is" persistent @esc="confirmDialog.is = false">
			<v-card>
				<v-card-title>{{ confirmDialog.text }}</v-card-title>
				<v-card-actions>
					<v-button secondary @click="confirmDialog.cancel">
						{{ t('cancel') }}
					</v-button>
					<v-button class="success" @click="confirmDialog.ok">OK</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script lang="ts" setup>
import { PropType, ref, unref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { AnalogListType } from '@directus/nest-api/general-types';
import { useNomenclatureStore } from '../../stores/nomenclature.ts';
import { storeToRefs } from 'pinia';
import { isSN, confirmUpdateAllAnalogueItems } from '../../../composables/rules.ts';
import Compound from './form-components/compound.vue';

import Uom from './form-components/uom.vue';
import Classifiers from './form-components/classifiers.vue';
import ProductGroup from './form-components/product-group.vue';
import SupplierProductGroup from './form-components/supplier-product-group.vue';
import WeightCharacteristic from './form-components/weight-characteristic.vue';

const icMask = ref(() => ''),
	icPlaceholder = ref(() => ''),
	onInputIC = ref(() => true),
	getSUPLR = ref(() => []),
	analogItemForm: null | AnalogListType = ref(null);

const nomenclatureStore = useNomenclatureStore();
const { containerAnalogue } = storeToRefs(nomenclatureStore);

const rules = () => import('../../../composables/rules.ts');
rules().then((data) => {
	icMask.value = data.icMask;
	icPlaceholder.value = data.icPlaceholder;
	onInputIC.value = data.onInputIC;
	getSUPLR.value = data.getSUPLR;
});

interface Props {
	needData: boolean;
	indexGroup: string;
	indexItem: number | null;
	analogList: PropType<AnalogListType>;
}

const props = withDefaults(defineProps<Props>(), {
	needData: false,
	indexGroup: '',
	indexItem: null,
	analogList: {},
});

const emit = defineEmits(['update-data']);

const { t } = useI18n();
const itemForm = ref(containerAnalogue.value[props.indexGroup][props.indexItem]);
const originalForm = JSON.parse(JSON.stringify(itemForm.value));

const confirmDialog = ref({
	is: false,
	text: '',
	cancel: null,
	ok: null,
});

const onCheckFullName = (val: string): void => {
	if (val && itemForm.value.full_name !== nomenclatureStore.getProduct.name) {
		confirmDialog.value = {
			cancel: onCancelChangeFullName,
			ok: onSaveFullName,
			text: t('product_request.change_full_name', { name: nomenclatureStore.getProduct.name }),
			is: true,
		};
	}
};

const filterSUPLR = async ({ val, upd }): void => {
	if (!itemForm.value.suplr?.id && !val)
		itemForm.value.suplr_list = await unref(getSUPLR)(nomenclatureStore, itemForm.value);
	upd(async () => {
		if (!val) return;
		itemForm.value.suplr_list = await unref(getSUPLR)(nomenclatureStore, itemForm.value, val);
	});
};

const onClassChange = async (val): void => {
	const trademark = await nomenclatureStore.fetchTrademark(val.value, '');
	itemForm.value.suplr_list = trademark;
	itemForm.value.suplr = isSN(itemForm.value) ? trademark[0] : '';

	if (isSN(itemForm.value)) {
		if (!itemForm.value.ic.match(/^SN\d{6,6}$/g)) {
			const snCode = await nomenclatureStore.getSNCode();
			itemForm.value.ic = snCode;
		}
	} else if (itemForm.value.ic.match(/^SN\d{6,6}$/g)) {
		itemForm.value.ic = nomenclatureStore.getProduct.article || '';
	}
};

watch(
	() => props.needData,
	(val: boolean): void => {
		if (val) {
			analogItemForm.value.validate().then((valid) => {
				const needUpdateAnalogItems = confirmUpdateAllAnalogueItems(
					containerAnalogue.value,
					originalForm,
					itemForm.value,
					t
				);
				if (needUpdateAnalogItems.is) {
					confirmDialog.value = {
						cancel: () => (confirmDialog.value.is = false),
						ok: () => (confirmDialog.value.is = false),
						text: `${t('product_request.confirm_chancge_all_analog_items')} - ${needUpdateAnalogItems.msg.join(', ')}`,
						is: true,
					};
				}
				emit('update-data', {
					form: itemForm.value,
					indexGroup: props.indexGroup,
					indexItem: props.indexItem,
					valid: valid,
				});
			});
		}
	}
);

function onSaveFullName(): void {
	itemForm.value.full_name = nomenclatureStore.getProduct.name;
	confirmDialog.value.is = false;
}

function onCancelChangeFullName(): void {
	confirmDialog.value.is = false;
	itemForm.value.is_full_name = false;
}
</script>

<style lang="scss" scoped>
.v-button.success {
	--v-button-background-color: var(--success);
	--v-button-background-color-hover: var(--success-125);
}
</style>
