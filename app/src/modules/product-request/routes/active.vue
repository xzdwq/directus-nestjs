<template>
	<private-view :title="'Active'">
		<template #headline>Active</template>
		<div class="p-4 border border-solid border-red-500">
			<q-input v-model="formOrder" :label="'product_request.order_number'" color="primary" type="number" />
			<q-btn v-close-popup label="OK" color="primary" flat />
			<q-btn icon="edit" label="Edit" color="secondary" @click="fetchNestAPI" />
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
// import axios from 'axios';

const formOrder = ref(1),
	responseNest = ref('');

const fetchNestAPI = () => {
	// axios.get('http://localhost:7000/').then((data) => {
	// 	responseNest.value = data.data.toString();
	// });
	api
		.get(`/nest`)
		.then((data) => {
			responseNest.value = data.data.toString();
		})
		.catch((err) => (responseNest.value = err.toString()));
};
</script>
