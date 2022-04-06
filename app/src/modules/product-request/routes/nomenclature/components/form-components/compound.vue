<template>
	<q-expansion-item class="compound" expand-separator switch-toggle-side>
		<template #header>
			<div class="flex justify-between items-center w-full">
				<div class="text-bold brand-sm">{{ title }}</div>
				<div class="spacer" />
				<div class="actions">
					<v-button class="action-delete" icon rounded @click="$emit('delete')">
						<v-icon name="delete" />
					</v-button>
				</div>
			</div>
		</template>
		<q-expansion-item class="pl-2" expand-separator switch-toggle-side>
			<template #header>
				<div class="text-bold">Состав контейнера аналогов</div>
			</template>
			<div class="flex text-bold">
				<div class="flex-1">Код реализации</div>
				<div class="compound-name">Наименование</div>
				<div class="compound-count">Количество</div>
			</div>
			<q-expansion-item class="compound-item" expand-separator switch-toggle-side>
				<template #header>
					<div class="flex text-bold full-width">
						<div class="compound-main">
							<span class="compound-status mr-2" :class="baseCompound.status" />
							{{ baseCompound.code }}
						</div>
						<div class="compound-name">{{ baseCompound.name }}</div>
						<div class="compound-count" />
					</div>
				</template>
				<q-tree node-key="code" :nodes="baseCompound.children" icon="keyboard_arrow_down" no-connectors>
					<template #default-header="props">
						<div class="flex full-width items-center">
							<div class="compound-main">
								<span class="compound-status mr-2" :class="props.node.status" />
								{{ props.node.code }}
							</div>
							<div class="compound-name">{{ props.node.name }}</div>
							<div class="compound-count flex justify-between">
								<!--	Add click.stop to stop propagation, because otherwise focus by click is not work	-->
								<q-input
									v-model="props.node.count_fact"
									class="custom-min w-[95px]"
									outlined
									type="number"
									color="primary"
									@click.stop
								/>
								<q-select
									v-model="props.node.uom_id"
									outlined
									map-options
									emit-value
									:options="uom_list"
									option-value="id"
									option-label="designation"
									color="primary"
									class="custom-min w-[95px]"
								/>
							</div>
						</div>
					</template>
				</q-tree>
			</q-expansion-item>
		</q-expansion-item>
	</q-expansion-item>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { storeToRefs } from 'pinia';

import { useNomenclatureStore } from '@/modules/product-request/routes/stores/nomenclature';

defineProps<{
	title: string;
}>();
defineEmits<{
	(e: 'delete'): void;
}>();

const { uom_list } = storeToRefs(useNomenclatureStore());

interface CompoundItem {
	code: string;
	name: string;
	status: string;
}

interface CompoundChild extends CompoundItem {
	count_fact: number;
	uom_id: string;
	children?: this[];
}

interface Compound extends CompoundItem {
	children: CompoundChild[];
}

const baseCompound: Compound = reactive({
	code: 'ASD456WQ',
	name: 'Предохранитель плавкий',
	status: 'active',
	children: [
		{
			code: 'SN135481',
			name: 'Проволока плавкая',
			count_fact: 0.05,
			uom_id: '6d99fef2-512c-4bdb-8e7e-a746326e6e48',
			status: 'active',
		},
		{
			code: 'SN123223',
			name: 'Корпус в сборе',
			count_fact: 1,
			uom_id: '2bf25a91-e532-4590-81e6-6767bbce85a2',
			status: 'active',
			children: [
				{
					code: 'SN321343',
					name: 'Корпус левый',
					count_fact: 1,
					uom_id: '2bf25a91-e532-4590-81e6-6767bbce85a2',
					status: 'active',
					children: [
						{
							code: 'SN321344',
							name: 'Корпус левый левый',
							count_fact: 1,
							uom_id: '2bf25a91-e532-4590-81e6-6767bbce85a2',
							status: 'active',
						},
					],
				},
				{
					code: 'SN321345',
					name: 'Корпус правый',
					count_fact: 1,
					uom_id: '2bf25a91-e532-4590-81e6-6767bbce85a2',
					status: 'restricted',
				},
			],
		},
	],
});
</script>

<style scoped lang="scss">
.compound {
	// Remove side paddings
	:deep(> .q-expansion-item__container > .q-item) {
		padding: 5px 0;
	}

	&-main {
		display: flex;
		flex: 1;
		align-items: center;
	}

	&-status {
		width: 20px;
		height: 20px;
		border-radius: 50%;

		&.active {
			background-color: var(--q-positive);
		}

		&.restricted {
			background-color: var(--q-negative);
		}
	}

	&-name {
		width: 300px;
	}

	&-count {
		width: 200px;
	}

	// Remove side paddings
	:deep(.q-expansion-item > .q-expansion-item__container > .q-item) {
		padding: 5px 0;
	}

	:deep(.q-tree) {
		.q-tree__node-header {
			padding: 0 0 0 25px;
		}

		.q-tree__arrow {
			font-size: 24px;
		}

		.q-tree__arrow--rotate {
			transform: rotate3d(0, 0, 1, 180deg);
		}
	}

	// Hide arrows
	:deep(.q-input) {
		input[type='number'] {
			&::-webkit-outer-spin-button,
			&::-webkit-inner-spin-button {
				-webkit-appearance: none;
				margin: 0;
			}
		}
	}
}
</style>
