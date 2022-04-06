<template>
	<private-view
		:title="
			route.params.containerId != 0 ? t(`product_request.edit_nomenclature`) : t(`product_request.create_nomenclature`)
		"
	>
		<template v-if="breadcrumb" #headline>
			<v-breadcrumb :items="breadcrumb" />
		</template>
		<!-- Header -->
		<template #title-outer:prepend>
			<v-button rounded icon secondary exact @click="router.back()">
				<v-icon name="arrow_back" />
			</v-button>
		</template>
		<!-- Left navigations bar -->
		<template #navigation>
			<product-request-navigation type="active" />
		</template>
		<!-- Body -->
		<div class="px-9">
			<!-- Saving mask -->
			<div
				v-show="nomenclatureStore.getSaving"
				class="absolute w-full h-full top-0 left-0 z-10 bg-gray-700 bg-opacity-25"
			>
				<div class="absolute bg-white w-80 h-52 z-20 rounded-xl left-[calc(50%-160px)] top-[calc(50%-104px)]">
					<div class="h-full flex justify-center items-center">
						<v-progress-circular indeterminate />
						<span class="pl-2">{{ t('product_request.saving') }}</span>
					</div>
				</div>
			</div>
			<!-- Load mask -->
			<div v-if="nomenclatureStore.load || !analogReady" class="flex justify-center pt-10">
				<v-progress-circular indeterminate />
			</div>
			<!-- Card -->
			<div v-else-if="nomenclatureStore.getProduct.id">
				<div class="w-full pt-2 flex flex-row items-center">
					<q-btn
						color="primary"
						icon="add"
						no-caps
						:label="t('product_request.create_container_analogs')"
						:disabled="nomenclatureStore.getLoadAnalofList"
					/>
					<!-- <search-input
						class="!h-[32px] ml-auto order-2"
						v-model="searchQuery"
						open
						:delay="600"
						@update:modelValue="onSearch"
					/> -->
				</div>
				<!-- Analogs code -->
				<div class="pt-2 font-bold flex">
					<div class="w-[200px]">{{ t('product_request.container_analogs') }}:</div>
					<div class="select-text cursor-text pl-4">
						{{ `${formNomenclature.container_analog_name} ${formNomenclature.container_analog_code}` }}
					</div>
				</div>
				<!-- Analog list -->
				<q-form ref="analogsForm">
					<analog-list v-if="analogReady" @save-container-analog="saveContainerAnalogue" />
				</q-form>
			</div>
		</div>
		<!-- Right informations bar -->
		<template #sidebar>
			<sidebar-detail icon="info_outline" :title="t('information')" close>
				<div v-md="t('product_request.orders_help_files_collection')" class="page-description"></div>
			</sidebar-detail>
		</template>
	</private-view>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';

import ProductRequestNavigation from '../../components/navigation.vue';
import AnalogList from './components/analog-list.vue';
import { AnalogListType } from '@directus/nest-api/general-types';
import { useCardStore } from '../stores/card.ts';
import { useNomenclatureStore } from '../stores/nomenclature.ts';
import { analogModel, prepareAnalogListForSave } from './composables/nomenclature-model.ts';
import { notify } from '@/utils/notify';

const cardStore = useCardStore(),
	nomenclatureStore = useNomenclatureStore(),
	{ containerAnalogue, formNomenclature } = storeToRefs(nomenclatureStore);

const { t } = useI18n(),
	route = useRoute(),
	router = useRouter(),
	analogsForm = ref(null),
	analogReady = ref(false),
	{ breadcrumb } = useBreadcrumb();

if (!cardStore.getOrder.theme) {
	cardStore.loadOrder(route.params.primaryKey, 'active');
}

nomenclatureStore.loadNomenclature(route.params.productId, route.params.containerId).then(() => {
	const nomenclature = nomenclatureStore.getProduct.product_list_analog[0];
	if (nomenclature) fillContainer();
	else analogReady.value = true;
});

// Наполнение формы ранее сохраненного контейнера аналогов
async function fillContainer(): void {
	let analogueList = nomenclatureStore.getContainers[0].analog_list;
	let container = {};
	for (let i in analogueList) {
		if (!container[i]) container[i] = [];
		for (let j in analogueList[i]) {
			const groupValue = analogueList[i][j].group_value,
				grounName = analogueList[i][j].group_name;
			const model: AnalogListType = await analogModel({ groupValue, grounName }, nomenclatureStore);
			container[i].push({
				...model,
				...analogueList[i][j],
				id: analogueList[i][j].id,
				ic: analogueList[i][j].code,
			});
		}
	}
	analogReady.value = true;
	containerAnalogue.value = container;
}

// Сохранение контейнера анлогов
const saveContainerAnalogue = async (params: {
	form?: AnalogListType;
	indexGroup?: string;
	indexItem?: number;
	valid?: boolean;
}): void => {
	// Едичиный элемент
	if (params?.form) {
		if (params.valid) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { form, indexGroup, indexItem, valid } = params;
			const analogList = {};
			analogList[indexGroup] = [form];
			save(analogList);
		} else {
			notify({
				title: t('product_request.form_validation_error'),
				type: 'error',
				icon: 'save',
			});
		}
	}
	// Сохранение всего контейнера
	else {
		const analogsFormValidate = await analogsForm.value.validate();
		if (!analogsFormValidate || params?.valid === false) {
			notify({
				title: t('product_request.form_validation_error'),
				type: 'error',
				icon: 'save',
			});
		} else {
			save();
		}
	}
};

// Отправка запроса на сохранение
async function save(analogList = containerAnalogue.value): void {
	const prepareAnalogList = prepareAnalogListForSave(analogList);
	const nomenclatureModel = {
		request_id: route.params.primaryKey,
		product_id: route.params.productId,
		container_id: route.params.containerId != 0 ? route.params.containerId : uuidv4(),
		analog_list: prepareAnalogList,
		container_analog_name: nomenclatureStore.getProduct.name,
		container_analog_code: nomenclatureStore.getNextCodeAnalofList,
	};
	const saveResult = await nomenclatureStore.onSaveNomenclature(nomenclatureModel);
	if (saveResult.success) {
		for (let key in analogList) {
			for (let i in analogList[key]) {
				const item = containerAnalogue.value[key].find((ca) => ca.id === analogList[key][i].id);
				item.save = true;
			}
		}

		// router.push(`${route.params.primaryKey}/nomenclature/${route.params.productId}/${saveResult.container_analog.id}`);

		notify({
			title: t('save_success'),
			type: 'success',
			icon: 'check',
		});
	} else {
		notify({
			title: t('save_error'),
			type: 'error',
			icon: 'save',
		});
	}
}

function useBreadcrumb() {
	const breadcrumb = computed(() => {
		return [
			{
				name: cardStore.getOrder.theme,
				to: `/product-request/active/${route.params.primaryKey}`,
			},
		];
	});

	return { breadcrumb };
}
</script>
