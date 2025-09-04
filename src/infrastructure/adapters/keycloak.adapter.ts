import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import RealmRepresentation from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import {
  CreateRealmData,
  CreateUserData,
} from '../interfaces/keycloak.interface';

/**
 * Adaptador para integración con Keycloak Admin API
 * Maneja la creación de realms, usuarios y roles en un ambiente multi-tenant
 */
@Injectable()
export class KeycloakAdapter {
  private readonly _logger = new Logger(KeycloakAdapter.name);
  private kcAdminClient: KcAdminClient;

  constructor(private readonly _configService: ConfigService) {
    // TODO: Migrar a KeycloakManagementService - temporalmente habilitado
    void this.initializeAdminClient();
    this._logger.log(
      'KeycloakAdapter inicializado - migrando gradualmente a KeycloakManagementService',
    );
  }

  /**
   * Inicializa el cliente de administración de Keycloak
   */
  private async initializeAdminClient(): Promise<void> {
    try {
      // Verificar configuración de Keycloak
      const keycloakConfig = this._configService.get('keycloak');
      this._logger.debug(
        `Configuración Keycloak: ${JSON.stringify(keycloakConfig)}`,
      );

      this.kcAdminClient = new KcAdminClient({
        baseUrl: keycloakConfig.serverUrl,
        realmName: 'master',
      });

      await this.kcAdminClient.auth({
        username: keycloakConfig.adminUsername,
        password: keycloakConfig.adminPassword,
        grantType: 'password',
        clientId: 'admin-cli',
      });

      this._logger.log('Keycloak Admin Client inicializado exitosamente');
    } catch (error) {
      this._logger.error('Error inicializando Keycloak Admin Client', error);

      // Verificar si es un problema de conexión
      if (error.code === 'ECONNREFUSED') {
        this._logger.error(
          'No se puede conectar a Keycloak. Verifica que el servicio esté corriendo en el puerto 8080',
        );
        this._logger.error(
          'URL esperada:',
          this._configService.get('keycloak')?.baseUrl ||
            'http://localhost:8080',
        );
      }

      throw new InternalServerErrorException('Error connecting to Keycloak');
    }
  }

  /**
   * Crea un nuevo realm para una empresa en Keycloak
   * @param realmData - Datos del realm a crear
   */
  async createRealm(realmData: CreateRealmData): Promise<void> {
    try {
      const realmRepresentation: RealmRepresentation = {
        realm: realmData.realmName,
        displayName: realmData.displayName,
        enabled: true,
        registrationAllowed: false,
        loginWithEmailAllowed: true,
        duplicateEmailsAllowed: false,
        resetPasswordAllowed: true,
        rememberMe: true,
        editUsernameAllowed: false,
        internationalizationEnabled: true,
        defaultLocale: 'es',
        accessTokenLifespan: 1800, // 30 minutos
        refreshTokenMaxReuse: 0,
        clients: [
          {
            clientId: `${realmData.realmName}-api`,
            name: `${realmData.displayName} API Client`,
            enabled: true,
            publicClient: false,
            bearerOnly: true,
            protocol: 'openid-connect',
            attributes: {
              'jwt.credential.certificate': 'MIICmzCCAYMCBgGM...',
            },
          },
          {
            clientId: `${realmData.realmName}-web`,
            name: `${realmData.displayName} Web Client`,
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
            serviceAccountsEnabled: false,
          },
        ],
      };

      await this.kcAdminClient.realms.create(realmRepresentation);
      this._logger.log(`Realm '${realmData.realmName}' creado exitosamente`);

      // Crear roles predeterminados en el nuevo realm
      await this.createDefaultRoles(realmData.realmName);
    } catch (error) {
      this._logger.error(`Error creando realm '${realmData.realmName}'`, error);

      if (error.response?.status === 409) {
        throw new BadRequestException(
          `El realm '${realmData.realmName}' ya existe`,
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
          description: 'Administrador con acceso completo a todos los recursos',
        },
        {
          name: 'Empleado',
          description: 'Empleado con acceso limitado a funcionalidades básicas',
        },
        {
          name: 'Contador',
          description:
            'Contador con acceso a reportes financieros y contabilidad',
        },
        {
          name: 'Supervisor',
          description: 'Supervisor con permisos de gestión y supervisión',
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
   * Crea un usuario en Keycloak
   * @param userData - Datos del usuario a crear
   */
  async createUser(userData: CreateUserData): Promise<string> {
    try {
      // Primero autenticarse contra el realm master
      this.kcAdminClient.setConfig({
        realmName:
          this._configService.get<string>('keycloak.adminRealm') || 'master',
      });

      const adminUsername = this._configService.get<string>(
        'keycloak.adminUsername',
      );
      const adminPassword = this._configService.get<string>(
        'keycloak.adminPassword',
      );

      this._logger.debug(
        `Intentando autenticarse con usuario: ${adminUsername}`,
      );

      await this.kcAdminClient.auth({
        username: adminUsername,
        password: adminPassword,
        grantType: 'password',
        clientId: 'admin-cli',
      });

      // Ahora cambiar al realm objetivo
      this.kcAdminClient.setConfig({ realmName: userData.realmName });

      const userRepresentation: UserRepresentation = {
        username: userData.email,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: true,
        emailVerified: false,
        credentials: [
          {
            type: 'password',
            value: userData.temporaryPassword,
            temporary: true,
          },
        ],
        attributes: {
          companyId: [userData.companyId],
          authId: [userData.authId],
        },
      };

      const createdUser =
        await this.kcAdminClient.users.create(userRepresentation);

      if (createdUser.id) {
        this._logger.log(
          `Usuario '${userData.email}' creado en realm '${userData.realmName}'`,
        );
        return createdUser.id;
      }

      throw new Error('Usuario creado pero sin ID retornado');
    } catch (error) {
      this._logger.error(`Error creando usuario '${userData.email}'`, error);

      if (error.response?.status === 409) {
        throw new BadRequestException(
          `El usuario '${userData.email}' ya existe en el realm`,
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
   * @param roleName - Nombre del rol a asignar
   */
  async assignRoleToUser(
    realmName: string,
    userId: string,
    roleName: string,
  ): Promise<void> {
    try {
      // Primero autenticarse contra el realm master
      this.kcAdminClient.setConfig({
        realmName:
          this._configService.get<string>('keycloak.adminRealm') || 'master',
      });

      await this.kcAdminClient.auth({
        username: this._configService.get<string>('keycloak.adminUsername'),
        password: this._configService.get<string>('keycloak.adminPassword'),
        grantType: 'password',
        clientId: 'admin-cli',
      });

      // Ahora cambiar al realm objetivo
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
        `Error asignando rol '${roleName}' al usuario '${userId}'`,
        error,
      );
      throw new InternalServerErrorException('Error asignando rol en Keycloak');
    }
  }

  /**
   * Verifica si un realm existe
   * @param realmName - Nombre del realm a verificar
   */
  async realmExists(realmName: string): Promise<boolean> {
    try {
      const realm = await this.kcAdminClient.realms.findOne({
        realm: realmName,
      });
      if (realm) {
        return true;
      }
      return false;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Verifica si un usuario existe en un realm
   * @param realmName - Nombre del realm
   * @param email - Email del usuario
   */
  async userExistsInRealm(realmName: string, email: string): Promise<boolean> {
    try {
      this.kcAdminClient.setConfig({ realmName });

      // Re-autenticar después de cambiar configuración
      await this.kcAdminClient.auth({
        username: this._configService.get<string>('keycloak.adminUsername'),
        password: this._configService.get<string>('keycloak.adminPassword'),
        grantType: 'password',
        clientId: 'admin-cli',
      });

      const users = await this.kcAdminClient.users.find({ email, exact: true });
      return users.length > 0;
    } catch (error) {
      this._logger.error(
        `Error verificando existencia de usuario '${email}' en realm '${realmName}'`,
        error,
      );
      return false;
    }
  }

  /**
   * Obtiene información de un usuario por email en un realm
   * @param realmName - Nombre del realm
   * @param email - Email del usuario
   */
  async getUserByEmail(
    realmName: string,
    email: string,
  ): Promise<UserRepresentation | null> {
    try {
      this.kcAdminClient.setConfig({ realmName });
      const users = await this.kcAdminClient.users.find({ email, exact: true });
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      this._logger.error(
        `Error obteniendo usuario '${email}' del realm '${realmName}'`,
        error,
      );
      return null;
    }
  }

  /**
   * Actualiza la contraseña de un usuario y la marca como no temporal
   * @param realmName - Nombre del realm
   * @param userId - ID del usuario en Keycloak
   * @param newPassword - Nueva contraseña
   */
  async updateUserPassword(
    realmName: string,
    userId: string,
    newPassword: string,
  ): Promise<void> {
    try {
      this.kcAdminClient.setConfig({ realmName });

      await this.kcAdminClient.users.resetPassword({
        id: userId,
        credential: {
          type: 'password',
          value: newPassword,
          temporary: false,
        },
      });

      this._logger.log(
        `Contraseña actualizada para usuario '${userId}' en realm '${realmName}'`,
      );
    } catch (error) {
      this._logger.error(
        `Error actualizando contraseña del usuario '${userId}'`,
        error,
      );
      throw new InternalServerErrorException(
        'Error actualizando contraseña en Keycloak',
      );
    }
  }

  /**
   * Marca un usuario como verificado (emailVerified = true)
   * @param realmName - Nombre del realm
   * @param userId - ID del usuario en Keycloak
   */
  async markUserAsVerified(realmName: string, userId: string): Promise<void> {
    try {
      this.kcAdminClient.setConfig({ realmName });

      await this.kcAdminClient.users.update(
        { id: userId },
        { emailVerified: true },
      );

      this._logger.log(
        `Usuario '${userId}' marcado como verificado en realm '${realmName}'`,
      );
    } catch (error) {
      this._logger.error(
        `Error marcando usuario '${userId}' como verificado`,
        error,
      );
      throw new InternalServerErrorException(
        'Error actualizando estado del usuario en Keycloak',
      );
    }
  }
}
