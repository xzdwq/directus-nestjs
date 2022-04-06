import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatusService } from '@src/status/status.service';
import { StatusLinkEntity } from '@src/orm';
@Module({
	imports: [TypeOrmModule.forFeature([StatusLinkEntity])],
	providers: [StatusService],
})
export class StatusModule {}
