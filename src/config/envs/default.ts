import * as entities from 'src/modules/auth/entities';

export const config = {
  port: process.env.PORT,
  db: {
    entities: [...Object.values(entities)],
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'auth-service',
    schema: 'public',
  },
  jwt: {
    secret: process.env.SECRET || 'default-secret-key',
    expire_in: process.env.TOKEN_EXPIRE_IN || '24h',
  },
};
