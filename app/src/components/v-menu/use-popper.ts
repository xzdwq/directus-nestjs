import { createPopper } from '@popperjs/core/lib/popper-lite';
import { Instance, Modifier, Placement } from '@popperjs/core';
import arrow from '@popperjs/core/lib/modifiers/arrow';
import computeStyles from '@popperjs/core/lib/modifiers/computeStyles';
import eventListeners from '@popperjs/core/lib/modifiers/eventListeners';
import flip from '@popperjs/core/lib/modifiers/flip';
import offset from '@popperjs/core/lib/modifiers/offset';
import popperOffsets from '@popperjs/core/lib/modifiers/popperOffsets';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { onUnmounted, ref, Ref, watch } from 'vue';

export function usePopper(
	reference: Ref<HTMLElement | null>,
	popper: Ref<HTMLElement | null>,
	options: Readonly<
		Ref<Readonly<{ placement: Placement; attached: boolean; arrow: boolean; offsetY: number; offsetX: number }>>
	>
): Record<string, any> {
	const popperInstance = ref<Instance | null>(null);
	const styles = ref({});
	const arrowStyles = ref({});

	// The internal placement can change based on the flip / overflow modifiers
	const placement = ref(options.value.placement);

	onUnmounted(() => {
		stop();
	});

	watch(
		options,
		() => {
			popperInstance.value?.setOptions({
				placement: options.value.attached ? 'bottom-start' : options.value.placement,
				modifiers: getModifiers(),
			});
		},
		{ immediate: true }
	);

	const observer = new MutationObserver(() => {
		popperInstance.value?.forceUpdate();
	});

	return { popperInstance, placement, start, stop, styles, arrowStyles };

	function start() {
		return new Promise((resolve) => {
			popperInstance.value = createPopper(reference.value!, popper.value!, {
				placement: options.value.attached ? 'bottom-start' : options.value.placement,
				modifiers: getModifiers(resolve),
				strategy: 'fixed',
			});
			popperInstance.value.forceUpdate();
			observer.observe(popper.value!, {
				attributes: false,
				childList: true,
				characterData: true,
				subtree: true,
			});
		});
	}

	function stop() {
		popperInstance.value?.destroy();
		observer.disconnect();
	}

	function getModifiers(callback: (value?: unknown) => void = () => undefined) {
		const modifiers: Modifier<string, any>[] = [
			popperOffsets,
			{
				...offset,
				options: {
					offset: options.value.attached ? [0, 0] : [options.value.offsetX ?? 0, options.value.offsetY ?? 8],
				},
			},
			{
				...preventOverflow,
				options: {
					padding: 8,
				},
			},
			computeStyles,
			flip,
			eventListeners,
			{
				name: 'placementUpdater',
				enabled: true,
				phase: 'afterWrite',
				fn({ state }) {
					placement.value = state.placement;
				},
			},
			{
				name: 'applyStyles',
				enabled: true,
				phase: 'write',
				fn({ state }) {
					styles.value = state.styles.popper;
					arrowStyles.value = state.styles.arrow;
					callback();
				},
			},
		];

		if (options.value.arrow === true) {
			modifiers.push({
				...arrow,
				options: {
					padding: 6,
				},
			});
		}

		if (options.value.attached === true) {
			modifiers.push({
				name: 'sameWidth',
				enabled: true,
				fn: ({ state }) => {
					state.styles.popper.width = `${state.rects.reference.width}px`;
				},
				phase: 'beforeWrite',
				requires: ['computeStyles'],
			});
		}

		return modifiers;
	}
}
