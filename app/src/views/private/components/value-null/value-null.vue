<template>
	<span class="null">{{ props.emptyText }}</span>
</template>

<script lang="ts" setup>
interface Props {
	emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
	emptyText: '--',
});
</script>

<style scoped>
.null {
	color: var(--border-normal); /* Don't confuse NULL with subdued value */
}
</style>
