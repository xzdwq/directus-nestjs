import { defineModule } from '@directus/shared/utils';

import Active from './routes/active.vue';

export default defineModule({
	id: 'product-request',
	hidden: false,
	name: '$t:pr.orders',
	icon: 'fact_check',
	routes: [
		{
			path: '',
			redirect: '/product-request/active',
		},
		{
			name: 'active',
			path: 'active',
			component: Active,
		},
	],
});
