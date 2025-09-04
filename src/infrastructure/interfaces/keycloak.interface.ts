/**
 * Interfaces para la integración con Keycloak en el sistema multi-tenant
 */

export interface CreateRealmData {
  realmName: string;
  displayName: string;
  companyId: string;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
  realmName: string;
  companyId: string;
  authId: string;
}

export interface CreateRoleData {
  name: string;
  description: string;
  realmName: string;
}

export interface KeycloakUserInfo {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  enabled: boolean;
  attributes?: {
    companyId?: string[];
    authId?: string[];
    [key: string]: string[] | undefined;
  };
}

export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  email?: string;
  realmName?: string;
  companyId?: string;
  roles?: string[];
  error?: string;
}

export interface RealmUserSummary {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  roles: string[];
}
