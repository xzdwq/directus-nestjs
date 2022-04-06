<template>
	<v-list large>
		<div v-for="item in navItems" :key="item.to">
			<v-list-item :to="`/product-request/${item.to}`" :active="props.type === item.to">
				<v-list-item-icon><v-icon :name="item.icon" outline /></v-list-item-icon>
				<v-list-item-content>
					<v-text-overflow :text="`${item.name} ${item.total ? '(' + total[item.total] + ')' : null}`" />
				</v-list-item-content>
			</v-list-item>
			<v-divider v-if="item.outline" />
		</div>
	</v-list>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useOrderStore } from '../routes/stores/orders.ts';

interface Props {
	type: string;
}
const props = withDefaults(defineProps<Props>(), { type: null });

const ordersStore = useOrderStore(),
	{ t } = useI18n();

ordersStore.loadOrdersInfo();

const { totalActive, totalArchive } = storeToRefs(ordersStore);
const total = ref({
	totalActive: totalActive,
	totalArchive: totalArchive,
});

const navItems = [
	{
		icon: 'pending_actions',
		name: t('product_request.active_orders'),
		to: 'active',
		total: 'totalActive',
	},
	{
		icon: 'archive',
		name: t('product_request.archive_orders'),
		to: 'archive',
		total: 'totalArchive',
	},
];
</script>
