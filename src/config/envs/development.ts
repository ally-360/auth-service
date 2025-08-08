export const config = {
  db: {
    extra: {
      connectionLimit: 10,
    },
    ssl: false,
    synchronize: true,
    logging: true,
  },
  jwt: {
    secret: process.env.SECRET || 'development-secret-key-change-in-production',
    expire_in: process.env.TOKEN_EXPIRE_IN || '24h',
  },
};
