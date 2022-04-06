import { Injectable } from '@nestjs/common';
import { getManager, IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
	ProductListEntity,
	TrademarkEntity,
	ContractorEntity,
	UomGroupEntity,
	ClassifierTypeEntity,
	PgContractorEntity,
} from '@src/orm';
import { ProductAnalogListService } from '@src/product/product-analog-list/product-analog-list.service';
import { ProductService } from '@src/product/product/product.service';

@Injectable()
export class NomenclatureService {
	constructor(
		private productAnalogListService: ProductAnalogListService,
		private productService: ProductService,
		@InjectRepository(ProductListEntity)
		private productListRepository: Repository<ProductListEntity>,
		@InjectRepository(TrademarkEntity)
		private trademarkRepository: Repository<TrademarkEntity>,
		@InjectRepository(ContractorEntity)
		private contractorRepository: Repository<ContractorEntity>,
		@InjectRepository(UomGroupEntity)
		private uomGroupRepository: Repository<UomGroupEntity>,
		@InjectRepository(ClassifierTypeEntity)
		private classifierTypeRepository: Repository<ClassifierTypeEntity>,
		@InjectRepository(PgContractorEntity)
		private pgContractorRepository: Repository<PgContractorEntity>,
	) {}

	// Создание/Редактирование номенклатуры
	async getNomenclature(params: any): Promise<any> {
		const { productId, containerId } = params;
		// Получаем информацию по конкретному продукту в заявке
		let qb = this.productListRepository
			.createQueryBuilder('product')
			.leftJoinAndSelect('product.request', 'request')
			.leftJoinAndSelect('product.product_list_selected', 'product_list_selected')
			.leftJoinAndSelect('product.product_list_analog', 'product_list_analog')
			.leftJoinAndSelect('product_list_analog.product', 'product_global')
			.leftJoinAndSelect('product_global.product_code_type', 'code_type')
			.leftJoinAndSelect('product_global.uom_reports', 'report_uom')
			.leftJoinAndSelect('product_global.base_uom', 'base_uom')
			.leftJoinAndSelect('product_global.uom_storage_balances', 'storage_uom')
			.leftJoinAndSelect('product_global.warehouse_control_category', 'warehouse_control_category')
			.where('product.id = :product_id', { product_id: productId });
		if (containerId != 0) {
			qb = qb.andWhere('product_list_analog.id = :product_list_analog_id', { product_list_analog_id: containerId });
		}
		const product = await qb.getOne();

		// Если есть ранее сохраненные контейнеры аналогов
		const containers = product.product_list_analog.length
			? await this.productAnalogListService.onPrepareAnalogList(product.product_list_analog)
			: [];

		const nomenclatureType = await this.getProductGlobalFieldChoise('class');
		// Получаем код для следующего листа аналогов
		const nextCodeAnalogList = await this.productAnalogListService.getNextCodeAnalogList();
		const itemTypeList = await this.getProductGlobalFieldChoise('product_type');
		const itemKindList = await this.getProductGlobalFieldChoise('kind');
		const subKindList = await this.getProductGlobalFieldChoise('subkind');
		const codeTypeList = await this.getCodeType();
		const status_list = await this.getProductGlobalFieldChoise('status');
		const uom_list = await getManager().query(`SELECT * FROM public.uom`);
		const status_localization_list = await this.getProductGlobalFieldChoise('status_localization');
		// Группа 1С СМ
		const classifier_default = await this.classifierType('3143dd1e-bc63-4a5d-a222-df3143a31fc5');
		const classifier_list = await this.classifierTypeRepository.find();
		// Продуктовая группа
		const contractor_list = await this.getContractorByName('pg');
		// Продуктовые группы поставщика
		const contractor_list_suplr = await this.getContractorByName('pg_contractor');
		const uom_group = await this.getUomGroup();
		return {
			success: true,
			data: product,
			nomenclature_type: nomenclatureType,
			next_code_analog_list: nextCodeAnalogList,
			item_type_list: itemTypeList,
			item_kind_list: itemKindList,
			subkind_list: subKindList,
			code_type_list: codeTypeList,
			status_list: status_list,
			uom_list: uom_list,
			status_localization_list: status_localization_list,
			classifier_default: classifier_default,
			classifier_list: classifier_list,
			contractor_list: contractor_list,
			contractor_list_suplr: contractor_list_suplr,
			uom_group: uom_group,
			containers: containers,
		};
	}
	// Посредники
	async getTrademark(value: string, searchQuery: string): Promise<any> {
		let queryB = this.trademarkRepository
			.createQueryBuilder('trademark')
			.leftJoinAndSelect('trademark.contractor', 'contractor')
			// .leftJoinAndSelect('trademark.sortament', 'sortament')
			// .leftJoinAndSelect('sortament.normative_doc', 'normative_doc')
			.where('1 = 1');
		let snCode: string | null;
		// Тип класса Продукт SN
		if (value === 'product') {
			queryB = queryB.andWhere('trademark.id = :sn_id', {
				sn_id: '530c86c4-e7f0-4b2f-ab49-a3d35e97841f',
			});
			// queryB = await queryB.andWhere('contractor.key IS NOT NULL')
			snCode = this.getRandomNumberBetween();
		} else if (value !== 'all') {
			queryB = queryB.andWhere('trademark.id != :sn_id', {
				sn_id: '530c86c4-e7f0-4b2f-ab49-a3d35e97841f',
			});
		}
		if (searchQuery) {
			queryB = queryB.andWhere('trademark.name ilike :name', {
				name: `%${searchQuery}%`,
			});
		}
		const generalTotal = await queryB.getCount();
		const dataAll = await queryB.getMany();
		return {
			success: true,
			value: value,
			snCode: snCode ? `SN${snCode}` : null,
			data: dataAll,
			total: generalTotal,
		};
	}
	// Поставщики партнеры
	async getContractor(): Promise<any> {
		// Поставщики
		const contractors = await getManager().query(`
			SELECT c.* 
			FROM contr.contractor c 
			WHERE c.kinds IS NOT NULL AND c.kinds::jsonb ? 'supplier' 
			ORDER BY c."name";
		`);
		// Компании периметра
		const perimeters = await this.getPerimeterCompanies();
		return {
			success: true,
			data: contractors,
			perimeters: perimeters,
		};
		// const contractors = await this.contractorRepository
		// 	.createQueryBuilder('contractor')
		// 	.where('contractor.key IS NOT NULL');
		// const total = await contractors.getCount();
		// const data = await contractors.getMany();
		// return {
		// 	success: true,
		// 	data: data,
		// 	total: total,
		// };
	}
	// Компании периметра
	async getPerimeterCompanies(): Promise<any> {
		return await this.contractorRepository.find({
			where: {
				key: Not(IsNull()),
			},
			order: {
				name: 'ASC',
			},
		});
	}
	// Поставщики для продуктовой группы (только те у кого есть связь)
	async getContractorByName(joinTable: string, name = ''): Promise<any> {
		let qb = this.contractorRepository
			.createQueryBuilder('contractor')
			.select(['contractor.id', 'contractor.name'])
			.distinct(true)
			.innerJoin(
				(query) => {
					return query.select(['id', 'contractor_id']).from(joinTable, null);
				},
				'pg_or_pg_contractor',
				'pg_or_pg_contractor.contractor_id = contractor.id',
			)
			.where('contractor.name IS NOT NULL');
		if (name) qb = qb.andWhere('contractor.name ilike :name', { name: `%${name}%` });
		return await qb.getMany();
	}
	// Продуктовая группа. Список продуктовых групп для поставщика
	async findPgCodeByContractorId(contractorId: string, searchCode: string): Promise<any> {
		let qb = this.contractorRepository
			.createQueryBuilder('contractor')
			.leftJoinAndSelect('contractor.pg', 'pg')
			.where('contractor.id = :id', { id: contractorId });
		if (searchCode) {
			qb = qb.andWhere('pg.code ilike :code', { code: `%${searchCode}%` });
		}
		qb = qb.orderBy('pg.code');
		qb = qb.limit(50);
		return await qb.getMany();
	}
	// Продуктовые группы поставщика
	async findPgContractor(contractorId: string, searchCode: string): Promise<any> {
		let qb = this.pgContractorRepository
			.createQueryBuilder('pg_contractor')
			.leftJoinAndSelect('pg_contractor.contractor', 'contractor')
			.where('contractor.id = :c_id', { c_id: contractorId });
		if (searchCode) {
			qb = qb.andWhere('pg_contractor.code ilike :code', { code: `%${searchCode}%` });
		}
		qb = qb.orderBy('pg_contractor.code');
		qb = qb.limit(50);
		return await qb.getMany();
	}
	// Список product_global из интерфейса Directus
	async getProductGlobalFieldChoise(field: string): Promise<any> {
		return await getManager().query(`
			SELECT choices->>'value' "value", choices->>'text' "name", df.*
			FROM public.directus_fields df, json_array_elements(df."options"->'choices') choices
			WHERE df.collection = 'product_global' AND df.field = '${field}';
		`);
	}
	// Тип (Артикул, Типоразмер, Модель)
	async getCodeType(): Promise<any> {
		return await getManager().query(`
			SELECT * FROM pim.code_type
		`);
	}
	// Тип классификатора
	async classifierType(typeId: string, searchCode = ''): Promise<any> {
		let qb = this.classifierTypeRepository
			.createQueryBuilder('classifier_type')
			.leftJoinAndSelect('classifier_type.classifier', 'classifier')
			.where('classifier_type.id = :type_id', { type_id: typeId });
		if (searchCode) {
			qb = qb.andWhere('classifier.code ilike :code', { code: `%${searchCode}%` });
		}
		qb = qb.limit(50);
		return await qb.getMany();
	}
	// Продуктовая группа
	async findProductGroup(searchCode: string): Promise<any> {
		return await getManager().query(`
			SELECT p.id, c."name" contr_name, p."name" pg_name, p.code pg_code
			FROM pim.pg p
			LEFT JOIN contr.contractor c ON p.contractor_id = c.id
			WHERE ${searchCode ? "p.code ILIKE '%" + searchCode + "%'" : '(1 = 1)'}
			ORDER BY code;
		`);
	}
	// Список единиц измерений (сгруппированных)
	async getUomGroup(): Promise<any> {
		const uom_group = await this.uomGroupRepository.find({
			relations: ['uom'],
		});
		return uom_group;
	}
	// Рандомное число (для кода SN)
	getRandomNumberBetween(min = 1, max = 999999): string {
		return Math.floor(Math.random() * (max - min + 1) + min)
			.toString()
			.padStart(max.toString().length, '0');
	}
	// Сохранение номенклатурной записи (контейнер аналогов, поставки)
	async onSave(params: any): Promise<any> {
		// Сохранение нового контейнера аналогов
		const newContainerAnalog = await this.productAnalogListService.onCreateNewContainerAnalog(params);
		// Сохранение продуктов
		const newProduct = await this.productService.onSaveProducts(params, newContainerAnalog);
		return {
			success: true,
			data: params,
			container_analog: newContainerAnalog,
			product: newProduct,
		};
	}
}
