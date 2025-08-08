import { Auth } from 'src/modules/auth/entities/auth.entity';

export const config = {
  port: process.env.PORT,
  db: {
    entities: [Auth],
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'auth-service',
    schema: 'public',
  },
};
