<template>
	<tr
		class="table-row"
		:class="{ subdued: subdued, clickable: hasClickListener }"
		@click="$emit('click', $event)"
		@dblclick="$emit('dblclick')"
	>
		<td v-if="showManualSort" class="manual cell" @click.stop>
			<v-icon name="drag_handle" class="drag-handle" :class="{ 'sorted-manually': sortedManually }" />
		</td>

		<td v-if="showSelect !== 'none'" class="select cell" @click.stop>
			<v-checkbox
				:icon-on="showSelect === 'one' ? 'radio_button_checked' : undefined"
				:icon-off="showSelect === 'one' ? 'radio_button_unchecked' : undefined"
				:model-value="isSelected"
				@update:model-value="$emit('item-selected', $event)"
			/>
		</td>

		<td v-if="showExpandRow" class="select cell" @click.stop="expandedRow(item)">
			<v-icon
				v-tooltip="item.expanded ? t('collapse') : t('expand')"
				:name="item.expanded ? 'indeterminate_check_box' : 'add_box'"
				class="cursor-pointer duration-300 hover:text-[color:var(--primary)]"
			/>
		</td>

		<td v-for="header in headers" :key="header.value" class="cell" :class="`align-${header.align}`">
			<slot :name="`item.${header.value}`" :item="item">
				<v-text-overflow
					v-if="renderRow(item, header)"
					v-tooltip.top="renderTooltip(item, header)"
					:text="renderRow(item, header)"
					:class="renderStyle(item, header)"
					:style="header.cellWrap ? 'white-space: break-spaces; width: 100%;' : null"
					v-html="render(item, header) ? render(item, header) : renderRow(item, header)"
				/>
				<value-null v-else :empty-text="header.emptyText || null" />
			</slot>
		</td>

		<td class="spacer cell" />
		<td v-if="$slots['item-append']" class="append cell" style="width: max-content" @click.stop>
			<slot name="item-append" />
		</td>
	</tr>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ShowSelect } from '@directus/shared/types';
import { Header, Item } from './types';
import { useI18n } from 'vue-i18n';

interface Props {
	headers: Header[];
	item: Item;
	showSelect: ShowSelect;
	showManualSort?: boolean;
	isSelected?: boolean;
	subdued?: boolean;
	sortedManually?: boolean;
	hasClickListener?: boolean;
	height?: number;
	showExpandRow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showSelect: 'none',
	showManualSort: false,
	isSelected: false,
	subdued: false,
	sortedManually: false,
	hasClickListener: false,
	height: 48,
	showExpandRow: false,
});

const emit = defineEmits(['click', 'item-selected', 'dblclick', 'expanded']);

const cssHeight = computed(() => props.height + 2 + 'px');

const { t } = useI18n();

/**
 * Outputting a value to a table from a deeply nested data object.
 * Checking for an array inside an object property and possibly returning the number of elements inside the array
 * @param {string} header - propName.propName[]
 */
const renderRow = (item, header) => {
	try {
		return header.value.split('.').reduce((acc, val) => {
			// We find matches in the string according to the pattern <prop>[<index>]
			const arrayIndexInString = val.match(/(?<=\[)([\d])(?=\])/gi);
			if (arrayIndexInString) {
				// Parsing a string for a character [
				const splitVal = val.split('[')[0];
				// We give in the next iteration reduce the value inside the array
				acc[val] = acc[splitVal][arrayIndexInString[0]];
			}
			// If you need to return count from the array, then return count, if not, then last value from the object
			return header.count && Array.isArray(acc[val]) ? acc[val].length : acc[val];
		}, item);
	} catch (e) {
		return null;
	}
};

const renderStyle = (item, header) => {
	let renderClass = [];
	if (header.renderClass) renderClass.push(header.renderClass(item));
	if (header.class) renderClass.push(header.class);
	const isTooltip = renderTooltip(item, header);
	if (isTooltip && header.tooltip.class) renderClass.push(header.tooltip.class);
	return renderClass.join(' ');
};

const render = (item, header) => {
	return header.render ? header.render(item) : '';
};

const renderTooltip = (item, header) => {
	if (header.tooltip?.text) return header.tooltip.text;
	if (header.tooltip?.map) {
		try {
			return header.tooltip.map.split('.').reduce((acc, val) => {
				return acc[val];
			}, item);
		} catch (e) {
			return null;
		}
	}
	return null;
};

const expandedRow = (item) => {
	item.expanded = !item.expanded;
	emit('expanded', item.expanded);
};
</script>

<style lang="scss" scoped>
.table-row {
	height: v-bind(cssHeight);

	.cell {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		background-color: var(--v-table-background-color);
		border-bottom: var(--border-width) solid var(--border-subdued);

		&:last-child {
			padding: 0 12px;
		}

		&.select {
			display: flex;
			align-items: center;
		}
	}

	&.subdued .cell {
		opacity: 0.3;
	}

	&.clickable:not(.subdued):hover .cell {
		background-color: var(--background-subdued);
		cursor: pointer;
	}

	.drag-handle {
		--v-icon-color: var(--foreground-subdued);

		&.sorted-manually {
			--v-icon-color: var(--foreground-normal);

			&:hover {
				cursor: ns-resize;
			}
		}
	}

	.append {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
}
</style>
