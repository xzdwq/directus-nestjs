import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductEntity } from '@src/orm';

@Injectable()
export class ProductService {
	constructor(
		@InjectRepository(ProductEntity)
		private productRepository: Repository<ProductEntity>,
	) {}

	async onSaveProducts(params: any, newContainerAnalog: any): Promise<any> {
		const analogList = params.analog_list,
			newProductList = [];
		for (const key in analogList) {
			for (const i in analogList[key]) {
				const newProduct = await this.productRepository.save({
					id: analogList[key][i].id,
					name: analogList[key][i].name,
					additional_options: analogList[key][i].additional_options,
					class: analogList[key][i].class.value,
					code: analogList[key][i].ic,
					kind: analogList[key][i].kind.value,
					status_localization: analogList[key][i].status_localization.value,
					subkind: analogList[key][i].subkind.value,
					kit: analogList[key][i].is_kit,
					product_analog_list_id: newContainerAnalog.id,
					date_created: new Date(new Date().setHours(new Date().getHours() + 3)),
					date_updated: new Date(new Date().setHours(new Date().getHours() + 3)),
				});
				newProductList.push(newProduct);
			}
		}
		return newProductList;
	}
}
