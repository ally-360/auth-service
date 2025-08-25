import * as entities from 'src/modules/auth/entities';
import { CONFIG_DEFAULT } from '../config.default';

export const config = {
  app: {
    /**
     * Puerto HTTP del Servicio
     * @type {number}
     * @default 3000
     * @example 3000
     * @description Puerto en el que se ejecutará la aplicación HTTP
     * @required true
     */
    port: process.env.PORT ? Number(process.env.PORT) : CONFIG_DEFAULT.app.port,
    /**
     * Entorno de ejecución de Node.js
     * @type {string}
     * @default development
     * @example development, production, local
     * @description Determina qué configuración de entorno cargar
     */
    environment: process.env.NODE_ENV || CONFIG_DEFAULT.app.environment,
    /**
     * Habilitar documentación Swagger
     * @type {boolean}
     * @default false
     * @description Controla si se muestra la documentación de la API
     */
    enableSwagger: process.env.ENABLE_SWAGGER === 'true' || false,
  },

  microservice: {},

  cors: {
    /**
     * Orígenes permitidos para CORS
     * @type {string}
     * @example http://localhost:3000, https://app.example.com
     * @description Lista separada por comas de orígenes permitidos para CORS
     * @required false
     */
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },

  database: {
    entities: [...Object.values(entities)],
    type: 'postgres',
    /**
     * Host de la base de datos
     * @type {string}
     * @example localhost, 127.0.0.1
     * @description Host de la base de datos
     * @required false
     */
    host: process.env.DB_HOST || 'localhost',
    /**
     * Puerto de la base de datos
     * @type {number}
     * @example 5432
     * @description Puerto de la base de datos PostgreSQL
     * @required false
     */
    port: process.env.DB_PORT
      ? Number(process.env.DB_PORT)
      : CONFIG_DEFAULT.database.port,
    /**
     * Nombre de la base de datos
     * @type {string}
     * @example auth_service, ally360_auth
     * @description Nombre de la base de datos
     * @required false
     */
    database: process.env.DB_DATABASE || 'auth_service',
    /**
     * Usuario de la base de datos
     * @type {string}
     * @example postgres, auth_user
     * @description Usuario para autenticarse en la base de datos
     * @required false
     */
    username: process.env.DB_USERNAME || 'postgres',
    /**
     * Contraseña de la base de datos
     * @type {string}
     * @example mypassword, secret123
     * @description Contraseña para autenticarse en la base de datos
     * @required false
     */
    password: process.env.DB_PASSWORD || 'postgres',
    /**
     * Esquema de la base de datos
     * @type {string}
     * @example auth_service
     * @description Esquema de la base de datos
     * @required false
     */
    schema: CONFIG_DEFAULT.database.schema,
    /**
     * Habilitar SSL para conexiones seguras
     * @type {boolean}
     * @default false
     * @description Controla si se usa SSL para conectar a la base de datos
     */
    ssl: process.env.DB_SSL === 'true' || false,
    /**
     * Configuración adicional de conexión
     * @type {object}
     * @description Configuración extra para la conexión a la base de datos
     */
    extra: {
      connectionLimit: 10,
    },
  },

  logging: {
    /**
     * Nivel de logging de la aplicación
     * @type {string}
     * @default info
     * @example debug, info, warn, error
     * @description Nivel de detalle para los logs de la aplicación
     */
    level: process.env.LOG_LEVEL || CONFIG_DEFAULT.logging.level,
  },

  security: {
    /**
     * Clave secreta para JWT
     * @type {string}
     * @example my-super-secret-key-123
     * @description Clave secreta para firmar y verificar tokens JWT
     * @required false
     */
    jwtSecret:
      process.env.JWT_SECRET || 'development-secret-key-change-in-production',
    /**
     * Tiempo de expiración del token JWT
     * @type {string}
     * @default 1h
     * @example 1h, 24h, 7d
     * @description Tiempo antes de que expire un token JWT
     */
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  rateLimit: {
    /**
     * Ventana de tiempo para rate limiting en milisegundos
     * @type {number}
     * @default 60000
     * @example 60000, 300000
     * @description Ventana de tiempo para aplicar límites de tasa de requests
     */
    windowMs: process.env.RATE_LIMIT_WINDOW_MS
      ? Number(process.env.RATE_LIMIT_WINDOW_MS)
      : CONFIG_DEFAULT.rateLimit.windowMs,
    /**
     * Máximo número de requests por ventana de tiempo
     * @type {number}
     * @default 200
     * @example 100, 500
     * @description Número máximo de requests permitidos por ventana de tiempo
     */
    maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS
      ? Number(process.env.RATE_LIMIT_MAX_REQUESTS)
      : CONFIG_DEFAULT.rateLimit.maxRequests,
  },
};
