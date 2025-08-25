export const config = {
  database: {
    host: 'localhost',
    port: 5432,
    username: 'juanpablo',
    password: 'juanpablo',
    database: 'auth-service',
    synchronize: true,
    logging: true,
  },
  security: {
    jwtSecret: 'local-secret',
    jwtExpiresIn: '1h',
  },
  logging: {
    level: 'debug',
  },
};
