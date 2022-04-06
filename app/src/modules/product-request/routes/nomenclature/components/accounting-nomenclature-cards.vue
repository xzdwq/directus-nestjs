<template>
	<div class="w-full">
		<q-expansion-item
			default-opened
			expand-icon-toggle
			expand-separator
			class="font-bold text-lg bg-[#daf3ff] !p-2 w-full rounded-lg"
		>
			<template #header>
				<q-item-section avatar>
					<q-avatar icon="local_shipping" />
				</q-item-section>
				<q-item-section>{{ t('product_request.supplied') }} ({{ accountingNomenclature.length }})</q-item-section>
				<q-item-section side>
					<q-btn
						class="ml-auto order-2"
						color="primary"
						icon="add"
						no-caps
						:label="t('add_existing')"
						:disable="!analogSaveInfo.countSaveAnalogItem"
						:loading="nomenclatureStore.getLoadAnalofList"
						@click="onAddAcountingList"
					/>
				</q-item-section>
			</template>
			<!-- Body -->
			<div class="overflow-x-auto bg-white rounded-lg">
				<div
					v-if="!accountingNomenclature.length || !analogSaveInfo.countSaveAnalogItem"
					class="
						w-full
						flex
						justify-center
						items-center
						text-gray-500
						border-4 border-dashed border-gray-400
						py-2
						h-20
						text-center
					"
				>
					<span v-if="!analogSaveInfo.countSaveAnalogItem">
						{{ t('product_request.accounting_waiting_filled_not_save') }}
					</span>
					<span v-else-if="!accountingNomenclature.length">{{ t('product_request.accounting_waiting_filled') }}</span>
				</div>
				<div v-else class="min-w-[1000px]">
					<!-- Header -->
					<div class="w-full grid grid-cols-acc gap-1 font-bold text-lg">
						<div></div>
						<div class="flex items-end">{{ t('product_request.ic') }}</div>
						<div />
						<div class="h-full flex flex-nowrap items-end col-[span_2_/_span_4]">
							<div class="flex-1">{{ t('product_request.article') }}</div>
							<div class="flex-1">{{ t('product_request.name_suplr') }}</div>
						</div>
						<div />
						<div class="flex items-end">{{ t('product_request.company') }}</div>
						<div />
					</div>
					<!-- Accounting list -->
					<div class="w-full font-normal">
						<div
							v-for="(item, idxItem) in accountingNomenclature"
							:key="item.id"
							class="
								w-full
								grid grid-cols-acc
								gap-1
								pr-1
								py-1
								border-x-0 border-t-0 border-b border-solid border-gray-300
								last:border-none
							"
						>
							<div class="h-full flex justify-center items-start">
								<q-btn icon="edit" @click="item.save = false" />
							</div>
							<!-- IC -->
							<q-select
								v-model="item.ic"
								outlined
								map-options
								:options="analogSaveInfo.analogSaveList"
								option-value="value"
								option-label="ic"
								color="primary"
								class="custom-min"
								:error="onValid(item.ic)"
								:readonly="item.save"
							>
								<template #selected-item="scope">
									<span>{{ scope.opt.ic }}</span>
									-
									<span class="text-xs text-gray-500">{{ scope.opt.suplr_name }}</span>
								</template>
								<template #option="scope">
									<q-item v-bind="scope.itemProps">
										<q-item-section>
											<q-item-label>{{ scope.opt.ic }}</q-item-label>
											<q-item-label caption>{{ scope.opt.suplr_name }}</q-item-label>
											<q-item-label caption>{{ scope.opt.group_name }}</q-item-label>
										</q-item-section>
									</q-item>
								</template>
							</q-select>
							<!-- Article Supplier -->
							<div class="col-[span_4_/_span_6]">
								<div
									v-for="(as, idxAs) in item.articleSupplierList"
									:key="as.id"
									class="flex flex-nowrap items-center first:pt-0 pt-1"
								>
									<v-checkbox
										v-model="as.primary"
										:disabled="item.save"
										:font-size="30"
										class="pr-1"
										@update:modelValue="onCheck($event, idxItem, idxAs)"
									/>
									<!-- Article -->
									<q-select
										v-model="as.article"
										outlined
										map-options
										:options="analogSaveInfo.analogSaveList"
										option-value="value"
										option-label="ic"
										color="primary"
										class="flex-1 px-1 custom-min"
										:error="onValid(as.article)"
										:readonly="item.save"
									>
										<template #selected-item="scope">
											<span>{{ scope.opt.ic }} -</span>
											<span class="text-xs text-gray-500">{{ scope.opt.suplr_name }}</span>
										</template>
										<template #option="scope">
											<q-item v-bind="scope.itemProps">
												<q-item-section>
													<q-item-label>{{ scope.opt.ic }}</q-item-label>
													<q-item-label caption>{{ scope.opt.suplr_name }}</q-item-label>
													<q-item-label caption>{{ scope.opt.group_name }}</q-item-label>
												</q-item-section>
											</q-item>
										</template>
									</q-select>
									<!-- Supplier -->
									<q-select
										v-model="as.suplr"
										outlined
										map-options
										color="primary"
										:options="as.suplr_list"
										option-value="id"
										option-label="name"
										class="flex-1 custom-min"
										:readonly="item.save"
									/>
									<!-- Action buttons -->
									<div class="min-w-[40px] flex items-start justify-center">
										<v-menu
											v-if="idxAs === item.articleSupplierList.length - 1 && idxAs !== 0"
											:disabled="item.save"
											placement="left-start"
											show-arrow
										>
											<template #activator="{ toggle }">
												<v-icon name="more_vert" clickable class="ctx-toggle" @click="toggle" />
											</template>
											<v-list>
												<!-- Add -->
												<v-list-item clickable class="success" @click="onAddAS(idxItem)">
													<v-list-item-icon>
														<v-icon name="add_box" outline />
													</v-list-item-icon>
													<v-list-item-content>
														{{ t('add_existing') }}
													</v-list-item-content>
												</v-list-item>
												<!-- Remove -->
												<v-list-item
													v-if="!item.save"
													clickable
													class="danger"
													@click="onConfirmRemoveAsItem(idxItem, idxAs)"
												>
													<v-list-item-icon>
														<v-icon name="delete" outline />
													</v-list-item-icon>
													<v-list-item-content>
														{{ t('remove') }}
													</v-list-item-content>
												</v-list-item>
											</v-list>
										</v-menu>
										<!-- Add only first -->
										<q-btn
											v-if="item.articleSupplierList.length === 1"
											:disable="item.save"
											icon="add_box"
											size="md"
											@click="onAddAS(idxItem)"
										/>
										<!-- Remove not first or last item -->
										<q-btn
											v-if="idxAs > 0 && idxAs < item.articleSupplierList.length - 1"
											:disable="item.save"
											icon="delete"
											size="md"
											@click="onConfirmRemoveAsItem(idxItem, idxAs)"
										/>
									</div>
								</div>
							</div>
							<!-- Company -->
							<q-select
								v-model="item.company"
								outlined
								map-options
								color="primary"
								:options="item.company_list"
								option-value="id"
								option-label="name"
								class="flex-1 custom-min"
								:readonly="item.save"
							/>
							<!-- More options -->
							<div class="flex items-satart justify-center pt-2">
								<v-menu :disabled="item.save" placement="left-start" show-arrow>
									<template #activator="{ toggle }">
										<v-icon name="more_vert" clickable class="ctx-toggle" @click="toggle" />
									</template>
									<v-list>
										<!-- Submit -->
										<v-list-item clickable class="success" @click="onSubmit(item)">
											<v-list-item-icon>
												<v-icon name="send" outline />
											</v-list-item-icon>
											<v-list-item-content>
												{{ t('submit') }}
											</v-list-item-content>
										</v-list-item>
										<!-- Remove -->
										<v-list-item v-if="!item.save" clickable class="danger" @click="onConfirmRemoveItem(item, idxItem)">
											<v-list-item-icon>
												<v-icon name="delete" outline />
											</v-list-item-icon>
											<v-list-item-content>
												{{ t('remove') }}
											</v-list-item-content>
										</v-list-item>
									</v-list>
								</v-menu>
							</div>
							<!-- Dialog -->
							<v-dialog v-model="confirmDialog.is" persistent @esc="confirmDialog.is = false">
								<v-card>
									<v-card-title>{{ confirmDialog.text }}</v-card-title>
									<v-card-actions>
										<v-button :disabled="accuntingItemDeleting" secondary @click="confirmDialog.cancel">
											{{ t('cancel') }}
										</v-button>
										<v-button :loading="accuntingItemDeleting" class="success" @click="confirmDialog.ok">OK</v-button>
									</v-card-actions>
								</v-card>
							</v-dialog>
						</div>
					</div>
				</div>
			</div>
		</q-expansion-item>
	</div>
</template>

<script lang="ts" setup>
import { PropType, ref, toRefs, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid';

import { useNomenclatureStore } from '../../stores/nomenclature.ts';
import { AnalogListType } from '@directus/nest-api/general-types';

const props = defineProps({
	// eslint-disable-next-line vue/require-default-prop
	analogList: Object as PropType<AnalogListType>,
	needData: Boolean,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { analogList } = toRefs(props);
const { t } = useI18n(),
	nomenclatureStore = useNomenclatureStore(),
	accountingNomenclature = ref([]),
	accuntingItemDeleting = ref(false),
	accuntingAsItemDeleting = ref(false);

const confirmDialog = ref({
	is: false,
	text: '',
	cancel: null,
	ok: null,
});

const emit = defineEmits(['update-data']);

const analogSaveInfo = computed(() => {
	let analogSaveInfo = {
		countSaveAnalogItem: 0,
		analogContainerLength: 0,
		saveEqualLength: false,
		analogSaveList: [],
	};
	for (const [key, analog] of Object.entries(props.analogList)) {
		for (const item of analog) {
			analogSaveInfo.analogContainerLength++;
			if (item.save) {
				analogSaveInfo.countSaveAnalogItem++;
				analogSaveInfo.analogSaveList.push({
					value: `${item.ic}-${item.suplr.id}`,
					group: key,
					group_name: item.group_name,
					ic: item.ic,
					suplr_id: item.suplr.id,
					suplr_name: item.suplr.name,
				});
			}
		}
	}
	analogSaveInfo.saveEqualLength = analogSaveInfo.countSaveAnalogItem === analogSaveInfo.analogContainerLength;
	return analogSaveInfo;
});

// const getTrademarkList = async (type) => await nomenclatureStore.fetchTrademark(type, '');

const onValid = (val: any | string): boolean => {
	if (val || val.length > 0) {
		let match = false;
		analogSaveInfo.value.analogSaveList.forEach((i) => {
			if (val.ic === i.ic && val.suplr_id === i.suplr_id) match = true;
		});
		return !match;
	}
	return false;
};

const onCheck = (val: boolean, idxItem: int, idxAs: int, isDelete: boolean, deletePrimary: boolean): void => {
	if (accountingNomenclature.value.length > 0) {
		for (let i in accountingNomenclature.value) {
			for (let j in accountingNomenclature.value[i].articleSupplierList) {
				if (!isDelete) accountingNomenclature.value[i].articleSupplierList[j].primary = false;
			}
		}
		if (isDelete) {
			if (deletePrimary) {
				accountingNomenclature.value[0].articleSupplierList[0].primary = true;
			}
		} else {
			accountingNomenclature.value[idxItem].articleSupplierList[idxAs].primary = true;
		}
	}
};

const onAddAcountingList = async (): Promise<void> => {
	const { contractors, perimeters } = await nomenclatureStore.fetchContractors();
	// Код реализации. Первый элемент для значения по умолчанию
	const ic = analogSaveInfo.value.analogSaveList[0];
	accountingNomenclature.value.push({
		id: uuidv4(),
		delete_active: false,
		ic: ic,
		articleSupplierList: [
			{
				id: uuidv4(),
				delete_active: false,
				primary: false,
				article: ic,
				suplr_list: contractors,
				suplr: contractors.at(0),
			},
		],
		// По умолчанию Север минералс
		company: perimeters.find((i) => i.id === 'f9ba906e-c833-e611-80be-000c29116bf5') || perimeters.at(0),
		company_list: perimeters,
	});
	if (accountingNomenclature.value.length === 1 && accountingNomenclature.value[0].articleSupplierList.length === 1) {
		accountingNomenclature.value[0].articleSupplierList[0].primary = true;
	}
};

const onAddAS = async (idxItem): Promise<void> => {
	const { contractors } = await nomenclatureStore.fetchContractors(),
		ic = analogSaveInfo.value.analogSaveList[0];
	accountingNomenclature.value[idxItem].articleSupplierList.push({
		id: uuidv4(),
		delete_active: false,
		primary: false,
		article: ic,
		suplr_list: contractors,
		suplr: contractors.at(0),
	});
};

const onConfirmRemoveItem = (item: any, idxItem: int): void => {
	confirmDialog.value = {
		cancel: () => (confirmDialog.value.is = false),
		ok: () => removeAccountingItem(item, idxItem),
		text: t('product_request.delete_record_are_you_sure'),
		is: true,
	};
};

const onConfirmRemoveAsItem = (idxItem: int, idxAs: int): void => {
	confirmDialog.value = {
		cancel: () => (confirmDialog.value.is = false),
		ok: () => onRemoveAS(idxItem, idxAs),
		text: t('product_request.delete_record_are_you_sure'),
		is: true,
	};
};

const onSaveAccountingList = (): void => {
	if (accountingNomenclature.value.length > 0) {
		for (let i in accountingNomenclature.value) {
			accountingNomenclature.value[i].save = true;
		}
	}
	emit('update-data', accountingNomenclature.value);
};

const onSubmit = (item: any): void => {
	item.save = true;
};

function removeAccountingItem(item, idxItem): void {
	onCheck(
		false,
		idxItem,
		0,
		true,
		accountingNomenclature.value[idxItem].articleSupplierList.find((i) => i.primary === true)?.primary
	);
	accuntingItemDeleting.value = true;
	accountingNomenclature.value.splice(idxItem, 1);
	accuntingItemDeleting.value = false;
	confirmDialog.value.is = false;
}

function onRemoveAS(idxItem, idxAs): void {
	onCheck(false, idxItem, idxAs, true, accountingNomenclature.value[idxItem].articleSupplierList[idxAs].primary);
	accuntingAsItemDeleting.value = true;
	accountingNomenclature.value[idxItem].articleSupplierList.splice(idxAs, 1);
	accuntingAsItemDeleting.value = false;
	confirmDialog.value.is = false;
}

watch(
	() => props.needData,
	(val: boolean): void => {
		if (val) onSaveAccountingList();
	}
);
</script>

<style lang="scss" scoped>
.v-list-item.success {
	--v-list-item-color: var(--success);
	--v-list-item-color-hover: var(--success);
	--v-list-item-icon-color: var(--success);
}

.v-list-item.danger {
	--v-list-item-color: var(--danger);
	--v-list-item-color-hover: var(--danger);
	--v-list-item-icon-color: var(--danger);
}

.v-button.delete {
	--v-button-background-color: var(--danger);
	--v-button-background-color-hover: var(--danger-125);
}
</style>
