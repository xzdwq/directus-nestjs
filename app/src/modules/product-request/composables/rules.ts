import { AnalogListType } from '@directus/nest-api/general-types';
/**
 * IC - артикул продукта. Для класса SN имеет собственную маску.
 * SN - тип класса элемента в контейнере аналогов, где поставщиком является партнет (Sever Minerals, Nordfeld и т.д.)
 */
export const isSN = (item: AnalogListType): boolean => {
	let nd;
	if (item.class) {
		item.class.value
			? (nd = item.class.value)
			: (nd = item.class_list.find((list_item: any) => list_item.value === item.class)?.code);
		return nd && nd === 'product' ? true : false;
	} else {
		return false;
	}
};

export const icMask = (item: AnalogListType): string => (isSN(item) ? 'AA######' : '');
export const icPlaceholder = (item: AnalogListType): string => (isSN(item) ? 'SN######' : '');

export const onInputIC = (item: AnalogListType, val: string): boolean => {
	if (isSN(item)) {
		if (item.ic.length === 1 && !item.ic[0].match(/(^S)/gi)) {
			item.ic = '';
			return false;
		} else if (item.ic.length === 2 && !item.ic[1].match(/(.?N)/gi)) {
			item.ic = 'S';
			return false;
		}
	} else {
		item.ic = (val.match(/\w+/gi) || '').toString();
	}
	return true;
};

// Проверяем на дубли. Дублем является совпадение по артикулу (ic) и id поставщика
export const onValidIC = (item: AnalogListType, analogList: Array<any>, val: string): boolean => {
	if (val && val.length > 0) {
		let matchDouble = false;
		for (const i in analogList) {
			for (const j of analogList[i]) {
				if (item.id !== j.id && item.ic === j.ic && j?.suplr?.id === item?.suplr?.id) {
					matchDouble = true;
					break;
				}
			}
			if (matchDouble) break;
		}
		return !(matchDouble || (isSN(item) ? val.length !== icMask(item).length : false));
	}
	return true;
};

export const getSUPLR = async (nomenclatureStore: any, item: AnalogListType, searchQuery: string): Promise<any> => {
	const classType = isSN(item) ? 'SN' : 'NOT_SN';
	return await nomenclatureStore.fetchTrademark(classType, searchQuery);
};

/**
 * Выставляем порядок расположения элементов контейнера аналогов по мере их добавления
 */
// classType - тип класса элемента в контейнере аналогов номенклатурной записи
export const orderAnalogItem = (classType: string): number => {
	let order = 0;
	// Продукт SN
	if (classType === 'product') order = 1;
	// Продукт производителя (OEM)
	if (classType === 'product_oem') order = 2;
	// Продукт поставщика (SUPLR)
	if (classType === 'product_contractor') order = 3;
	// Продукт по нормативному документу (ND)
	if (classType === 'product_nd') order = 4;
	return order;
};

export const sortAnalogItems = (analogItemsList: any): any => {
	const sortAnalogItemsList = Object.fromEntries(
		Object.entries(analogItemsList).sort(([, a]: any, [, b]: any) => a[0].order - b[0].order)
	);
	return sortAnalogItemsList;
};

// Нужно ли обновлять данные в остальных элементах контейнера аналогов на такие же
export const confirmUpdateAllAnalogueItems = (analogList: any, originalForm: any, currentForm: any, t: any): any => {
	const confirmUpdateAllItem = {
		is: false as boolean,
		msg: [] as string[],
	};
	// Если контейнер аналогов содержит больше одного элемента
	if (Object.keys(analogList).length > 1 || analogList[Object.keys(analogList)[0]].length > 1) {
		// Проходим по каждой группе
		for (const i in Object.keys(analogList)) {
			const itemGroup = analogList[Object.keys(analogList)[i]];
			// Проходим по каждому аналогу в группе
			for (const j in itemGroup) {
				if (itemGroup[j].id !== currentForm.id) {
					// Вид номенклатуры
					if (itemGroup[j].item_type.value !== currentForm.item_type.value)
						confirmUpdateAllItem.msg.push(t('product_request.item_type'));
					// Тип номенклатуры
					if (originalForm.kind.value !== currentForm.kind.value)
						confirmUpdateAllItem.msg.push(t('product_request.nomenclature_type'));
					// Базовая единица измерения
					if (originalForm.uom.uom.id !== currentForm.uom.uom.id)
						confirmUpdateAllItem.msg.push(t('product_request.base_uom'));
					// Единица измерения хранения остатков
					if (originalForm.uom.uom_storage_balances.id !== currentForm.uom.uom_storage_balances.id)
						confirmUpdateAllItem.msg.push(t('product_request.uom_storage_balances'));
					// Единица измерения для отчетов
					if (originalForm.uom.uom_reports.id !== currentForm.uom.uom_reports.id)
						confirmUpdateAllItem.msg.push(t('product_request.uom_reports'));
					// TODO: Категория складского контроля
					// TODO:Классификаторы
					// TODO:Продуктовая группа
					// TODO:Продуктовые группы поставщика
				}
			}
		}
		if (confirmUpdateAllItem.msg.length > 0) confirmUpdateAllItem.is = true;
	}
	return confirmUpdateAllItem;
};
