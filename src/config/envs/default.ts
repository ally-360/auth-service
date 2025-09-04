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
  oidc: {
    issuer: process.env.KC_ISSUER || 'http://localhost:8080/realms/ally',
    clientId: process.env.KC_CLIENT_ID || 'ally-api',
    jwksUri:
      process.env.KC_JWKS_URI ||
      'http://localhost:8080/realms/ally/protocol/openid-connect/certs',
    adminUsername: process.env.KC_ADMIN_USERNAME || 'admin',
    adminPassword: process.env.KC_ADMIN_PASSWORD || 'admin',
  },
  keycloak: {
    serverUrl: process.env.KC_BASE_URL || 'http://localhost:8080',
    realm: process.env.KC_DEFAULT_REALM || 'ally',
    clientId: process.env.KC_CLIENT_ID || 'ally-api',
    clientSecret: process.env.KC_CLIENT_SECRET || 'ally-secret',
    adminRealm: process.env.KC_ADMIN_REALM || 'master',
    adminUsername: process.env.KC_ADMIN_USERNAME || 'admin',
    adminPassword: process.env.KC_ADMIN_PASSWORD || 'admin',
  },
};
