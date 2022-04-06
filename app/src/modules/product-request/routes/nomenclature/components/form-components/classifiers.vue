<template>
	<div>
		<!-- Header -->
		<div class="grid grid-cols-[minmax(25%,1fr),minmax(25%,1fr),minmax(25%,1fr),40px] gap-2 font-bold">
			<div>{{ t('product_request.classifiers') }}</div>
			<div>{{ t('product_request.code') }}</div>
			<div>{{ t('named') }}</div>
		</div>
		<!-- Items -->
		<div v-for="(classifierType, idxCls) in classifiersKit" :key="classifierType.id" class="py-1">
			<div class="grid grid-cols-[minmax(25%,1fr),minmax(25%,1fr),minmax(25%,1fr),40px] gap-2 items-center">
				<!-- Type -->
				<q-select
					v-model="classifierType.selected_type"
					outlined
					map-options
					:options="nomenclatureStore.getClassifierList"
					option-value="id"
					option-label="name"
					color="primary"
					class="custom-min"
					:rules="[() => !!classifierType.selected_type]"
					@update:model-value="(val) => onClassifierTypeSelected(val, classifierType, idxCls)"
				/>
				<!-- Code -->
				<q-select
					v-model="classifierType.selected"
					outlined
					use-input
					map-options
					:options="classifierType.classifier"
					option-value="code"
					option-label="code"
					color="primary"
					class="custom-min"
					input-debounce="700"
					:loading="nomenclatureStore.classifierIsLoad"
					:readonly="!classifierType.selected_type?.id || nomenclatureStore.classifierIsLoad"
					:rules="[() => !matchDouble(), () => !!classifierType.selected]"
					@filter="(val, upd, abort) => filterClassifierCode({ val, upd, abort }, idxCls, classifierType)"
				/>
				<!-- Name -->
				<div v-tooltip.top="classifierType.selected?.name" class="truncate">
					{{ classifierType.selected?.name || '--' }}
				</div>
				<!-- Action buttons -->
				<div class="min-w-[40px] flex items-start justify-center">
					<v-menu v-if="idxCls === classifiersKit.length - 1 && idxCls !== 0" placement="left-start" show-arrow>
						<template #activator="{ toggle }">
							<v-icon name="more_vert" clickable class="ctx-toggle" @click="toggle" />
						</template>
						<v-list>
							<!-- Remove -->
							<v-list-item clickable class="danger" @click="classifierType.delete_active = true">
								<v-list-item-icon>
									<v-icon name="delete" outline />
								</v-list-item-icon>
								<v-list-item-content>
									{{ t('remove') }}
								</v-list-item-content>
							</v-list-item>
							<!-- Add -->
							<v-list-item clickable class="success" @click="onAddClassifier">
								<v-list-item-icon>
									<v-icon name="add_box" outline />
								</v-list-item-icon>
								<v-list-item-content>
									{{ t('add_existing') }}
								</v-list-item-content>
							</v-list-item>
						</v-list>
					</v-menu>
					<!-- Add only first -->
					<q-btn v-if="classifiersKit.length === 1" icon="add_box" size="md" @click="onAddClassifier" />
					<!-- Remove not first or last item -->
					<q-btn
						v-if="idxCls > 0 && idxCls < classifiersKit.length - 1"
						icon="delete"
						size="md"
						@click="classifierType.delete_active = true"
					/>
				</div>
			</div>
			<!-- Dialog remove classifier -->
			<v-dialog v-model="classifierType.delete_active" persistent @esc="classifierType.delete_active = false">
				<v-card>
					<v-card-title>{{ t('product_request.delete_record_are_you_sure') }}</v-card-title>
					<v-card-actions>
						<v-button :disabled="classifierItemDeleting" secondary @click="classifierType.delete_active = false">
							{{ t('cancel') }}
						</v-button>
						<v-button :loading="classifierItemDeleting" class="delete" @click="removeClassifierItem(idxCls)">
							{{ t('remove') }}
						</v-button>
					</v-card-actions>
				</v-card>
			</v-dialog>
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
	nomenclatureStore = useNomenclatureStore(),
	classifierItemDeleting = ref(false);

const { containerAnalogue } = storeToRefs(nomenclatureStore);

const classifiersKit = ref(containerAnalogue.value[props.indexGroup][props.indexItem].classifier_kit);

const onClassifierTypeSelected = async (val, classifierType): void => {
	const classifier_list = await nomenclatureStore.fetchClassifierForType(val.id);
	classifierType.selected = classifier_list[0];
	classifierType.classifier = classifier_list;
};

const filterClassifierCode = async ({ val, upd }, idxCls, classifierType): void => {
	if (!classifiersKit.value[idxCls].selected && !val) {
		classifierType.classifier = await nomenclatureStore.fetchClassifierForType(classifierType.selected_type.id, '');
	}
	upd(async () => {
		if (!val) return;
		classifierType.classifier = await nomenclatureStore.fetchClassifierForType(classifierType.selected_type.id, val);
	});
};

const matchDouble = (): boolean => {
	let matchDouble = false;
	for (let i = 0; i < classifiersKit.value.length; i++) {
		for (let j = 0; j < classifiersKit.value.length; j++) {
			if (
				i !== j &&
				classifiersKit.value[i].id === classifiersKit.value[j].id &&
				classifiersKit.value[i].selected?.code === classifiersKit.value[j].selected?.code
			) {
				matchDouble = true;
				break;
			}
		}
		if (matchDouble) break;
	}
	return matchDouble;
};

const onAddClassifier = (): void => {
	classifiersKit.value.push({
		...nomenclatureStore.getClassifierDefault[0],
		selected_type: '',
		selected: '',
	});
};

const removeClassifierItem = (idxCls): void => {
	classifierItemDeleting.value = true;
	classifiersKit.value.splice(idxCls, 1);
	classifierItemDeleting.value = false;
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
