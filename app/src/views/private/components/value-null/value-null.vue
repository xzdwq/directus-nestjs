<template>
	<span class="null">{{ emptyText }}</span>
</template>

<script lang="ts" setup>
interface Props {
	emptyText: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
	emptyText: '--',
});
</script>

<style scoped>
.null {
	color: var(--border-normal); /* Don't confuse NULL with subdued value */
}
</style>
