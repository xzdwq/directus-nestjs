<template>
	<div>
		<!-- Header -->
		<div class="grid grid-cols-[minmax(25%,1fr),minmax(25%,1fr),minmax(25%,1fr),40px] gap-2 font-bold">
			<div>{{ t('product_request.product_group') }}</div>
			<div>{{ t('product_request.code') }}</div>
			<div>{{ t('named') }}</div>
		</div>
		<!-- Items -->
		<div v-if="pgList.length === 0">
			<div class="grid grid-cols-[minmax(25%,1fr),minmax(25%,1fr),minmax(25%,1fr),40px] gap-2 items-center">
				<div>--</div>
				<div>--</div>
				<div>--</div>
				<q-btn icon="add_box" size="md" @click="onAddPg" />
			</div>
		</div>
		<div v-else>
			<div v-for="(pg, idxPg) in pgList" :key="pg.id" class="py-1">
				<div class="grid grid-cols-[minmax(25%,1fr),minmax(25%,1fr),minmax(25%,1fr),40px] gap-2 items-center">
					<!-- Cantractor -->
					<q-select
						ref="selectContracrot"
						v-model="pg.selected_contractor"
						:popup-content-style="`width: ${widthListContractors}px;`"
						outlined
						map-options
						use-input
						input-debounce="700"
						:options="pg.contractor_list"
						option-value="id"
						option-label="name"
						color="primary"
						class="custom-min nowrap-input"
						:rules="[() => !!pg.selected_contractor]"
						@popup-show="widthListContractors = $refs.selectContracrot.$el.offsetWidth"
						@filter="(val, upd, abort) => filterContractor({ val, upd, abort }, idxPg, pg)"
						@update:model-value="(val) => onContractorSelected(val, pg, idxPg)"
					/>
					<!-- Product group code-->
					<q-select
						v-model="pg.selected_code"
						outlined
						map-options
						:use-input="pg.pg_code_list.length > 0"
						input-debounce="700"
						:options="pg.pg_code_list"
						option-value="id"
						option-label="code"
						color="primary"
						class="custom-min"
						:loading="nomenclatureStore.getPgLoad"
						:readonly="!pg.selected_contractor?.id || nomenclatureStore.getPgLoad"
						:rules="[() => !matchDouble(), () => !!pg.selected_code]"
						@filter="(val, upd, abort) => filterPgCode({ val, upd, abort }, idxPg, pg)"
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
					<div v-tooltip.top="pg.selected_code?.name" class="truncate">{{ pg.selected_code?.name || '--' }}</div>
					<!-- Action buttons -->
					<div class="min-w-[40px] flex items-start justify-center">
						<v-menu v-if="idxPg === pgList.length - 1 && idxPg >= 0" placement="left-start" show-arrow>
							<template #activator="{ toggle }">
								<v-icon name="more_vert" clickable class="ctx-toggle" @click="toggle" />
							</template>
							<v-list>
								<!-- Remove -->
								<v-list-item clickable class="danger" @click="pg.delete_active = true">
									<v-list-item-icon>
										<v-icon name="delete" outline />
									</v-list-item-icon>
									<v-list-item-content>
										{{ t('remove') }}
									</v-list-item-content>
								</v-list-item>
								<!-- Add -->
								<v-list-item clickable class="success" @click="onAddPg">
									<v-list-item-icon>
										<v-icon name="add_box" outline />
									</v-list-item-icon>
									<v-list-item-content>
										{{ t('add_existing') }}
									</v-list-item-content>
								</v-list-item>
							</v-list>
						</v-menu>
						<!-- Remove not last item -->
						<q-btn v-if="idxPg < pgList.length - 1" icon="delete" size="md" @click="pg.delete_active = true" />
					</div>
				</div>
				<!-- Dialog remove pg -->
				<v-dialog v-model="pg.delete_active" persistent @esc="pg.delete_active = false">
					<v-card>
						<v-card-title>{{ t('product_request.delete_record_are_you_sure') }}</v-card-title>
						<v-card-actions>
							<v-button :disabled="pgItemDeleting" secondary @click="pg.delete_active = false">
								{{ t('cancel') }}
							</v-button>
							<v-button :loading="pgItemDeleting" class="delete" @click="removePgItem(idxPg)">
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
	pgItemDeleting = ref(false);

const { containerAnalogue } = storeToRefs(nomenclatureStore);

const pgList = ref(containerAnalogue.value[props.indexGroup][props.indexItem].pg_list);

const onAddPg = (): void => {
	pgList.value.push({
		id: uuidv4(),
		contractor_list: nomenclatureStore.getContractorList,
		selected_contractor: '',
		pg_code_list: [],
		selected_code: '',
	});
};

const filterContractor = async ({ val, upd }, idxPg, pg): void => {
	if (!pgList.value[idxPg].selected_contractor && !val) {
		pg.contractor_list = nomenclatureStore.getContractorList;
	}
	upd(async () => {
		if (!val) return;
		pg.contractor_list = await nomenclatureStore.fetchContractorByName(val);
	});
};

const onContractorSelected = async (val, pg): void => {
	if (val?.id) {
		const pg_code_list = await nomenclatureStore.fetchPgCodeByContractorId(val.id);
		pg.selected_code = pg_code_list[0];
		pg.pg_code_list = pg_code_list;
	}
};

const filterPgCode = async ({ val, upd }, idxPg, pg): void => {
	if (!pgList.value[idxPg].selected_code && !val) {
		pg.pg_code_list = pgList.value[idxPg].pg_code_list;
	}
	upd(async () => {
		if (!val) return;
		pg.pg_code_list = await nomenclatureStore.fetchPgCodeByContractorId(pg.selected_contractor.id, val);
	});
};

const matchDouble = (): boolean => {
	let matchDouble = false;
	for (let i = 0; i < pgList.value.length; i++) {
		for (let j = 0; j < pgList.value.length; j++) {
			if (
				i !== j &&
				pgList.value[i].selected_contractor?.id === pgList.value[j].selected_contractor?.id &&
				pgList.value[i].selected_code?.code === pgList.value[j].selected_code?.code
			) {
				matchDouble = true;
				break;
			}
		}
		if (matchDouble) break;
	}
	return matchDouble;
};

const removePgItem = (idxPg): void => {
	pgItemDeleting.value = true;
	pgList.value.splice(idxPg, 1);
	pgItemDeleting.value = false;
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
