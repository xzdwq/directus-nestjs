import { v4 as uuidv4 } from 'uuid';

import { AnalogListType } from '@directus/nest-api/general-types';
import { orderAnalogItem } from '../../../composables/rules';

// Модель аналога
export const analogModel = async (group: any, nomenclatureStore: any): Promise<AnalogListType> => {
	const trademark = await nomenclatureStore.fetchTrademark(group.groupValue);
	const matchUOM = nomenclatureStore.getUOMList.find(
		(i: any) => i.name.toLowerCase() === nomenclatureStore.getProduct.unit.toLowerCase()
	);
	return {
		id: uuidv4(),
		delete_active: false,
		save: false,
		order: orderAnalogItem(group.groupValue),
		group_name: group.grounName,
		group_value: group.groupValue,
		name: nomenclatureStore.getProduct.name,
		full_name: nomenclatureStore.getProduct.name,
		is_full_name: true,
		// Приоритетный аналог
		primary: false,
		// Код реализации
		ic: group.groupValue === 'product' ? nomenclatureStore.getNewSNCode : nomenclatureStore.getProduct.article,
		additional_options: '',
		// Торговая марка/Нормативный документ
		suplr: group.groupValue === 'product' ? trademark[0] : '',
		suplr_list: trademark,
		class: nomenclatureStore.getNomenclatureTypeBase[0],
		class_list: nomenclatureStore.getNomenclatureTypeBase,
		// Вид номенклатуры
		item_type: nomenclatureStore.getItemTypeList[0],
		item_type_list: nomenclatureStore.getItemTypeList,
		// Тип номенклатуры
		kind: nomenclatureStore.getItemKindList[0],
		kind_list: nomenclatureStore.getItemKindList,
		// Вид изделия
		product_type: null,
		// Комплект
		is_kit: false,
		// Выбранный комплект
		// subkind: nomenclatureStore.getSubKindList[0],
		subkind: '',
		subkind_list: nomenclatureStore.getSubKindList,
		// Модель/Атрикул/Типорзамер
		code_type: nomenclatureStore.getCodeTypeList[0],
		code_type_list: nomenclatureStore.getCodeTypeList,
		// Статус
		status: nomenclatureStore.getStatusList.find((i: any) => i.name.includes('Разрешен')),
		status_list: nomenclatureStore.getStatusList,
		// Единицы измерения
		uom: {
			// Базовая единица измерения
			uom: matchUOM || nomenclatureStore.getUOMList[0],
			uom_list: nomenclatureStore.getUOMList,
			// Единица измерения хранения остатков
			uom_storage_balances: matchUOM || nomenclatureStore.getUOMList[0],
			uom_storage_balances_list: nomenclatureStore.getUOMList,
			// Единица измерения для отчетов
			uom_reports: matchUOM || nomenclatureStore.getUOMList[0],
			uom_reports_list: nomenclatureStore.getUOMList,
		},
		status_localization: nomenclatureStore.getStatusLocalizationList[0],
		status_localization_list: nomenclatureStore.getStatusLocalizationList,
		// Классификатор (по умолчанию добавляем первый элемент Группа 1С СМ)
		classifier_kit: [
			{
				...nomenclatureStore.getClassifierDefault[0],
				selected_type: nomenclatureStore.getClassifierList.find(
					(i: any) => i.id === '3143dd1e-bc63-4a5d-a222-df3143a31fc5'
				), // Группа 1С СМ
				selected: nomenclatureStore.getClassifierDefault[0].classifier.find((i: any) => i.code === 'WZE02APR013'),
			},
		],
		// Продуктовая группа
		pg_list: [],
		// Продуктовые группы поставщика
		suplr_pg_list: [],
		// Весо-габаритные характеристики и особые условия
		weight_characteristic: {
			// Наследовано от контейнера аналогов
			inherited_analogs_container: true,
			// Масса
			mass: null,
			mass_uom: nomenclatureStore.getUomGroup
				.find((g: any) => g.name === 'Масса')
				.uom.find((g: any) => g.name === 'Килограмм'),
			mass_list: nomenclatureStore.getUomGroup.find((g: any) => g.name === 'Масса').uom,
			// Длина
			length: null,
			length_uom: nomenclatureStore.getUomGroup.find((g: any) => g.name === 'Линейный размер').uom[0],
			length_list: nomenclatureStore.getUomGroup.find((g: any) => g.name === 'Линейный размер').uom,
			// Ширина
			width: null,
			width_uom: nomenclatureStore.getUomGroup.find((g: any) => g.name === 'Линейный размер').uom[0],
			width_list: nomenclatureStore.getUomGroup.find((g: any) => g.name === 'Линейный размер').uom,
			// Высота
			height: null,
			height_uom: nomenclatureStore.getUomGroup.find((g: any) => g.name === 'Линейный размер').uom[0],
			height_list: nomenclatureStore.getUomGroup.find((g: any) => g.name === 'Линейный размер').uom,
			// Негабарит
			is_oversized: false,
			// Полная загрузка контейнера
			is_fcl: false,
		},
		// Внешняя сертификация
		external_certification: false,
	};
};

// Контейнер аналогов пригодный для сохранения
export const prepareAnalogListForSave = (analogList: any): any => {
	const prepareModel: any = {};
	for (const key in analogList) {
		if (!prepareModel[key]) prepareModel[key] = [];
		for (const i in analogList[key]) {
			prepareModel[key].push({
				id: analogList[key][i].id,
				// Доп. наименование
				additional_options: analogList[key][i].additional_options,
				// Класс аналога
				class: {
					value: analogList[key][i].group_value,
					name: analogList[key][i].group_name,
				},
				// Классификатор
				classifier_kit: analogList[key][i].classifier_kit.map((i: any) => {
					return {
						type_id: i.selected_type.id,
						type_name: i.selected_type.name,
						code_id: i.selected.id,
						code_value: i.selected.code,
						code_name: i.selected.name,
					};
				}),
				// Модель/Атрикул/Типорзамер
				code_type_id: analogList[key][i].code_type?.id,
				// Внешняя сертификация
				external_certification: analogList[key][i].external_certification,
				// Наименование
				name: analogList[key][i].full_name,
				// Наименование группы
				group_name: analogList[key][i].group_name,
				// Код группы
				group_value: analogList[key][i].group_value,
				// Код реализации
				ic: analogList[key][i].ic,
				// Полное ли имя (введено вручную или сформировано)
				is_full_name: analogList[key][i].is_full_name,
				// Вид номенклатуры
				item_type: {
					value: analogList[key][i].item_type.value,
					name: analogList[key][i].item_type.name,
				},
				// Тип номенклатуры
				kind: {
					value: analogList[key][i].kind.value,
					name: analogList[key][i].kind.name,
				},
				// Комплект
				is_kit: analogList[key][i].is_kit,
				// Продуктовая группа
				pg_list: analogList[key][i].pg_list.map((i: any) => {
					return {
						contractor_id: i.selected_contractor.id,
						contractor_name: i.selected_contractor.name,
						code_id: i.selected_code.id,
						code_value: i.selected_code.code,
						code_name: i.selected_code.name,
					};
				}),
				// Приоритетный аналог
				primary: analogList[key][i].primary,
				// Вид изделия
				product_type: analogList[key][i].product_type,
				// Статус
				status: {
					value: analogList[key][i].status.value,
					name: analogList[key][i].status.name,
				},
				// Статус локализации
				status_localization: {
					value: analogList[key][i].status_localization.value,
					name: analogList[key][i].status_localization.name,
				},
				// Выбранный комплект
				subkind: {
					value: analogList[key][i].subkind.value,
					name: analogList[key][i].subkind.name,
				},
				// Торговая марка/Нормативный документ
				suplr_id: analogList[key][i].suplr.id,
				// Продуктовые группы поставщика
				suplr_pg_list: analogList[key][i].suplr_pg_list.map((i: any) => {
					return {
						contractor_id: i.selected_contractor.id,
						contractor_name: i.selected_contractor.name,
						code_id: i.selected_code.id,
						code_value: i.selected_code.code,
						code_name: i.selected_code.name,
					};
				}),
				// Единицы измерения
				uom: {
					// Базовая единица измерения
					base_uom_id: analogList[key][i].uom.uom.id,
					// Единица измерения для отчетов
					uom_reports: analogList[key][i].uom.uom_reports.id,
					// Единица измерения хранения остатков
					uom_storage_balances: analogList[key][i].uom.uom_storage_balances.id,
				},
				// Весо-габаритные характеристики и особые условия
				weight_characteristic: {
					// Наследовано от контейнера аналогов
					inherited_analogs_container: analogList[key][i].weight_characteristic.inherited_analogs_container,
					// Масса
					mass: analogList[key][i].weight_characteristic.mass,
					// Единица измерения массы
					mass_uom_id: analogList[key][i].weight_characteristic.mass_uom.id,
					// Длина
					length: analogList[key][i].weight_characteristic.length,
					// Единица измерения длины
					length_uom_id: analogList[key][i].weight_characteristic.length_uom.id,
					// Ширина
					width: analogList[key][i].weight_characteristic.width,
					// Единица измерения ширины
					width_uom_id: analogList[key][i].weight_characteristic.width_uom.id,
					// Высота
					height: analogList[key][i].weight_characteristic.height,
					// Единица измерения высоты
					height_uom_id: analogList[key][i].weight_characteristic.height_uom.id,
					// Негабарит
					is_oversized: analogList[key][i].weight_characteristic.oversized,
					// Полная загрузка контейнера
					is_fcl: analogList[key][i].weight_characteristic.fcl,
				},
			});
		}
	}
	return prepareModel;
};

// Контейнер поставок пригодный для сохранения
export const prepareAccountingListForSave = (accountingForm: Array<any> = []): Array<any> => {
	const prepareModel: Array<any> = [];
	if (accountingForm.length > 0) {
		for (const i in accountingForm) {
			prepareModel.push({
				// Код реализации
				ic: accountingForm[i].ic,
				// Компания периметра
				company_id: accountingForm[i].company.id,
				// Артикул - Поставщик
				article_supplier_list: accountingForm[i].articleSupplierList.map((i: any) => {
					return {
						article: i.article,
						suplr_id: i.suplr.id,
					};
				}),
			});
		}
	}
	return prepareModel;
};
