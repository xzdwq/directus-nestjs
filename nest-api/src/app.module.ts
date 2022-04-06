import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from '@cfg/configuration';
import { HttpErrorFilter } from '@src/core/httperror.filter';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { entities } from '@src/orm';
import { ProductRequestModule } from '@src/product-request/product-request.module';
import { UsersModule } from '@src/users/users.module';
import { StatusModule } from '@src/status/status.module';
import { NomenclatureModule } from '@src/nomenclature/nomenclature.module';
import { ProductModule } from '@src/product/product.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: false,
			isGlobal: true,
			envFilePath: [require.resolve('directus/.env')],
			load: [configuration],
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: config.get('db').pg_mdm.type,
				host: config.get('db').pg_mdm.host,
				port: config.get('db').pg_mdm.port,
				username: config.get('db').pg_mdm.username,
				password: config.get('db').pg_mdm.password,
				database: config.get('db').pg_mdm.database,
				synchronize: config.get('db').pg_mdm.synchronize,
				entities,
				extra: {
					max: 10,
					connectionTimeoutMillis: 1000,
				},
				logging: ['warn', 'error'],
			}),
		}),
		ProductRequestModule,
		UsersModule,
		StatusModule,
		NomenclatureModule,
		ProductModule,
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
