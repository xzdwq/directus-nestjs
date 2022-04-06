import { defineStore } from 'pinia';

import api from '@/api';
import { RequestDTO } from '@directus/nest-api/general-types';

export const useOrderStore = defineStore({
	id: 'orders',
	state: () => ({
		needLoadInfo: true,
		load: false as boolean,
		orders: [] as RequestDTO[],
		totalActive: 0 as number,
		totalActiveMe: 0 as number,
		totalArchive: 0 as number,
		basePriority: [] as any,
		baseStatus: [] as any,
		employee: [],
		page: 1,
		limit: 10 as any,
		totalPages: 0,
		countInfo: '',
		lastType: '' as string,
		selectionWritable: [],
	}),
	getters: {
		getOrders: (state) => state.orders,
		getTotalActive: (state) => state.totalActive,
		getTotalActiveMe: (state) => state.totalActiveMe,
		getTotalArchive: (state) => state.totalArchive,
		getBasePriority: (state) => state.basePriority,
		getBaseStatus: (state) => state.baseStatus,
		getEmployee: (state) => state.employee,
		getTotalPages: (state) => state.totalPages,
		getLimit: (state) => state.limit,
		getPage: (state) => state.page,
		getCountInfo: (state) => state.countInfo,
		getSelectionWritable: (state) => state.selectionWritable,
	},
	actions: {
		async loadOrders(t: any, n: any, type: string, filter: string, search: string) {
			this.load = true;
			if (this.lastType != type) {
				this.lastType = type;
				this.page = 1;
			}
			try {
				const ordersData = await api.get(`/nest/product-request`, {
					params: {
						page: this.page,
						limit: this.limit,
						type: type,
						filter: filter,
						search: search,
					},
				});
				if (type === 'active') {
					this.totalActive = ordersData.data.generalTotal;
				} else if (type === 'archive') {
					this.totalArchive = ordersData.data.generalTotal;
				}
				this.orders = ordersData.data.data as RequestDTO[];
				this.baseStatus = ordersData.data.baseStatus;
				this.basePriority = ordersData.data.basePriority;

				let startList = 1,
					limitList = ordersData.data.total;
				if (this.limit != 'All') {
					this.totalPages = Math.ceil(ordersData.data.total / this.limit);
					limitList = this.limit * this.page;
					startList = limitList - this.limit + 1;
				} else {
					this.totalPages = 1;
				}
				if (limitList > ordersData.data.total) limitList = ordersData.data.total;
				this.countInfo = t('start_end_of_count_items', {
					start: n(startList),
					end: n(limitList),
					count: n(ordersData.data.generalTotal),
				});
				if (filter || search) {
					if (+ordersData.data.total === 0) this.countInfo = t('no_items_found');
					if (+ordersData.data.total === 1) this.countInfo = t('one_item');
				}
			} catch (e) {
				this.orders = [];
			} finally {
				this.load = false;
			}
		},
		async loadOrdersInfo() {
			try {
				if (this.needLoadInfo) {
					const ordersData = await api.get(`/nest/product-request/ordersinfo`);
					if (ordersData.data.success) {
						this.totalActiveMe = ordersData.data.totalActiveMe;
						this.employee = ordersData.data.employee;
						this.totalActive = ordersData.data.totalActive;
						this.totalArchive = ordersData.data.totalArchive;
					}
					this.needLoadInfo = false;
				}
			} catch (e: any) {
				// console.log(e.toString());
			}
		},
		async findPerson(val: string) {
			try {
				const employeeData = await api.get(`/nest/employee/find`, {
					params: {
						query: val,
					},
				});
				this.employee = employeeData.data;
			} catch (e: any) {
				// console.log(e.toString());
			}
		},
		async sendSelectedAction(orders: [], params: any) {
			this.load = true;
			try {
				const updateData = await api.post(`/nest/product-request/update/orders`, {
					params: {
						orders: orders,
						data: params,
					},
				});
				this.orders = updateData.data.data;
				return updateData;
			} finally {
				this.load = false;
			}
		},
		async removeOrder(order_id: string) {
			await api.delete(`/nest/product-request/order/${order_id}`);
		},
		async removeOrders(orders_id: []) {
			await api.post(`/nest/product-request/orders/delete`, {
				params: {
					orders: orders_id,
				},
			});
		},
	},
});
