import { ConfigService } from '@nestjs/config';
import { KeycloakConnectConfig } from 'nest-keycloak-connect';

export const createKeycloakOptions = (
  configService: ConfigService,
): KeycloakConnectConfig => {
  return {
    authServerUrl: configService.get<string>(
      'keycloak.serverUrl',
      'http://keycloak:8080',
    ),
    realm: configService.get<string>('keycloak.realm', 'ally'),
    clientId: configService.get<string>('keycloak.clientId', 'ally-api'),
    secret: configService.get<string>('keycloak.clientSecret', 'ally-secret'),
    // Configuración adicional
    cookieKey: 'KEYCLOAK_JWT',
  };
};
