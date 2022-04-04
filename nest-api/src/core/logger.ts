import { Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createLogger, format, transports } = require('winston');
const { combine, simple, metadata, timestamp, ms, printf } = format;
require('winston-daily-rotate-file');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SPLAT } = require('triple-beam');

import configuration from '@cfg/configuration';

const config: any = configuration();

const logger = createLogger({
	level: config.logger.level,
	transports: [
		new transports.DailyRotateFile({
			filename: config.logger.filename,
			datePattern: config.logger.datePattern,
			zippedArchive: config.logger.zippedArchive,
			maxSize: config.logger.maxSize,
			maxFiles: config.logger.maxFiles,
			handleException: config.logger.handleException,
			format: combine(
				simple(),
				metadata(),
				timestamp({
					format: config.logger.format,
				}),
				ms(),
				printf(({ timestamp, ms, level, message, ...metadata }) => {
					const context = `${metadata[SPLAT] || config.logger.other_ctx}`;
					try {
						Logger[level](message, context);
					} catch (e) {
						Logger.log(message, context);
					}
					return `${timestamp} ${ms} ${level.toUpperCase()} [${context}] ${message}`;
				}),
			),
		}),
	],
});

export default logger;
