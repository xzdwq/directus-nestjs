import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductAnalogListService } from '@src/product/product-analog-list/product-analog-list.service';
import { ProductService } from '@src/product/product/product.service';
import { ProductAnalogListEntity, ProductEntity } from '@src/orm';

@Module({
	imports: [TypeOrmModule.forFeature([ProductAnalogListEntity, ProductEntity])],
	controllers: [],
	providers: [ProductAnalogListService, ProductService],
	exports: [ProductAnalogListService, ProductService],
})
export class ProductModule {}
