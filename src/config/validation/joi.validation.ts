import * as Joi from 'joi';
import { CONFIG_DEFAULT } from '../config.default';

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];
const ENVIRONMENTS = ['local', 'development', 'prod'];

export const JoiValidationSchema = Joi.object({
  // Configuración de la aplicación
  NODE_ENV: Joi.string()
    .valid(...ENVIRONMENTS)
    .default(CONFIG_DEFAULT.app.environment),
  PORT: Joi.number().port().default(CONFIG_DEFAULT.app.port),
  ENABLE_SWAGGER: Joi.boolean().default(CONFIG_DEFAULT.app.enableSwagger),

  // Configuración de base de datos (PostgreSQL)
  DB_HOST: Joi.string().default(CONFIG_DEFAULT.app.host),
  DB_PORT: Joi.number().port().default(CONFIG_DEFAULT.database.port),
  DB_USERNAME: Joi.string().default(CONFIG_DEFAULT.database.username),
  DB_PASSWORD: Joi.string().default(CONFIG_DEFAULT.database.password),
  DB_DATABASE: Joi.string().default(CONFIG_DEFAULT.database.database),
  DB_SSL: Joi.boolean().default(CONFIG_DEFAULT.database.ssl),

  // Configuración de seguridad JWT
  JWT_SECRET: Joi.string().default(CONFIG_DEFAULT.security.jwtSecret),
  JWT_EXPIRES_IN: Joi.string().default(
    CONFIG_DEFAULT.security.jwtExpiresIn.toString(),
  ),

  // Configuración de CORS
  CORS_ORIGIN: Joi.string().default(CONFIG_DEFAULT.cors.origin),

  // Configuración de logging
  LOG_LEVEL: Joi.string()
    .valid(...LOG_LEVELS)
    .default(CONFIG_DEFAULT.logging.level),

  // Configuración de rate limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(CONFIG_DEFAULT.rateLimit.windowMs),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(
    CONFIG_DEFAULT.rateLimit.maxRequests,
  ),
});
