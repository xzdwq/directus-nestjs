import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductRequestController } from '@src/product-request/product-request.controller';
import { ProductRequestService } from '@src/product-request/product-request.service';
import { UsersService } from '@src/users/users.service';
import { StatusModule } from '@src/status/status.module';
import { StatusService } from '@src/status/status.service';
import {
	ProductRequestEntity,
	StatusLinkEntity,
	StatusTypeEntity,
	PriorityEntity,
	ConditionLinkEntity,
	EmployeeEntity,
	ProductListEntity,
	TaskTypeEntity,
} from '@src/orm';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			ProductRequestEntity,
			StatusLinkEntity,
			StatusTypeEntity,
			PriorityEntity,
			ConditionLinkEntity,
			EmployeeEntity,
			ProductListEntity,
			TaskTypeEntity,
		]),
		HttpModule,
		StatusModule,
	],
	controllers: [ProductRequestController],
	providers: [ProductRequestService, UsersService, StatusService],
})
export class ProductRequestModule {}
