import { defineModule } from '@directus/shared/utils';

import Active from './routes/active/active-orders.vue';
import Archive from './routes/archive/archive-orders.vue';
import Card from './routes/card/card.vue';
import Nomenclature from './routes/nomenclature/nomenclature.vue';

export default defineModule({
	id: 'product-request',
	hidden: false,
	name: '$t:product_request.orders_system',
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
		{
			name: 'active-card',
			path: 'active/:primaryKey',
			component: Card,
		},
		{
			name: 'archive',
			path: 'archive',
			component: Archive,
		},
		{
			name: 'archive-card',
			path: 'archive/:primaryKey',
			component: Card,
		},
		{
			name: 'nomenclature',
			path: 'active/:primaryKey/nomenclature/:productId/:containerId',
			component: Nomenclature,
		},
	],
});
