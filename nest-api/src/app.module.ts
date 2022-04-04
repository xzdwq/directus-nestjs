import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import configuration from '@cfg/configuration';
import { HttpErrorFilter } from '@src/core/httperror.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: false,
			isGlobal: true,
			envFilePath: [require.resolve('directus/.env')],
			load: [configuration],
		}),
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: HttpErrorFilter,
		},
	],
})
export class AppModule {}
