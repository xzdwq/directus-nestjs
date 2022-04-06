<template>
	<div class="w-full">
		<!-- Header -->
		<div class="grid grid-cols-[minmax(25%,1fr),minmax(25%,1fr),minmax(25%,1fr),40px] gap-2 font-bold">
			<div>{{ t('product_request.suplr_product_groups') }}</div>
			<div>{{ t('product_request.code') }}</div>
			<div>{{ t('named') }}</div>
		</div>
		<!-- Items -->
		<div v-if="suplrPgList.length === 0">
			<div class="grid grid-cols-[minmax(25%,1fr),minmax(25%,1fr),minmax(25%,1fr),40px] gap-2 items-center">
				<div>--</div>
				<div>--</div>
				<div>--</div>
				<q-btn icon="add_box" size="md" @click="onAddSuplrPg" />
			</div>
		</div>
		<div v-else>
			<div v-for="(suplrPg, idxPg) in suplrPgList" :key="suplrPg.id" class="py-1">
				<div class="grid grid-cols-[minmax(25%,1fr),minmax(25%,1fr),minmax(25%,1fr),40px] gap-2 items-center">
					<!-- Cantractor -->
					<q-select
						ref="selectContracrot"
						v-model="suplrPg.selected_contractor"
						:popup-content-style="`width: ${widthListContractors}px;`"
						outlined
						map-options
						use-input
						input-debounce="700"
						:options="suplrPg.contractor_list_suplr"
						option-value="id"
						option-label="name"
						color="primary"
						class="custom-min nowrap-input"
						:rules="[() => !!suplrPg.selected_contractor]"
						@popup-show="widthListContractors = $refs.selectContracrot.$el.offsetWidth"
						@filter="(val, upd, abort) => filterContractor({ val, upd, abort }, idxPg, suplrPg)"
						@update:model-value="(val) => onContractorSelected(val, suplrPg, idxPg)"
					/>
					<!-- Product group code-->
					<q-select
						v-model="suplrPg.selected_code"
						outlined
						map-options
						:use-input="suplrPg.suplr_pg_code_list.length > 0"
						input-debounce="700"
						:options="suplrPg.suplr_pg_code_list"
						option-value="id"
						option-label="code"
						color="primary"
						class="custom-min"
						:loading="nomenclatureStore.getPgLoad"
						:readonly="!suplrPg.selected_contractor?.id || nomenclatureStore.getPgLoad"
						:rules="[() => !matchDouble(), () => !!suplrPg.selected_code]"
						@filter="(val, upd, abort) => filterPgCode({ val, upd, abort }, idxPg, suplrPg)"
					>
						<template #no-option>
							<q-item>
								<q-item-section class="text-italic text-grey">
									{{ t('product_request.empty_list') }}
								</q-item-section>
							</q-item>
						</template>
					</q-select>
					<!-- Name -->
					<div v-tooltip.top="suplrPg.selected_code?.name" class="truncate">
						{{ suplrPg.selected_code?.name || '--' }}
					</div>
					<!-- Action buttons -->
					<div class="min-w-[40px] flex items-start justify-center">
						<v-menu v-if="idxPg === suplrPgList.length - 1 && idxPg >= 0" placement="left-start" show-arrow>
							<template #activator="{ toggle }">
								<v-icon name="more_vert" clickable class="ctx-toggle" @click="toggle" />
							</template>
							<v-list>
								<!-- Remove -->
								<v-list-item clickable class="danger" @click="suplrPg.delete_active = true">
									<v-list-item-icon>
										<v-icon name="delete" outline />
									</v-list-item-icon>
									<v-list-item-content>
										{{ t('remove') }}
									</v-list-item-content>
								</v-list-item>
								<!-- Add -->
								<v-list-item clickable class="success" @click="onAddSuplrPg">
									<v-list-item-icon>
										<v-icon name="add_box" outline />
									</v-list-item-icon>
									<v-list-item-content>
										{{ t('add_existing') }}
									</v-list-item-content>
								</v-list-item>
							</v-list>
						</v-menu>
						<!-- Remove not first or last item -->
						<q-btn
							v-if="idxPg >= 0 && idxPg < suplrPgList.length - 1"
							icon="delete"
							size="md"
							@click="suplrPg.delete_active = true"
						/>
					</div>
				</div>
				<!-- Dialog remove -->
				<v-dialog v-model="suplrPg.delete_active" persistent @esc="suplrPg.delete_active = false">
					<v-card>
						<v-card-title>{{ t('product_request.delete_record_are_you_sure') }}</v-card-title>
						<v-card-actions>
							<v-button :disabled="suplrPgItemDeleting" secondary @click="suplrPg.delete_active = false">
								{{ t('cancel') }}
							</v-button>
							<v-button :loading="suplrPgItemDeleting" class="delete" @click="removeSuplrPgItem(idxPg)">
								{{ t('remove') }}
							</v-button>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid';
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
	nomenclatureStore = useNomenclatureStore(),
	widthListContractors = ref(0),
	suplrPgItemDeleting = ref(false);

const { containerAnalogue } = storeToRefs(nomenclatureStore);

const suplrPgList = ref(containerAnalogue.value[props.indexGroup][props.indexItem].suplr_pg_list);

const onAddSuplrPg = (): void => {
	suplrPgList.value.push({
		id: uuidv4(),
		contractor_list_suplr: nomenclatureStore.getContractorListSupl,
		selected_contractor: '',
		suplr_pg_code_list: [],
		selected_code: '',
	});
};

const filterContractor = async ({ val, upd }, idxPg, suplrPg): void => {
	if (!suplrPgList.value[idxPg].selected_contractor && !val) {
		suplrPg.contractor_list_suplr = nomenclatureStore.getContractorListSupl;
	}
	upd(async () => {
		if (!val) return;
		suplrPg.contractor_list_suplr = await nomenclatureStore.fetchContractorByName(val);
	});
};

const onContractorSelected = async (val, suplrPg): void => {
	if (val?.id) {
		const pg_code_list = await nomenclatureStore.fetchPgContractor(val.id);
		suplrPg.selected_code = pg_code_list[0];
		suplrPg.suplr_pg_code_list = pg_code_list;
	}
};

const filterPgCode = async ({ val, upd }, idxPg, suplrPg): void => {
	if (!suplrPgList.value[idxPg].selected_code && !val) {
		suplrPg.pg_code_list = suplrPgList.value[idxPg].suplr_pg_code_list;
	}
	upd(async () => {
		if (!val) return;
		suplrPg.suplr_pg_code_list = await nomenclatureStore.fetchPgContractor(suplrPg.selected_contractor.id, val);
	});
};

const matchDouble = (): boolean => {
	let matchDouble = false;
	for (let i = 0; i < suplrPgList.value.length; i++) {
		for (let j = 0; j < suplrPgList.value.length; j++) {
			if (
				i !== j &&
				suplrPgList.value[i].selected_contractor?.id === suplrPgList.value[j].selected_contractor?.id &&
				suplrPgList.value[i].selected_code?.code === suplrPgList.value[j].selected_code?.code
			) {
				matchDouble = true;
				break;
			}
		}
		if (matchDouble) break;
	}
	return matchDouble;
};

const removeSuplrPgItem = (idxPg): void => {
	suplrPgItemDeleting.value = true;
	suplrPgList.value.splice(idxPg, 1);
	suplrPgItemDeleting.value = false;
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
