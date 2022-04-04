import { Injectable } from '@nestjs/common';

import logger from '@src/core/logger';

@Injectable()
export class AppService {
	getHello(): string {
		logger.info('this is information log', AppService.name);
		return 'This is Nest API';
	}
}
