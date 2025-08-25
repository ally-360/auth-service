export const config = {
  database: {
    synchronize: true,
    logging: true,
  },
  security: {
    jwtSecret: 'development-secret-key-change-in-production',
    jwtExpiresIn: '24h',
  },
  logging: {
    level: 'debug',
  },
  rateLimit: {
    maxRequests: 200,
  },
};
