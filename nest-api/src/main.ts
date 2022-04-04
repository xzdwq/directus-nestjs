import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api');

	app.enableCors({
		origin: [
      /^(.*)/,
    ],
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
	});

  await app.listen(7000);
}
bootstrap();
