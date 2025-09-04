import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { KeycloakAdapter } from '../../../infrastructure/adapters/keycloak.adapter';
import {
  CreateRealmData,
  CreateUserData,
} from '../../../infrastructure/interfaces/keycloak.interface';
import { GenstrAdapter } from '../../../infrastructure/adapters/genstr.adapter';

/**
 * Servicio para manejar operaciones multitenant con Keycloak
 * Cada empresa tiene su propio realm y usuarios específicos
 */
@Injectable()
export class KeycloakMultiTenantService {
  private readonly _logger = new Logger(KeycloakMultiTenantService.name);

  constructor(
    private readonly _keycloakAdapter: KeycloakAdapter,
    private readonly _genstrAdapter: GenstrAdapter,
  ) {}

  /**
   * Crea un nuevo realm para una empresa y asigna al usuario como Admin
   * @param companyData - Datos de la empresa
   * @param userData - Datos del usuario propietario
   */
  async createCompanyRealmAndAssignOwner(
    companyData: { name: string; companyId: string },
    userData: {
      email: string;
      firstName: string;
      lastName: string;
      authId: string;
    },
  ): Promise<{
    realmName: string;
    keycloakUserId: string;
    temporaryPassword: string;
  }> {
    const realmName = this.generateRealmName(companyData.name);

    this._logger.log(
      `Iniciando creación de realm '${realmName}' para empresa '${companyData.name}'`,
    );

    const realmExists = await this._keycloakAdapter.realmExists(realmName);
    if (realmExists) {
      this._logger.warn(`El realm '${realmName}' ya existe`);
      throw new BadRequestException(
        `Ya existe un realm para la empresa '${companyData.name}'`,
      );
    }

    try {
      // 1. Crear el realm para la empresa
      const createRealmData: CreateRealmData = {
        realmName,
        displayName: `${companyData.name} - Ally360`,
        companyId: companyData.companyId,
      };

      await this._keycloakAdapter.createRealm(createRealmData);

      // 2. Generar contraseña temporal para el usuario
      const temporaryPassword = this._genstrAdapter.generate(12);

      // 3. Crear el usuario como propietario en el nuevo realm
      const createUserData: CreateUserData = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        temporaryPassword,
        realmName,
        companyId: companyData.companyId,
        authId: userData.authId,
      };

      const keycloakUserId =
        await this._keycloakAdapter.createUser(createUserData);

      // 4. Asignar rol de Admin al usuario propietario
      await this._keycloakAdapter.assignRoleToUser(
        realmName,
        keycloakUserId,
        'Admin',
      );

      this._logger.log(
        `Realm '${realmName}' creado exitosamente con usuario propietario '${userData.email}'`,
      );

      return {
        realmName,
        keycloakUserId,
        temporaryPassword,
      };
    } catch (error) {
      this._logger.error(
        `Error creando realm y usuario propietario para empresa '${companyData.name}'`,
        error,
      );
      throw error;
    }
  }

  /**
   * Registra un usuario en el realm genérico (ally) antes de crear empresa
   * @param userData - Datos del usuario a registrar
   */
  async registerUserInGenericRealm(userData: {
    email: string;
    firstName: string;
    lastName: string;
    authId: string;
  }): Promise<{
    keycloakUserId: string;
    temporaryPassword: string;
  }> {
    const genericRealmName = 'ally'; // Realm genérico para usuarios sin empresa

    this._logger.log(
      `Registrando usuario '${userData.email}' en realm genérico`,
    );

    // Verificar si el usuario ya existe en el realm genérico
    const userExists = await this._keycloakAdapter.userExistsInRealm(
      genericRealmName,
      userData.email,
    );

    if (userExists) {
      throw new BadRequestException(
        `El usuario '${userData.email}' ya está registrado en el sistema`,
      );
    }

    try {
      // Generar contraseña temporal
      const temporaryPassword = this._genstrAdapter.generate(12);

      // Crear usuario en realm genérico
      const createUserData: CreateUserData = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        temporaryPassword,
        realmName: genericRealmName,
        companyId: 'generic', // Valor temporal hasta que tenga empresa
        authId: userData.authId,
      };

      const keycloakUserId =
        await this._keycloakAdapter.createUser(createUserData);

      // Asignar rol básico de User en el realm genérico
      await this._keycloakAdapter.assignRoleToUser(
        genericRealmName,
        keycloakUserId,
        'user',
      );

      this._logger.log(
        `Usuario '${userData.email}' registrado exitosamente en realm genérico`,
      );

      return {
        keycloakUserId,
        temporaryPassword,
      };
    } catch (error) {
      this._logger.error(
        `Error registrando usuario '${userData.email}' en realm genérico`,
        error,
      );
      throw error;
    }
  }

  /**
   * Agrega un usuario existente a un realm de empresa con un rol específico
   * @param realmName - Nombre del realm de la empresa
   * @param userData - Datos del usuario a agregar
   * @param roleName - Rol a asignar al usuario
   */
  async addUserToCompanyRealm(
    realmName: string,
    userData: {
      email: string;
      firstName: string;
      lastName: string;
      authId: string;
      companyId: string;
    },
    roleName: 'Admin' | 'Empleado' | 'Contador' | 'Supervisor',
  ): Promise<{
    keycloakUserId: string;
    temporaryPassword: string;
  }> {
    this._logger.log(
      `Agregando usuario '${userData.email}' al realm '${realmName}' con rol '${roleName}'`,
    );

    // Verificar si el realm existe
    const realmExists = await this._keycloakAdapter.realmExists(realmName);
    if (!realmExists) {
      throw new BadRequestException(`El realm '${realmName}' no existe`);
    }

    // Verificar si el usuario ya existe en este realm
    const userExists = await this._keycloakAdapter.userExistsInRealm(
      realmName,
      userData.email,
    );
    if (userExists) {
      throw new BadRequestException(
        `El usuario '${userData.email}' ya existe en la empresa`,
      );
    }

    try {
      // Generar contraseña temporal
      const temporaryPassword = this._genstrAdapter.generate(12);

      // Crear usuario en el realm de la empresa
      const createUserData: CreateUserData = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        temporaryPassword,
        realmName,
        companyId: userData.companyId,
        authId: userData.authId,
      };

      const keycloakUserId =
        await this._keycloakAdapter.createUser(createUserData);

      // Asignar el rol especificado
      await this._keycloakAdapter.assignRoleToUser(
        realmName,
        keycloakUserId,
        roleName,
      );

      this._logger.log(
        `Usuario '${userData.email}' agregado exitosamente al realm '${realmName}' con rol '${roleName}'`,
      );

      return {
        keycloakUserId,
        temporaryPassword,
      };
    } catch (error) {
      this._logger.error(
        `Error agregando usuario '${userData.email}' al realm '${realmName}'`,
        error,
      );
      throw error;
    }
  }

  /**
   * Verifica un usuario y actualiza su estado en Keycloak
   * @param realmName - Nombre del realm
   * @param userId - ID del usuario en Keycloak
   */
  async verifyUser(realmName: string, userId: string): Promise<void> {
    try {
      await this._keycloakAdapter.markUserAsVerified(realmName, userId);
      this._logger.log(
        `Usuario '${userId}' verificado en realm '${realmName}'`,
      );
    } catch (error) {
      this._logger.error(
        `Error verificando usuario '${userId}' en realm '${realmName}'`,
        error,
      );
      throw error;
    }
  }

  /**
   * Actualiza la contraseña de un usuario en un realm específico
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
      await this._keycloakAdapter.updateUserPassword(
        realmName,
        userId,
        newPassword,
      );
      this._logger.log(
        `Contraseña actualizada para usuario '${userId}' en realm '${realmName}'`,
      );
    } catch (error) {
      this._logger.error(
        `Error actualizando contraseña del usuario '${userId}' en realm '${realmName}'`,
        error,
      );
      throw error;
    }
  }

  /**
   * Genera un nombre de realm válido basado en el nombre de la empresa
   * @param companyName - Nombre de la empresa
   */
  private generateRealmName(companyName: string): string {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones consecutivos con uno solo
      .replace(/^-|-$/g, '') // Remover guiones del inicio y final
      .substring(0, 50); // Limitar longitud
  }
}
