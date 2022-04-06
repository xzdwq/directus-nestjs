<template>
	<private-view :title="t('product_request.orders_system')">
		<template #headline>{{ t('product_request.archive_orders') }}</template>
		<!-- Header -->
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded disabled icon secondary>
				<v-icon name="fact_check" />
			</v-button>
		</template>
		<!-- Show count -->
		<template #actions:prepend>
			<span v-if="ordersStore.getTotalArchive > 0" class="relative mr-2 whitespace-nowrap text-[#a2b5cd] font-semibold">
				{{ ordersStore.getCountInfo }}
			</span>
		</template>
		<template #actions>
			<q-dialog v-model="confirmDelete" persistent>
				<q-card>
					<q-card-section class="row items-center">
						<q-avatar icon="delete" class="text-red-400" />
						<span class="q-ml-sm">{{ t('product_request.delete_orders_are_you_sure') }}</span>
					</q-card-section>
					<q-card-actions align="right">
						<q-btn v-close-popup flat :disable="deleting" :label="t('cancel')" />
						<q-btn flat :loading="deleting" :label="t('remove')" color="primary" @click="onDeleteOrders" />
					</q-card-actions>
				</q-card>
			</q-dialog>
			<!-- Search -->
			<!-- <search-input v-model="searchQuery" /> -->
		</template>
		<!-- Left navigations bar -->
		<template #navigation>
			<product-request-navigation type="archive" />
		</template>
		<!-- Body -->
		<div class="px-9">
			<registry-body :is-reload="isReload" type="archive" />
		</div>
		<!-- Right informations bar -->
		<template #sidebar>
			<sidebar-detail icon="info_outline" :title="t('information')" close>
				<div v-md="t('product_request.orders_help_files_collection')" class="page-description"></div>
			</sidebar-detail>
			<!-- Selected actions form -->
			<actions-form v-if="ordersStore.getSelectionWritable.length > 0" type="archive" />
		</template>
	</private-view>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

import { useOrderStore } from '../stores/orders.ts';
import ProductRequestNavigation from '../../components/navigation.vue';
import RegistryBody from '../registry/registry-body.vue';
import ActionsForm from '../../routes/registry/components/actions-form.vue';

const { t } = useI18n();

const confirmDelete = ref(false),
	deleting = ref(false),
	isReload = ref(false);

const ordersStore = useOrderStore();

const onDeleteOrders = async () => {
	deleting.value = true;
	try {
		isReload.value = false;
		await ordersStore.removeOrders(ordersStore.getSelectionWritable);
		confirmDelete.value = false;
		isReload.value = true;
	} finally {
		deleting.value = false;
	}
};
</script>

<style lang="scss" scoped>
.action-delete {
	--v-button-background-color: var(--danger-10);
	--v-button-color: var(--danger);
	--v-button-background-color-hover: var(--danger-25);
	--v-button-color-hover: var(--danger);
}
</style>
