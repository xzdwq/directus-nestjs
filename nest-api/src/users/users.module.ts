import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from '@src/users/users.controller';
import { UsersService } from '@src/users/users.service';
import { EmployeeEntity } from '@src/orm';

@Module({
	imports: [TypeOrmModule.forFeature([EmployeeEntity]), HttpModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
