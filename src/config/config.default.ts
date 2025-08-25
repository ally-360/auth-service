export const CONFIG_DEFAULT = {
  app: {
    /**
     * @default 3000
     */
    port: 3000,
    /**
     * @default localhost
     */
    host: 'localhost',
    /**
     * @default development
     */
    environment: 'development',
    /**
     * @default false
     */
    enableSwagger: false,
  },

  microservice: {
    /**
     * Configuración por defecto para el microservicio de storage
     */
    storage: {
      /**
       * @default 127.0.0.1
       */
      host: '127.0.0.1',
      /**
       * @default 3001
       */
      port: 3001,
    },
  },

  database: {
    /**
     * @default 5432
     */
    port: 5432,
    /**
     * @default auth_service
     */
    schema: 'auth_service',
    /**
     * @default postgres
     */
    username: 'postgres',
    /**
     * @default postgres
     */
    password: 'postgres',
    /**
     * @default auth_service
     */
    database: 'auth_service',
    /**
     * @default false
     */
    ssl: false,
  },

  logging: {
    /**
     * @default info
     */
    level: 'info',
  },

  security: {
    /**
     * @default 3600
     */
    jwtExpiresIn: 3600,
    /**
     * @default development-secret-key-change-in-production
     */
    jwtSecret: 'development-secret-key-change-in-production',
  },

  cors: {
    /**
     * @default http://localhost:3000
     */
    origin: 'http://localhost:3000',
  },

  rateLimit: {
    /**
     * @default 60000
     */
    windowMs: 60000,
    /**
     * @default 200
     */
    maxRequests: 200,
  },
};
