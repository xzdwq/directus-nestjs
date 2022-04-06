<template>
	<div class="pt-4">
		<div>
			<q-expansion-item
				default-opened
				expand-icon-toggle
				expand-separator
				class="font-bold text-lg bg-[#dfffe3] !p-2 w-full rounded-lg"
			>
				<template #header>
					<q-item-section avatar>
						<q-avatar icon="widgets" />
					</q-item-section>
					<q-item-section>{{ t('product_request.container_analogs') }} ({{ getAnalogCoutn() }})</q-item-section>
					<q-item-section side>
						<div class="flex items-center">
							<!-- Type list -->
							<q-select
								v-model="formNomenclature.type[0]"
								outlined
								:options="nomenclatureStore.getNomenclatureTypeBase"
								map-options
								option-value="value"
								option-label="name"
								color="primary"
								class="custom-min min-w-[400px] bg-white"
							/>
							<!-- Add product in type -->
							<q-btn
								class="ml-4"
								color="primary"
								icon="add"
								no-caps
								:label="t('add_existing')"
								:loading="nomenclatureStore.getLoadAnalogList"
								@click="onAddProductInAnalogList"
							/>
							<!-- Save -->
							<q-btn
								class="ml-4"
								color="primary"
								icon="save"
								no-caps
								:label="t('save')"
								:disabled="!Object.keys(containerAnalogue).length || nomenclatureStore.getLoadAnalogList"
								:loading="nomenclatureStore.getLoadAnalogList || nomenclatureStore.getSaving"
								@click="$emit('save-container-analog')"
							/>
						</div>
					</q-item-section>
				</template>
				<div v-if="!Object.keys(containerAnalogue).length">
					<div
						class="
							w-full
							h-20
							bg-white
							text-gray-500
							border-4 border-dashed border-gray-400
							rounded-lg
							flex
							justify-center
							items-center
						"
					>
						{{ t('product_request.analog_waiting_filled') }}
					</div>
				</div>
				<div v-else class="overflow-x-auto bg-white rounded-lg">
					<div class="min-w-[1000px]">
						<!-- Header -->
						<div class="w-full grid grid-cols-6-fix gap-1">
							<div />
							<div class="flex items-end">{{ t('product_request.product_type') }}</div>
							<div class="flex items-end">{{ t('product_request.add_product_type') }}</div>
							<div class="flex items-end">{{ t('product_request.ic') }}</div>
							<div class="flex items-end">{{ t('product_request.trademark') }}</div>
							<div />
						</div>
						<div v-for="(group, keyGroup) of sortAnalogItems(containerAnalogue)" :key="keyGroup" class="py-1">
							<hr class="mt-3" />
							<div class="text-gray-500 pl-9 text-base -mt-[13px]">
								<span class="px-2 bg-white">{{ group[0].group_name }}</span>
							</div>
							<!-- Analog items -->
							<div
								v-for="(item, idxItem) in group"
								:key="item.id"
								class="grid grid-cols-6-fix gap-1 !p-0 !pt-1 font-normal"
							>
								<v-checkbox
									v-model="item.primary"
									:font-size="30"
									@update:modelValue="onCheck($event, keyGroup, item)"
								/>
								<!-- Name -->
								<q-input
									v-model="item.name"
									outlined
									color="primary"
									class="custom-min"
									:rules="[(val) => val && val.length > 0]"
									:readonly="item.save"
								/>
								<!-- Add mane -->
								<q-input
									v-model="item.additional_options"
									outlined
									color="primary"
									class="custom-min"
									:readonly="item.save"
								/>
								<!-- IC -->
								<q-input
									v-model="item.ic"
									outlined
									color="primary"
									class="custom-min"
									:error="[(val) => val && val.length > 0]"
									:readonly="item.save"
								/>
								<!-- SUPLR -->
								<q-select
									v-model="item.suplr"
									outlined
									use-input
									map-options
									option-value="id"
									option-label="name"
									color="primary"
									class="custom-min"
									input-debounce="700"
									:options="item.suplr_list"
									:rules="[() => !!item.suplr]"
									:readonly="item.save"
									@filter="
										(val, upd, abort) => filterSUPLR({ val, upd, abort }, item, keyGroup, idxItem, item.suplr_list)
									"
								/>
								<!-- More options -->
								<div class="flex items-center justify-center">
									<v-menu placement="left-start" show-arrow :close-on-content-click="!!item.close_menu">
										<template #activator="{ toggle }">
											<v-icon name="more_vert" clickable class="ctx-toggle" @click="toggle" />
										</template>
										<v-list>
											<!-- Save -->
											<v-list-item
												v-if="!item.save"
												clickable
												class="success"
												@click="(item.close_menu = true), onSaveItem(item, keyGroup, idxItem)"
											>
												<v-list-item-icon>
													<v-icon name="save" outline />
												</v-list-item-icon>
												<v-list-item-content>
													{{ t('save') }}
												</v-list-item-content>
											</v-list-item>
											<!-- Edit -->
											<v-list-item
												v-else
												clickable
												class="success"
												@click="(item.close_menu = true), (item.is_edit = true)"
											>
												<v-list-item-icon>
													<v-icon name="edit" outline />
												</v-list-item-icon>
												<v-list-item-content>
													{{ t('edit') }}
												</v-list-item-content>
											</v-list-item>
											<!-- Change class -->
											<v-list-item v-if="!item.save">
												<v-list-item-content>
													<q-select
														v-model="item.class"
														outlined
														map-options
														:options="item.class_list"
														option-value="value"
														option-label="name"
														color="primary"
														class="w-full"
														:label="t('product_request.сhange_class')"
														@update:model-value="(val) => onClassChange(val, keyGroup, item, idxItem)"
													/>
												</v-list-item-content>
											</v-list-item>
											<!-- Remove -->
											<v-list-item
												clickable
												class="danger"
												@click="(item.delete_active = true), (item.close_menu = true)"
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
								</div>
								<!-- Dialog -->
								<v-dialog v-model="item.delete_active" persistent @esc="item.delete_active = false">
									<v-card>
										<v-card-title>{{ t('product_request.delete_record_are_you_sure') }}</v-card-title>
										<v-card-actions>
											<v-button
												:disabled="analogItemDeleting"
												secondary
												@click="(item.close_menu = false), (item.delete_active = false)"
											>
												{{ t('cancel') }}
											</v-button>
											<v-button
												:loading="analogItemDeleting"
												class="delete"
												@click="removeGroupAnalogItem(item, keyGroup, idxItem)"
											>
												{{ t('remove') }}
											</v-button>
										</v-card-actions>
									</v-card>
								</v-dialog>
								<!-- Analog item edit -->
								<v-drawer
									:title="t('product_request.element_editing')"
									:subtitle="nomenclatureStore.getProduct.name"
									:model-value="item.is_edit"
									persistent
									@cancel="item.is_edit = false"
								>
									<template #actions>
										<v-button
											icon
											rounded
											:loading="nomenclatureStore.loadAnalogList"
											@click="analogItemNeedData = true"
										>
											<v-icon name="check" />
										</v-button>
									</template>
									<analog-item-edit
										:need-data="analogItemNeedData"
										:index-group="keyGroup"
										:index-item="idxItem"
										:analog-list="containerAnalogue"
										class="px-10"
										@update-data="updateData"
									/>
								</v-drawer>
							</div>
						</div>
					</div>
				</div>
			</q-expansion-item>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import { useNomenclatureStore } from '../../stores/nomenclature.ts';
import AnalogItemEdit from './analog-item-edit.vue';
import { AnalogListType } from '@directus/nest-api/general-types';
import { isSN, getSUPLR, orderAnalogItem, sortAnalogItems } from '../../../composables/rules.ts';
import utils from '../../../composables/utils.ts';
import { analogModel } from '../composables/nomenclature-model.ts';

const emit = defineEmits(['save-analog-item', 'save-container-analog']);

const { t } = useI18n(),
	nomenclatureStore = useNomenclatureStore(),
	analogItemNeedData = ref(false),
	analogItemDeleting = ref(false);

const { containerAnalogue, formNomenclature } = storeToRefs(nomenclatureStore);

const getAnalogCoutn = (): number => {
	let cnt = 0;
	for (let i in containerAnalogue.value) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (let j of containerAnalogue.value[i]) {
			cnt++;
		}
	}
	return cnt;
};

const onCheck = (val: boolean, keyGroup: string, item: any, isDelete: boolean, deleteIsPrimary: boolean): void => {
	if (Object.keys(containerAnalogue.value).length > 0) {
		for (let i in containerAnalogue.value) {
			for (let j of containerAnalogue.value[i]) {
				if (!isDelete) j.primary = false;
			}
		}
		const typeKeys = Object.keys(containerAnalogue.value);
		if (isDelete) {
			if (deleteIsPrimary) {
				const firstProp = typeKeys[0];
				containerAnalogue.value[firstProp][0].primary = true;
			}
		} else {
			item.primary = true;
		}
	}
};

const removeGroupAnalogItem = (item, keyGroup, idxItem): void => {
	analogItemDeleting.value = true;
	if (containerAnalogue.value[keyGroup].length === 1) delete containerAnalogue.value[keyGroup];
	else containerAnalogue.value[keyGroup].splice(idxItem, 1);
	onCheck(false, keyGroup, item, true, item.primary);
	analogItemDeleting.value = false;
};

const onClassChange = async (val, keyGroup: number, item, idxItem: number, fetchTrademark = true): void => {
	const itemIndex = containerAnalogue.value[keyGroup].findIndex((i) => i.class.value === val.value);
	if (itemIndex > -1) {
		if (fetchTrademark) {
			const trademark = await nomenclatureStore.fetchTrademark(val.value, '');
			item.suplr_list = trademark;
			item.suplr = isSN(item) ? trademark[0] : '';
		}

		item.group_value = val.value;
		item.order = orderAnalogItem(val.value);

		if (isSN(item)) {
			if (!item.ic.match(/^SN\d{6,6}$/g)) {
				const snCode = await nomenclatureStore.getSNCode();
				item.ic = snCode;
			}
		} else if (item.ic.match(/^SN\d{6,6}$/g)) {
			item.ic = nomenclatureStore.getProduct.article || '';
		}

		const moveItem = JSON.parse(JSON.stringify(item));
		moveItem.group_name = item.class.name;
		!containerAnalogue.value[val.value]
			? (containerAnalogue.value[val.value] = [moveItem])
			: containerAnalogue.value[val.value].push(moveItem);
		if (containerAnalogue.value[keyGroup].length === 1) delete containerAnalogue.value[keyGroup];
		else containerAnalogue.value[keyGroup].splice(itemIndex, 1);
	}
};

const filterSUPLR = async ({ val, upd }, item, keyGroup, idxItem): void => {
	if (!item.suplr?.id && !val)
		containerAnalogue.value[keyGroup][idxItem].suplr_list = await getSUPLR(nomenclatureStore, item);
	upd(async () => {
		if (!val) return;
		containerAnalogue.value[keyGroup][idxItem].suplr_list = await getSUPLR(nomenclatureStore, item, val);
	});
};

const findPrimaryProps = (list, props): string => {
	let primaryName;
	for (let i in list) {
		primaryName = list[i].find((a) => a.primary)?.[props];
		if (primaryName) break;
	}
	return primaryName;
};

// Добавление продукта в контейнер аналогов
const onAddProductInAnalogList = async (): Promise<void> => {
	const groupValue = formNomenclature.value.type.value,
		grounName = formNomenclature.value.type.name;
	const model: AnalogListType = await analogModel({ groupValue, grounName }, nomenclatureStore);

	if (!containerAnalogue.value[groupValue]) {
		containerAnalogue.value[groupValue] = [model];
		// Ставим чек у единственного элемента
		if (Object.keys(containerAnalogue.value).length === 1) {
			containerAnalogue.value[groupValue][0].primary = true;
		} else {
			// Получаем имя приоритетного продукта
			let primaryName = findPrimaryProps(containerAnalogue.value, 'name'),
				primaryAddName = findPrimaryProps(containerAnalogue.value, 'additional_options');
			containerAnalogue.value[groupValue][0].name =
				primaryName || containerAnalogue.value[Object.keys(containerAnalogue.value)[0]][0].name;
			containerAnalogue.value[groupValue][0].additional_options = primaryAddName || null;
			formNomenclature.value.container_analog_name = primaryName;
		}
	} else {
		// Получаем имя приоритетного продукта
		let primaryName = findPrimaryProps(containerAnalogue.value, 'name'),
			primaryAddName = findPrimaryProps(containerAnalogue.value, 'additional_options');
		model.name = primaryName || containerAnalogue.value[Object.keys(containerAnalogue.value)[0]][0].name;
		model.additional_options = primaryAddName || null;
		containerAnalogue.value[groupValue].push(model);
	}
};

// Сохранение из формы редактирования
const updateData = async (form): void => {
	analogItemNeedData.value = false;
	if (form.valid) {
		form.form.is_edit = false;
		// Если сменили класс элемента (аналога)
		if (form.form.group_value !== form.form.class.value) {
			containerAnalogue.value[form.indexGroup][form.indexItem].class = form.form.class;
			form.form.group_name = form.form.class.name;
			const fetchTrademark = false;
			await onClassChange(form.form.class, form.indexGroup, form.form, form.indexItem, fetchTrademark);
			// Переопределяем новые индексы элемента после смены класса
			form.indexGroup = form.form.class.value;
			form.indexItem = containerAnalogue.value[form.form.class.value].length - 1;
		}
		emit('save-container-analog', form);
	} else {
		utils.onToast('danger', t('save_error'), t('product_request.form_validation_error'));
	}
};

// Сохранение из контекстного меню
const onSaveItem = (item, keyGroup, idxItem): void => {
	let valid = true;
	if (!item.name || !item.ic || !item.class.value || !item.suplr || !item.ic) valid = false;
	emit('save-container-analog', { form: item, indexGroup: keyGroup, indexItem: idxItem, valid: valid });
	setTimeout(() => (item.close_menu = false));
};
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
