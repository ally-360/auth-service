import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { randomBytes } from 'crypto';

export interface CreateRealmData {
  companyName: string;
  description?: string;
}

export interface CreateUserData {
  realmName: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

// Tipos básicos de Keycloak (simplificados)
interface RealmRepresentation {
  realm: string;
  enabled: boolean;
  displayName?: string;
  displayNameHtml?: string;
  registrationAllowed?: boolean;
  loginWithEmailAllowed?: boolean;
  duplicateEmailsAllowed?: boolean;
  rememberMe?: boolean;
  verifyEmail?: boolean;
  resetPasswordAllowed?: boolean;
  editUsernameAllowed?: boolean;
  bruteForceProtected?: boolean;
}

interface ClientRepresentation {
  clientId: string;
  name?: string;
  description?: string;
  enabled: boolean;
  publicClient: boolean;
  secret?: string;
  protocol: string;
  redirectUris?: string[];
  webOrigins?: string[];
  standardFlowEnabled?: boolean;
  implicitFlowEnabled?: boolean;
  directAccessGrantsEnabled?: boolean;
  serviceAccountsEnabled?: boolean;
  authorizationServicesEnabled?: boolean;
}

interface RoleRepresentation {
  name: string;
  description?: string;
}

interface UserRepresentation {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified?: boolean;
  credentials?: Array<{
    type: string;
    value: string;
    temporary?: boolean;
  }>;
}

@Injectable()
export class KeycloakManagementService {
  private readonly logger = new Logger(KeycloakManagementService.name);
  private adminClient: KcAdminClient;

  constructor(private readonly configService: ConfigService) {
    void this.initializeAdminClient();
  }

  /**
   * Inicializa el cliente de administración de Keycloak
   */
  private async initializeAdminClient(): Promise<void> {
    try {
      this.adminClient = new KcAdminClient({
        baseUrl: this.configService.get<string>('keycloak.serverUrl'),
        realmName: this.configService.get<string>('keycloak.adminRealm'),
      });

      await this.adminClient.auth({
        username: this.configService.get<string>('keycloak.adminUsername'),
        password: this.configService.get<string>('keycloak.adminPassword'),
        grantType: 'password',
        clientId: 'admin-cli',
      });

      this.logger.log('Keycloak Admin Client initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing Keycloak Admin Client', error);
      throw new InternalServerErrorException('Error connecting to Keycloak');
    }
  }

  /**
   * Crea un nuevo realm para una empresa con cliente y roles predeterminados
   * @param realmData - Datos del realm a crear
   */
  async createRealmForCompany(realmData: CreateRealmData): Promise<string> {
    const realmName = realmData.companyName.toLowerCase().replace(/\s+/g, '-');
    const clientSecret = randomBytes(32).toString('hex');

    try {
      // Verificar si el realm ya existe
      const exists = await this.realmExists(realmName);
      if (exists) {
        throw new Error(`Realm ${realmName} already exists`);
      }

      const realm: RealmRepresentation = {
        realm: realmName,
        enabled: true,
        displayName: `${realmData.companyName} Realm`,
        displayNameHtml: `<strong>${realmData.companyName}</strong> Realm`,
        registrationAllowed: false,
        loginWithEmailAllowed: true,
        duplicateEmailsAllowed: false,
        rememberMe: true,
        verifyEmail: true,
        resetPasswordAllowed: true,
        editUsernameAllowed: false,
        bruteForceProtected: true,
      };

      await this.adminClient.realms.create(realm);
      this.logger.log(`Realm ${realmName} created successfully`);

      this.adminClient.setConfig({ realmName });

      const client: ClientRepresentation = {
        clientId: 'ally-api',
        name: 'Ally API Client',
        description: 'Cliente para la API de Ally',
        enabled: true,
        publicClient: false,
        secret: clientSecret,
        protocol: 'openid-connect',
        redirectUris: [
          'http://localhost:3000/*',
          'http://localhost:4000/*',
          'https://ally.local/*',
        ],
        webOrigins: [
          'http://localhost:3000',
          'http://localhost:4000',
          'https://ally.local',
        ],
        standardFlowEnabled: true,
        implicitFlowEnabled: false,
        directAccessGrantsEnabled: true,
        serviceAccountsEnabled: true,
        authorizationServicesEnabled: false,
      };

      await this.adminClient.clients.create(client);
      this.logger.log(`Client ally-api created in realm ${realmName}`);

      await this.createDefaultRoles(realmName);

      this.adminClient.setConfig({
        realmName: this.configService.get<string>('keycloak.adminRealm'),
      });

      this.logger.log(
        `Realm for company ${realmData.companyName} created successfully`,
      );

      return `Realm for ${realmData.companyName} created successfully. Client secret: ${clientSecret}`;
    } catch (error) {
      this.logger.error('Error creating realm', error);
      throw new InternalServerErrorException(
        `Error creating realm: ${error.message}`,
      );
    }
  }

  /**
   * Crea roles predeterminados en un realm
   * @param realmName - Nombre del realm
   */
  private async createDefaultRoles(realmName: string): Promise<void> {
    const roles: RoleRepresentation[] = [
      {
        name: 'Admin',
        description: 'Administrador del sistema con acceso completo',
      },
      {
        name: 'Empleado',
        description: 'Rol básico para empleados de la empresa',
      },
      {
        name: 'Supervisor',
        description: 'Supervisor con permisos intermedios',
      },
      {
        name: 'Usuario',
        description: 'Usuario básico del sistema',
      },
    ];

    // Cambiar al realm específico
    this.adminClient.setConfig({ realmName });

    for (const role of roles) {
      try {
        await this.adminClient.roles.create(role);
        this.logger.log(`Role ${role.name} created in realm ${realmName}`);
      } catch {
        this.logger.warn(
          `Role ${role.name} might already exist in realm ${realmName}`,
        );
      }
    }
  }

  /**
   * Crea un usuario en Keycloak
   * @param userData - Datos del usuario a crear
   */
  async createUser(userData: CreateUserData): Promise<string> {
    try {
      // Cambiar al realm específico
      this.adminClient.setConfig({ realmName: userData.realmName });

      // Verificar si el usuario ya existe
      const existingUser = await this.getUserByEmail(
        userData.realmName,
        userData.email,
      );
      if (existingUser) {
        throw new Error(`User with email ${userData.email} already exists`);
      }

      // Crear el usuario
      const user: UserRepresentation = {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled ?? true,
        emailVerified: false,
        credentials: [
          {
            type: 'password',
            value: userData.password,
            temporary: true, // El usuario debe cambiar la contraseña en el primer login
          },
        ],
      };

      const createdUser = await this.adminClient.users.create(user);
      const userId = createdUser.id;

      this.logger.log(
        `User ${userData.username} created in realm ${userData.realmName}`,
      );

      // Volver al realm master
      this.adminClient.setConfig({
        realmName: this.configService.get<string>('keycloak.adminRealm'),
      });

      return userId;
    } catch (error) {
      this.logger.error('Error creating user', error);
      throw new InternalServerErrorException(
        `Error creating user: ${error.message}`,
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
      // Cambiar al realm específico
      this.adminClient.setConfig({ realmName });

      // Obtener el rol
      const role = await this.adminClient.roles.findOneByName({
        name: roleName,
      });
      if (!role) {
        throw new Error(`Role ${roleName} not found in realm ${realmName}`);
      }

      // Asignar el rol al usuario
      await this.adminClient.users.addRealmRoleMappings({
        id: userId,
        roles: [
          {
            id: role.id!,
            name: role.name!,
          },
        ],
      });

      this.logger.log(
        `Role ${roleName} assigned to user ${userId} in realm ${realmName}`,
      );

      // Volver al realm master
      this.adminClient.setConfig({
        realmName: this.configService.get<string>('keycloak.adminRealm'),
      });
    } catch (error) {
      this.logger.error('Error assigning role to user', error);
      throw new InternalServerErrorException(
        `Error assigning role: ${error.message}`,
      );
    }
  }

  /**
   * Verifica si un realm existe
   * @param realmName - Nombre del realm a verificar
   */
  async realmExists(realmName: string): Promise<boolean> {
    try {
      await this.adminClient.realms.findOne({ realm: realmName });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifica si un usuario existe en un realm
   * @param realmName - Nombre del realm
   * @param email - Email del usuario
   */
  async userExistsInRealm(realmName: string, email: string): Promise<boolean> {
    const user = await this.getUserByEmail(realmName, email);
    return !!user;
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
      // Cambiar al realm específico
      this.adminClient.setConfig({ realmName });

      const users = await this.adminClient.users.find({
        email: email,
        exact: true,
      });

      // Volver al realm master
      this.adminClient.setConfig({
        realmName: this.configService.get<string>('keycloak.adminRealm'),
      });

      return users.length > 0 ? (users[0] as any) : null;
    } catch (error) {
      this.logger.error('Error getting user by email', error);
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
      // Cambiar al realm específico
      this.adminClient.setConfig({ realmName });

      await this.adminClient.users.resetPassword({
        id: userId,
        credential: {
          type: 'password',
          value: newPassword,
          temporary: false,
        },
      });

      this.logger.log(
        `Password updated for user ${userId} in realm ${realmName}`,
      );

      // Volver al realm master
      this.adminClient.setConfig({
        realmName: this.configService.get<string>('keycloak.adminRealm'),
      });
    } catch (error) {
      this.logger.error('Error updating user password', error);
      throw new InternalServerErrorException(
        `Error updating password: ${error.message}`,
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
      // Cambiar al realm específico
      this.adminClient.setConfig({ realmName });

      await this.adminClient.users.update(
        { id: userId },
        { emailVerified: true },
      );

      this.logger.log(
        `User ${userId} marked as verified in realm ${realmName}`,
      );

      // Volver al realm master
      this.adminClient.setConfig({
        realmName: this.configService.get<string>('keycloak.adminRealm'),
      });
    } catch (error) {
      this.logger.error('Error marking user as verified', error);
      throw new InternalServerErrorException(
        `Error verifying user: ${error.message}`,
      );
    }
  }
}
