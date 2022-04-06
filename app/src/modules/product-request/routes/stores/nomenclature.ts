import { defineStore } from 'pinia';

import api from '@/api';
import { AxiosResponse } from 'axios';

export const useNomenclatureStore = defineStore({
	id: 'nomenclature',
	state: () => ({
		load: false as boolean,
		loadAnalogList: false as boolean,
		product: {},
		nomenclature_type: [],
		next_code_analog_list: '',
		new_sn_code: null,
		item_type_list: [],
		kind_list: [],
		subkind_list: [],
		code_type_list: [],
		status_list: '' as string,
		uom_list: [],
		status_localization_list: [],
		classifier_default: [],
		classifier_list: [],
		classifier_load: false,
		pg_load: false,
		contractor_list: [],
		contractor_list_suplr: [],
		uom_group: [],
		saving: false as boolean,
		containers: [],
		containerAnalogue: {},
		formNomenclature: {},
	}),
	getters: {
		getProduct: (state) => state.product,
		getNomenclatureTypeBase: (state) => state.nomenclature_type,
		getNextCodeAnalofList: (state) => state.next_code_analog_list,
		getLoadAnalogList: (state) => state.loadAnalogList,
		getNewSNCode: (state) => state.new_sn_code,
		getItemTypeList: (state) => state.item_type_list,
		getItemKindList: (state) => state.kind_list,
		getSubKindList: (state) => state.subkind_list,
		getCodeTypeList: (state) => state.code_type_list,
		getStatusList: (state) => state.status_list,
		getUOMList: (state) => state.uom_list,
		getStatusLocalizationList: (state) => state.status_localization_list,
		getClassifierDefault: (state) => state.classifier_default,
		getClassifierList: (state) => state.classifier_list,
		classifierIsLoad: (state) => state.classifier_load,
		getPgLoad: (state) => state.pg_load,
		getContractorList: (state) => state.contractor_list,
		getContractorListSupl: (state) => state.contractor_list_suplr,
		getUomGroup: (state) => state.uom_group,
		getSaving: (state) => state.saving,
		getContainers: (state) => state.containers,
	},
	actions: {
		async loadNomenclature(productId: string, containerId: string | null) {
			this.load = true;
			const productInfo = await api.get('/nest/nomenclature/', {
				params: {
					productId: productId,
					containerId: containerId,
				},
			});
			if (productInfo.data.success) {
				this.product = productInfo.data.data;
				this.nomenclature_type = productInfo.data.nomenclature_type;
				this.next_code_analog_list = productInfo.data.next_code_analog_list;
				this.item_type_list = productInfo.data.item_type_list;
				this.kind_list = productInfo.data.item_kind_list;
				this.subkind_list = productInfo.data.subkind_list;
				this.code_type_list = productInfo.data.code_type_list;
				this.status_list = productInfo.data.status_list;
				this.uom_list = productInfo.data.uom_list;
				this.status_localization_list = productInfo.data.status_localization_list;
				this.classifier_default = productInfo.data.classifier_default;
				this.classifier_list = productInfo.data.classifier_list;
				this.contractor_list = productInfo.data.contractor_list;
				this.contractor_list_suplr = productInfo.data.contractor_list_suplr;
				this.uom_group = productInfo.data.uom_group;
				this.containers = productInfo.data.containers;
				this.containerAnalogue = productInfo.data.containers[0]?.analog_list || {};
				// Мета форма номенклатуры
				this.formNomenclature = {
					type: productInfo.data.nomenclature_type,
					container_analog_name: productInfo.data.data.product_list_analog[0]
						? productInfo.data.data.product_list_analog[0].name
						: productInfo.data.data.name,
					container_analog_code: productInfo.data.data.product_list_analog[0]
						? productInfo.data.data.product_list_analog[0].code
						: productInfo.data.data.productInfo.data.next_code_analog_list,
				};
				this.load = false;
			}
		},

		async fetchTrademark(value: string, searchVal: string) {
			this.loadAnalogList = true;
			const trademark = await api.get(`/nest/nomenclature/trademark/`, {
				params: {
					value: value,
					searchQuery: searchVal,
				},
			});
			if (trademark.data.success) {
				this.loadAnalogList = false;
				this.new_sn_code = trademark.data.snCode;
				return trademark.data.data;
			}
			this.loadAnalogList = false;
			return [];
		},

		async fetchContractors(type: string, searchVal: string): Promise<any> {
			const contractor = await api.get(`/nest/nomenclature/contractor/`, {
				params: {
					type: type,
					searchQuery: searchVal,
				},
			});
			if (contractor.data.success) {
				return {
					contractors: contractor.data.data,
					perimeters: contractor.data.perimeters,
				};
			}
			return {
				contractors: [],
				perimeters: [],
			};
		},

		async getSNCode(): Promise<AxiosResponse<string>> {
			this.loadAnalogList = true;
			const snCode = await api.get(`/nest/nomenclature/generate-sn-code/`);
			this.loadAnalogList = false;
			return snCode.data;
		},
		// Получение классификаторов по типу
		async fetchClassifierForType(typeId: string, searchCode = ''): Promise<any> {
			this.classifier_load = true;
			const result = await api.get(`/nest/nomenclature/classifier-type`, {
				params: {
					typeId: typeId,
					searchCode: searchCode,
				},
			});
			this.classifier_load = false;
			return result.data[0].classifier;
		},
		// Получение поставщиков-посредников для продуктовой группы
		async fetchContractorByName(searchName: string): Promise<any> {
			this.pg_load = true;
			const result = await api.get(`/nest/nomenclature/contractor-name`, {
				params: {
					searchName: searchName,
				},
			});
			this.pg_load = false;
			return result.data;
		},
		// Список продуктовых групп в зависимости от выбранного поставщика
		async fetchPgCodeByContractorId(contractorId: string, searchCode = ''): Promise<any> {
			this.pg_load = true;
			const result = await api.get(`/nest/nomenclature/pg-contracrot`, {
				params: {
					contractorId: contractorId,
					searchCode: searchCode,
				},
			});
			this.pg_load = false;
			return result.data[0]?.pg || [];
		},

		async fetchPgContractor(contractorId: string, searchCode = ''): Promise<any> {
			this.pg_load = true;
			const result = await api.get(`/nest/nomenclature/pg-suplr`, {
				params: {
					contractorId: contractorId,
					searchCode: searchCode,
				},
			});
			this.pg_load = false;
			return result.data;
		},

		async onSaveNomenclature(nomenclatureModel: any): Promise<any> {
			this.saving = true;
			try {
				const saveResult = await api.post(`/nest/nomenclature/save`, {
					params: nomenclatureModel,
				});
				return saveResult.data;
			} finally {
				this.saving = false;
			}
		},
	},
});
