<template>
	<private-view :title="cardStore.getOrder.theme">
		<template v-if="breadcrumb" #headline>
			<v-breadcrumb :items="breadcrumb" />
		</template>
		<!-- Header -->
		<template #title-outer:prepend>
			<v-button rounded icon secondary exact @click="router.back()">
				<v-icon name="arrow_back" />
			</v-button>
		</template>
		<!-- Header button -->
		<template #actions>
			<!-- Save -->
			<v-button rounded icon :disabled="false" @click="saveCard">
				<v-icon name="check" outline />
			</v-button>
		</template>
		<!-- Left navigations bar -->
		<template #navigation>
			<product-request-navigation :type="navType" />
		</template>
		<!-- Body -->
		<div class="px-9">
			<!-- Load mask -->
			<div v-if="cardStore.load" class="flex justify-center pt-10">
				<v-progress-circular indeterminate />
			</div>
			<!-- Card -->
			<div v-else-if="cardStore.getOrder.id">
				<!-- First row -->
				<div class="lg:flex">
					<!-- Order number -->
					<q-input
						v-model="formOrder.order_number"
						:label="t('product_request.order_number')"
						color="primary"
						class="w-full lg:pr-4"
						type="number"
						:min="1"
						:readonly="isReadOnly"
					/>
					<!-- Priority -->
					<q-select
						v-model="formOrder.priority"
						:options="cardStore.getBasePriority"
						map-options
						option-value="id"
						option-label="name"
						:label="t('product_request.priority')"
						color="primary"
						class="w-full lg:pr-4"
					/>
					<!-- Status -->
					<q-select
						v-model="formOrder.status"
						:options="cardStore.getBaseStatus"
						map-options
						option-value="id"
						option-label="name"
						:label="t('product_request.status')"
						color="primary"
						class="w-full lg:pr-4"
					/>
				</div>
				<!-- Second row -->
				<div class="lg:flex">
					<!-- Departure date -->
					<q-input
						v-model="formOrder.create_at"
						:label="t('product_request.departure_date')"
						color="primary"
						class="w-full lg:pr-4"
						mask="##.##.####"
						:readonly="isReadOnly"
					>
						<template #append>
							<q-icon name="event" class="cursor-pointer">
								<q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
									<q-date
										v-model="formOrder.create_at"
										minimal
										:mask="utils.date_format_ru"
										color="primary"
										:readonly="isReadOnly"
									>
										<div class="row items-center justify-end -mt-10">
											<q-btn v-close-popup label="OK" color="primary" flat />
										</div>
									</q-date>
								</q-popup-proxy>
							</q-icon>
						</template>
					</q-input>
					<!-- Separate -->
					<div class="w-full"></div>
					<!-- Update status date -->
					<q-input
						v-model="formOrder.update_at"
						:label="t('product_request.update_status_date')"
						color="primary"
						class="w-full lg:pr-4"
						mask="##.##.####"
						:readonly="isReadOnly"
					>
						<template #append>
							<q-icon name="event" class="cursor-pointer">
								<q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
									<q-date
										v-model="formOrder.update_at"
										minimal
										:mask="utils.date_format_ru"
										color="primary"
										:readonly="isReadOnly"
									>
										<div class="row items-center justify-end -mt-10">
											<q-btn v-close-popup label="OK" color="primary" flat />
										</div>
									</q-date>
								</q-popup-proxy>
							</q-icon>
						</template>
					</q-input>
				</div>
				<!-- Third row -->
				<div class="lg:flex">
					<!-- Initiator -->
					<q-select
						v-model="formOrder.initiator.person.full_name_ru"
						:options="ordersStore.getEmployee"
						map-options
						use-input
						clearable
						input-debounce="600"
						option-value="emploee_id"
						option-label="person_full_name_ru"
						:label="t('product_request.order_initiator')"
						color="primary"
						class="w-full lg:pr-4"
						:readonly="isReadOnly"
						@filter="filterFn"
					>
						<template #option="scope">
							<q-item v-bind="scope.itemProps">
								<q-item-section>
									<q-item-label>{{ scope.opt.person_full_name_ru }}</q-item-label>
									<q-item-label caption>{{ scope.opt.position_name }}</q-item-label>
								</q-item-section>
							</q-item>
						</template>
					</q-select>
					<!-- Separate -->
					<!-- <div class="w-full"></div> -->
					<!-- Executor -->
					<q-select
						v-model="formOrder.executor.person.full_name_ru"
						:options="ordersStore.getEmployee"
						map-options
						use-input
						clearable
						input-debounce="600"
						option-value="emploee_id"
						option-label="person_full_name_ru"
						:label="t('product_request.order_executor')"
						color="primary"
						class="w-full lg:pr-4"
						:readonly="navType === 'archive'"
						@filter="filterFn"
					>
						<template #option="scope">
							<q-item v-bind="scope.itemProps">
								<q-item-section>
									<q-item-label>{{ scope.opt.person_full_name_ru }}</q-item-label>
									<q-item-label caption>{{ scope.opt.position_name }}</q-item-label>
								</q-item-section>
							</q-item>
						</template>
						<template v-if="navType !== 'archive'" #append>
							<q-icon name="search" />
						</template>
					</q-select>
				</div>
				<!-- Fourth row -->
				<!-- Products -->
				<products :store="cardStore.getProductQuery" />
			</div>
			<!-- No data -->
			<v-info v-else icon="box" :title="t('product_request.no_data')" center>
				<div>
					{{ t('product_request.no_data_info') }}
				</div>
			</v-info>
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
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { date } from 'quasar';

import ProductRequestNavigation from '../../components/navigation.vue';
import { useCardStore } from '../stores/card.ts';
import { useOrderStore } from '../stores/orders.ts';
import { RequestDTO } from '@directus/nest-api/general-types';
import Products from './components/products-table.vue';

import utils from '../../composables/utils';
import { notify } from '@/utils/notify';

const { breadcrumb } = useBreadcrumb();
const { t } = useI18n();

const navType = ref(),
	orderUuid = ref(),
	route = useRoute(),
	router = useRouter();
if (route.name.includes('active')) navType.value = 'active';
if (route.name.includes('archive')) navType.value = 'archive';

orderUuid.value = route.params.primaryKey;

const isReadOnly = ref<boolean>(true);

const ordersStore = useOrderStore();
const cardStore = useCardStore(),
	formOrder = ref<Promise<RequestDTO>>({
		initiator: { person: {} },
		executor: { person: {} },
		order_products: [],
	});

const loadOrder = (): void => {
	cardStore.loadOrder(orderUuid.value, navType.value).then(() => {
		const create_at = date.formatDate(cardStore.getOrder.create_at, utils.date_format_ru),
			update_at = date.formatDate(cardStore.getOrder.update_at, utils.date_format_ru);
		const form_tmp = {
			...cardStore.getOrder,
			status: cardStore.getOrder.status_link.status_type,
			initiator: cardStore.getOrder.initiator?.person ? cardStore.getOrder.initiator : { person: {} },
			executor: cardStore.getOrder.executor?.person ? cardStore.getOrder.executor : { person: {} },
			create_at: create_at,
			update_at: update_at,
		};
		// formOrder.value = Object.create(form_tmp)
		formOrder.value = form_tmp;
	});
};
loadOrder();

function filterFn(val, update) {
	update(() => {
		if (val === '') return;
		ordersStore.findPerson(val);
	});
}

function useBreadcrumb() {
	const breadcrumb = computed(() => {
		return [
			{
				name: t(`product_request.${navType.value}_orders`),
				to: `/product-request/${navType.value}`,
			},
		];
	});

	return { breadcrumb };
}

// const deleteOrderAndQuit = async () => {
// 	await ordersStore.removeOrder(formOrder.value.id);
// 	router.push(`/product-request/${navType.value}`);
// };

async function saveCard() {
	const cardData = {
		id: formOrder.value.id,
		order_number: formOrder.value.order_number,
		priority: {
			id: formOrder.value.priority.id,
			code: formOrder.value.priority.code,
		},
		status: {
			id: formOrder.value.status.id,
			code: formOrder.value.status.code,
		},
		initiator: {
			person_id:
				typeof formOrder.value.initiator?.person?.full_name_ru === 'string'
					? formOrder.value.initiator.person.id
					: formOrder.value.initiator?.person?.full_name_ru?.person_id,
			employee_id:
				typeof formOrder.value.initiator?.person?.full_name_ru === 'string'
					? formOrder.value.initiator.id
					: formOrder.value.initiator?.person?.full_name_ru?.emploee_id,
			full_name_ru:
				typeof formOrder.value.initiator?.person?.full_name_ru === 'string'
					? formOrder.value.initiator.person.full_name_ru
					: formOrder.value.initiator?.person?.full_name_ru?.person_full_name_ru,
		},
		executor: {
			person_id:
				typeof formOrder.value.executor?.person?.full_name_ru === 'string'
					? formOrder.value.executor.person.id
					: formOrder.value.executor?.person?.full_name_ru?.person_id,
			employee_id:
				typeof formOrder.value.executor?.person?.full_name_ru === 'string'
					? formOrder.value.executor.id
					: formOrder.value.executor?.person?.full_name_ru?.emploee_id,
			full_name_ru:
				typeof formOrder.value.executor?.person?.full_name_ru === 'string'
					? formOrder.value.executor.person.full_name_ru
					: formOrder.value.executor?.person?.full_name_ru?.person_full_name_ru,
		},
	};
	cardStore.saveCard(cardData).then((data) => {
		if (data.status < 300) {
			notify({
				title: t('save_success'),
				type: 'success',
				icon: 'save',
			});
		} else {
			notify({
				title: t('save_error_discription'),
				type: 'error',
				icon: 'save',
			});
		}
		loadOrder();
	});
}
</script>

<style lang="scss" scoped>
.action-delete {
	--v-button-background-color: var(--danger-10);
	--v-button-color: var(--danger);
	--v-button-background-color-hover: var(--danger-25);
	--v-button-color-hover: var(--danger);
}
</style>
