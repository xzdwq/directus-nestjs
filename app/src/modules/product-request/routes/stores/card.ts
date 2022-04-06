import { defineStore } from 'pinia';

import api from '@/api';
import utils from '../../composables/utils';
import { RequestDTO } from '@directus/nest-api/general-types';

export const useCardStore = defineStore({
	id: 'card',
	state: () => ({
		load: false as boolean,
		order: {} as RequestDTO,
		orderProducts: [] as any,
		basePriority: [] as any,
		baseStatus: [] as any,
		searchProductQuery: '',
		searchProductLoad: false as boolean,
	}),
	getters: {
		getOrder: (state) => state.order,
		getBasePriority: (state) => state.basePriority,
		getBaseStatus: (state) => state.baseStatus,
		getProductQuery: (state) => {
			const products = state.order.product_list;
			if (state.searchProductQuery) {
				state.searchProductLoad = true;
				const result = products.filter((item: any) => {
					return item.name.toLowerCase().includes(state.searchProductQuery.toLowerCase());
				});
				state.searchProductLoad = false;
				return result;
			} else {
				return products;
			}
		},
		getSearchProductQuery: (state) => state.searchProductQuery,
		getSearchProductLoad: (state) => state.searchProductLoad,
	},
	actions: {
		async loadOrder(id: string, type: string) {
			this.searchProductQuery = '';
			this.load = true;
			this.order = {} as RequestDTO;
			try {
				const cardData = await api.get(`/nest/product-request/${id}`);
				this.order = cardData.data.data;
				this.orderProducts = cardData.data.data.product_list;
				this.basePriority = cardData.data.basePriority;
				this.baseStatus = (await utils.statusSerialize(
					cardData.data.baseStatus,
					cardData.data.data.status_link.status_type,
					type
				)) as any;
				// this.baseStatus = cardData.data.baseStatus
				return cardData.data;
			} finally {
				this.load = false;
			}
		},
		async saveCard(card: any) {
			this.load = true;
			try {
				const cardData = await api.post(`/nest/product-request/${card.id}`, {
					params: card,
				});
				return cardData;
			} catch (e: any) {
				return e;
			} finally {
				this.load = false;
			}
		},
	},
});
