const MODE = process.env.NODE_ENV || 'production';

export default (): any => ({
	mode: MODE,
	nest_port: +process.env.NEST_PORT,
	api_global_prefix: 'api',
	directus_api: process.env.API_URL ? process.env.API_URL : 'http://localhost:8080/api',
	// Настройки БД
	db: {
		pg_mdm: {
			type: process.env.NEST_DB_CLIENT,
			host: process.env.DB_HOST,
			port: +process.env.DB_PORT,
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
			synchronize: process.env.NEST_DB_SYNCHRONIZE,
		},
	},
	// Настройки логгирования
	logger: {
		level: MODE === 'production' ? process.env.LOG_LEVEL : 'silly',
		other_ctx: 'CORE',
		http_resolve_log: false,
		noauth_user_mask: 'noauthuser',
		morgan_format: '[:user] :method :url :status, res-time: :response-time ms',
		filename: './logs/logs-%DATE%.log',
		datePattern: 'YYYY-MM-DD',
		zippedArchive: true,
		maxSize: '2m',
		maxFiles: '7d',
		handleException: true,
		format: 'DD.MM.YYYY HH:mm:ss',
	},
});
