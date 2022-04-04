<template>
	<private-view :title="'Active'">
		<template #headline>Active</template>
		<div class="p-4 border border-solid border-red-500">
			<q-btn label="Test request Nest API" color="secondary" @click="fetchNestAPI" />
			<pre>{{ responseNest }}</pre>
		</div>
		<template #sidebar>
			<!-- Informations -->
			<sidebar-detail icon="info_outline" :title="'Информация'" close>
				<div v-md="'Информация'" class="page-description"></div>
			</sidebar-detail>
		</template>
	</private-view>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

import api from '@/api';

const responseNest = ref('');

const fetchNestAPI = () => {
	api
		.get(`/nest`)
		.then((data) => {
			responseNest.value = data.data.toString();
		})
		.catch((err) => (responseNest.value = err.toString()));
};
</script>
