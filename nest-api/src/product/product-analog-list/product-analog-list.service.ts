import { Injectable } from '@nestjs/common';
import { getManager, Repository, IsNull, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductAnalogListEntity } from '@src/orm';

@Injectable()
export class ProductAnalogListService {
	constructor(
		@InjectRepository(ProductAnalogListEntity)
		private productAnalogListRepository: Repository<ProductAnalogListEntity>,
	) {}

	async getNextCodeAnalogList(): Promise<string> {
		const codePrefix = 'CFA',
			zeroLength = 8;
		const lastCodeAnalogList = await this.productAnalogListRepository.findOne({
			where: {
				code: Not(IsNull()),
			},
			order: {
				date_created: 'DESC',
			},
		});
		let nextCode;
		if (lastCodeAnalogList) {
			const nextNumCode = (+lastCodeAnalogList.code.split(codePrefix)[1] + 1).toString();
			nextCode = codePrefix + nextNumCode.padStart(zeroLength, '0');
		} else {
			nextCode = codePrefix + '1'.padStart(zeroLength, '0');
		}
		return nextCode;
	}
	// Создание нового контейнера аналогов
	async onCreateNewContainerAnalog(params: any): Promise<any> {
		const productAnalogList = await this.productAnalogListRepository.save({
			id: params.container_id,
			name: params.container_analog_name,
			code: params.container_analog_code,
			product_list_id: params.product_id,
			date_created: new Date(new Date().setHours(new Date().getHours() + 3)),
			date_updated: new Date(new Date().setHours(new Date().getHours() + 3)),
		});
		return productAnalogList;
	}
	// Подготовка модели продуктов в контейнере аналогов для клиента
	async onPrepareAnalogList(productListAnalog: any): Promise<any> {
		const group_list = await getManager().query(`
			SELECT choices->>'value' "value", choices->>'text' "name", df.*
			FROM public.directus_fields df, json_array_elements(df."options"->'choices') choices
			WHERE df.collection = 'product_global' AND df.field = 'class';
		`);
		const containers = [];
		for (const i in productListAnalog) {
			const result = productListAnalog[i].product.reduce((acc: any, val: any) => {
				acc[val.class] = acc[val.class] || [];
				acc[val.class].push({
					delete_active: false,
					order: this.orderAnalogItem(val.class),
					group_name: group_list.find((i) => i.value === val.class).name,
					group_value: val.class,
					save: true,
					full_name: val.name,
					is_full_name: true,
					primary: false,
					...val,
				});
				return acc;
			}, {});
			containers.push({
				id: productListAnalog[i].id,
				name: productListAnalog[i].name,
				code: productListAnalog[i].code,
				product_list_id: productListAnalog[i].product_list_id,
				date_created: productListAnalog[i].date_created,
				date_updated: productListAnalog[i].date_updated,
				analog_list: result,
			});
		}
		return containers;
	}

	orderAnalogItem(classType): number {
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
	}
}
