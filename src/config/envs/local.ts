export const config = {
  db: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'juanpablo',
    password: 'juanpablo',
    database: 'ally-erp',
    extra: {
      connectionLimit: 10,
    },
    synchronize: true,
    logging: true,
  },
  jwt: {
    secret: 'local-secret',
    expire_in: '1h',
  },
};
