// src/core/config/env.ts

import 'dotenv/config';

import { get } from 'env-var';

export const envs = {
	PORT: get('PORT').required().asPortNumber(),
	API_PREFIX: get('DEFAULT_API_PREFIX').default('/api/v1').asString(),
	NODE_ENV: get('NODE_ENV').default('development').asString(),
	MONGO_INITDB_ROOT_USERNAME: get('MONGO_INITDB_ROOT_USERNAME').default('admin').asString(),
	MONGO_INITDB_ROOT_PASSWORD: get('MONGO_INITDB_ROOT_PASSWORD').default('test123').asString(),
	MONGO_DB_NAME: get('MONGO_DB_NAME').default('worketyamo').asString(),
	JWT_ACCESS_TOKEN: get('JWT_ACCESS_TOKEN').required().asString(),
	JWT_REFRESH_TOKEN: get('JWT_REFRESH_TOKEN').required().asString(),
	PASS_APP_MAIL:get('PASS_APP_MAIL').asString(),
	MAIL_SERVICE: get('MAIL_SERVICE').asString(),
    MAIL_HOST: get('MAIL_HOST').asString(),
    MAIL_PORT: get('MAIL_PORT').asPortNumber(),
    MAIL_USE: get('MAIL_USE').required().asString(),
    
};

export const CONNECTION_STRING = `mongodb://${envs.MONGO_INITDB_ROOT_USERNAME}:${envs.MONGO_INITDB_ROOT_PASSWORD}@172.28.0.2:27017/${envs.MONGO_DB_NAME}?authSource=admin`;

