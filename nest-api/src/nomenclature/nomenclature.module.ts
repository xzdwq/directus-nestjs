import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NomenclatureController } from '@src/nomenclature/nomenclature.controller';
import { NomenclatureService } from '@src/nomenclature/nomenclature.service';
import { ProductAnalogListService } from '@src/product/product-analog-list/product-analog-list.service';
import { ProductService } from '@src/product/product/product.service';

import {
	ProductListEntity,
	ProductAnalogListEntity,
	TrademarkEntity,
	ContractorEntity,
	PgEntity,
	UomGroupEntity,
	UomEntity,
	ClassifierTypeEntity,
	ClassifierEntity,
	PgContractorEntity,
	ProductEntity,
} from '@src/orm';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			ProductListEntity,
			ProductAnalogListEntity,
			TrademarkEntity,
			ContractorEntity,
			PgEntity,
			UomGroupEntity,
			UomEntity,
			ClassifierTypeEntity,
			ClassifierEntity,
			PgContractorEntity,
			ProductEntity,
		]),
	],
	controllers: [NomenclatureController],
	providers: [NomenclatureService, ProductAnalogListService, ProductService],
})
export class NomenclatureModule {}
