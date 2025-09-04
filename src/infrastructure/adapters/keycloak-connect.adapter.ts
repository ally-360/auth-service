import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';

/**
 * Nuevo adaptador para Keycloak que conecta directamente sin problemas de configuración
 * Este adaptador resuelve los problemas de conexión del adaptador anterior
 */
@Injectable()
export class KeycloakConnectAdapter {
  private readonly _logger = new Logger(KeycloakConnectAdapter.name);
  private kcAdminClient: KcAdminClient;

  constructor(private readonly _configService: ConfigService) {}

  /**
   * Inicializa la conexión con Keycloak de forma lazy
   */
  private async ensureConnection(): Promise<void> {
    if (this.kcAdminClient) {
      return; // Ya está inicializado
    }

    try {
      const keycloakBaseUrl =
        process.env.KC_BASE_URL || 'http://localhost:8080';

      this._logger.debug(
        `Intentando conectar a Keycloak en: ${keycloakBaseUrl}`,
      );

      this.kcAdminClient = new KcAdminClient({
        baseUrl: keycloakBaseUrl,
        realmName: 'master',
      });

      await this.kcAdminClient.auth({
        username: process.env.KC_ADMIN_USERNAME || 'admin',
        password: process.env.KC_ADMIN_PASSWORD || 'admin',
        grantType: 'password',
        clientId: 'admin-cli',
      });

      this._logger.log('Keycloak Admin Client conectado exitosamente');
    } catch (error) {
      this._logger.error('Error conectando con Keycloak Admin Client', error);

      if (error.code === 'ECONNREFUSED') {
        this._logger.error(
          'No se puede conectar a Keycloak. Verifica que el servicio esté corriendo',
        );
        this._logger.error(
          'URL intentada:',
          process.env.KC_BASE_URL || 'http://localhost:8080',
        );
      }

      throw new InternalServerErrorException(
        'Error connecting to Keycloak Admin API',
      );
    }
  }

  /**
   * Crea un nuevo realm para una empresa
   * @param companyName - Nombre de la empresa
   * @param displayName - Nombre de display del realm
   */
  async createRealmForCompany(
    companyName: string,
    displayName?: string,
  ): Promise<string> {
    await this.ensureConnection();

    try {
      const realmName = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);

      const realm = {
        realm: realmName,
        enabled: true,
        displayName: displayName || `${companyName} Realm`,
        registrationAllowed: false,
        loginWithEmailAllowed: true,
        duplicateEmailsAllowed: false,
        resetPasswordAllowed: true,
        rememberMe: true,
        editUsernameAllowed: false,
        clients: [
          {
            clientId: 'ally-api',
            name: `${companyName} API Client`,
            enabled: true,
            publicClient: false,
            bearerOnly: true,
            protocol: 'openid-connect',
            standardFlowEnabled: true,
            directAccessGrantsEnabled: true,
          },
          {
            clientId: `${realmName}-web`,
            name: `${companyName} Web Client`,
            enabled: true,
            publicClient: true,
            protocol: 'openid-connect',
            redirectUris: [
              'http://localhost:3000/*',
              'http://localhost:5173/*',
              'https://ally360.netlify.app/*',
            ],
            webOrigins: ['+'],
            standardFlowEnabled: true,
            directAccessGrantsEnabled: true,
          },
        ],
      };

      await this.kcAdminClient.realms.create(realm);

      // Crear roles predeterminados
      await this.createDefaultRoles(realmName);

      this._logger.log(
        `Realm '${realmName}' creado exitosamente para empresa '${companyName}'`,
      );
      return `Realm for ${companyName} created successfully`;
    } catch (error) {
      this._logger.error(
        `Error creando realm para empresa '${companyName}'`,
        error,
      );

      if (error.response?.status === 409) {
        throw new BadRequestException(
          `Ya existe un realm para la empresa '${companyName}'`,
        );
      }

      throw new InternalServerErrorException('Error creando realm en Keycloak');
    }
  }

  /**
   * Crea roles predeterminados en un realm
   * @param realmName - Nombre del realm
   */
  private async createDefaultRoles(realmName: string): Promise<void> {
    try {
      this.kcAdminClient.setConfig({ realmName });

      const defaultRoles = [
        {
          name: 'Admin',
          description: 'Administrador del sistema',
        },
        {
          name: 'Empleado',
          description: 'Rol básico para empleados',
        },
        {
          name: 'Contador',
          description: 'Contador con acceso a reportes financieros',
        },
        {
          name: 'Supervisor',
          description: 'Supervisor con permisos de gestión',
        },
      ];

      for (const role of defaultRoles) {
        await this.kcAdminClient.roles.create({
          name: role.name,
          description: role.description,
        });
      }

      this._logger.log(`Roles predeterminados creados en realm '${realmName}'`);
    } catch (error) {
      this._logger.error(`Error creando roles en realm '${realmName}'`, error);
    }
  }

  /**
   * Crea un usuario en un realm específico
   * @param realmName - Nombre del realm
   * @param userData - Datos del usuario
   */
  async createUser(
    realmName: string,
    userData: {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      password: string;
      enabled?: boolean;
      emailVerified?: boolean;
    },
  ): Promise<string> {
    await this.ensureConnection();

    try {
      this.kcAdminClient.setConfig({ realmName });

      const user = {
        username: userData.username || userData.email,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled ?? true,
        emailVerified: userData.emailVerified ?? false,
        credentials: [
          {
            type: 'password',
            value: userData.password,
            temporary: true,
          },
        ],
      };

      const createdUser = await this.kcAdminClient.users.create(user);

      this._logger.log(
        `Usuario '${userData.email}' creado exitosamente en realm '${realmName}'`,
      );
      return createdUser.id;
    } catch (error) {
      this._logger.error(
        `Error creando usuario '${userData.email}' en realm '${realmName}'`,
        error,
      );

      if (error.response?.status === 409) {
        throw new BadRequestException(
          `El usuario '${userData.email}' ya existe en el realm '${realmName}'`,
        );
      }

      throw new InternalServerErrorException(
        'Error creando usuario en Keycloak',
      );
    }
  }

  /**
   * Asigna un rol a un usuario en un realm específico
   * @param realmName - Nombre del realm
   * @param userId - ID del usuario en Keycloak
   * @param roleName - Nombre del rol
   */
  async assignRoleToUser(
    realmName: string,
    userId: string,
    roleName: string,
  ): Promise<void> {
    await this.ensureConnection();

    try {
      this.kcAdminClient.setConfig({ realmName });

      const role = await this.kcAdminClient.roles.findOneByName({
        name: roleName,
      });

      if (!role) {
        throw new BadRequestException(
          `El rol '${roleName}' no existe en el realm`,
        );
      }

      await this.kcAdminClient.users.addRealmRoleMappings({
        id: userId,
        roles: [
          {
            id: role.id!,
            name: role.name!,
          },
        ],
      });

      this._logger.log(
        `Rol '${roleName}' asignado al usuario '${userId}' en realm '${realmName}'`,
      );
    } catch (error) {
      this._logger.error(
        `Error asignando rol '${roleName}' al usuario '${userId}' en realm '${realmName}'`,
        error,
      );
      throw new InternalServerErrorException('Error asignando rol al usuario');
    }
  }

  /**
   * Verifica si un realm existe
   * @param realmName - Nombre del realm
   */
  async realmExists(realmName: string): Promise<boolean> {
    await this.ensureConnection();

    try {
      await this.kcAdminClient.realms.findOne({ realm: realmName });
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
}
