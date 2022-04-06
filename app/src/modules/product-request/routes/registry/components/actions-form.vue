<template>
	<sidebar-detail
		icon="edit_note"
		:title="t('actions', { count: ordersStore.getSelectionWritable.length })"
		:badge="ordersStore.getSelectionWritable.length"
	>
		<!-- Executor -->
		<q-select
			v-if="type === 'active'"
			v-model="formModel.executor.person.full_name_ru"
			:options="ordersStore.getEmployee"
			map-options
			use-input
			clearable
			input-debounce="400"
			option-value="emploee_id"
			option-label="person_full_name_ru"
			:label="t('product_request.order_executor')"
			color="primary"
			class="w-full lg:pr-4"
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
		<!-- Delete executor -->
		<q-checkbox v-if="type === 'active'" v-model="deleteExecutor" :label="t('if_empty_delete')" color="primary" />
		<!-- Status -->
		<q-select
			v-model="formModel.status"
			:options="ordersStore.getBaseStatus"
			map-options
			clearable
			option-value="id"
			option-label="name"
			:label="t('product_request.status')"
			color="primary"
			class="w-full lg:pr-4"
		/>
		<!-- Priority -->
		<q-select
			v-if="type === 'active'"
			v-model="formModel.priority"
			:options="ordersStore.getBasePriority"
			map-options
			clearable
			option-value="id"
			option-label="name"
			:label="t('product_request.priority')"
			color="primary"
			class="w-full lg:pr-4"
		/>
		<!-- Apply -->
		<q-btn color="primary" :label="t('apply')" no-caps style="width: 100%; margin-top: 10px" @click="onApply" />
	</sidebar-detail>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useOrderStore } from '../../stores/orders.ts';
import { notify } from '@/utils/notify';

interface Props {
	type: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
	type: 'active',
});

const { t } = useI18n();
const ordersStore = useOrderStore();

const formModel = ref<Promise>({
		executor: { person: {} },
	}),
	deleteExecutor = ref(false);

function filterFn(val, update): void {
	update(() => {
		if (val === '') return;
		ordersStore.findPerson(val);
	});
}

const onApply = (): void => {
	const sandData = {
		status_id: formModel.value.status?.id,
		priority_id: formModel.value.priority?.id,
		executor: formModel.value.executor?.person,
		delete_executor: deleteExecutor.value,
	};
	ordersStore.sendSelectedAction(ordersStore.getSelectionWritable, sandData).then((data) => {
		if (data.status && data.status < 300) {
			notify({
				title: t('success_update'),
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
	});
};
</script>
