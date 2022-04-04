import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import logger from '@src/core/logger';
import configuration from '@cfg/configuration';

const config: any = configuration();

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const request = ctx.getRequest();
		const response = ctx.getResponse();
		const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		const errorResponse = {
			success: false,
			code: status,
			timestamp: new Date().toLocaleTimeString('ru', {
				day: 'numeric',
				month: 'numeric',
				year: 'numeric',
			}),
			path: request.url,
			method: request.method,
			message: exception.message,
		};
		const user = request.user?.email || config.logger.noauth_user_mask;
		logger.error(`[${user}] ${request.method} ${request.url} ${status} - ${exception}`, HttpErrorFilter.name);

		response.status(status).json(errorResponse);
	}
}
