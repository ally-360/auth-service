export const config = {
  database: {
    synchronize: false,
    logging: false,
    ssl: true,
  },
  security: {
    jwtExpiresIn: '1h',
  },
  logging: {
    level: 'info',
  },
  rateLimit: {
    maxRequests: 100,
  },
};
