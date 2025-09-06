import { User } from 'src/modules/auth/entities';
import { Email, Password, UserId } from 'src/common/value-objects';

export interface AuthServiceInterface {
  // Autenticación básica
  login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult>;
  logout(userId: string, refreshToken?: string): Promise<void>;

  // Refresh tokens
  refreshToken(refreshToken: string): Promise<AuthResult>;
  revokeRefreshToken(refreshToken: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;

  // Verificación de email
  sendEmailVerification(email: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<boolean>;

  // Reset de contraseña
  requestPasswordReset(
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  // 2FA
  enable2FA(userId: string): Promise<{ secret: string; qrCode: string }>;
  disable2FA(userId: string, otpCode: string): Promise<boolean>;
  verify2FA(userId: string, otpCode: string): Promise<boolean>;
}

export interface UserServiceInterface {
  // Gestión de usuarios
  createUser(email: string, password: string, profile?: any): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  activateUser(userId: string): Promise<void>;
  deactivateUser(userId: string): Promise<void>;

  // Validación de credenciales
  validateCredentials(email: string, password: string): Promise<User | null>;
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean>;

  // Gestión de roles y permisos
  assignRole(userId: string, roleId: string): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<void>;
  getUserRoles(userId: string): Promise<string[]>;
  getUserPermissions(userId: string): Promise<string[]>;
  hasPermission(userId: string, permission: string): Promise<boolean>;

  // Búsqueda de usuarios
  findUserById(userId: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUsersByRole(roleId: string): Promise<User[]>;
}

export interface OtpServiceInterface {
  generateSecret(): string;
  generateQRCode(secret: string, email: string): string;
  verifyOTP(secret: string, token: string): boolean;
  generateOTP(secret: string): string;
}

export interface EmailServiceInterface {
  sendVerificationEmail(email: string, code: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
  send2FAEnabledEmail(email: string): Promise<void>;
  send2FADisabledEmail(email: string): Promise<void>;
}

export interface PasswordServiceInterface {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  generateResetToken(): string;
  validatePasswordStrength(password: string): boolean;
}

export interface RoleServiceInterface {
  createRole(
    name: string,
    description: string,
    isDefault?: boolean,
  ): Promise<any>;
  updateRole(
    roleId: string,
    updates: { name?: string; description?: string },
  ): Promise<any>;
  deleteRole(roleId: string): Promise<void>;
  assignPermission(roleId: string, permissionId: string): Promise<void>;
  removePermission(roleId: string, permissionId: string): Promise<void>;
  getRolePermissions(roleId: string): Promise<string[]>;
  getAllRoles(): Promise<any[]>;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    is2FAEnabled: boolean;
  };
  expiresIn: number;
}
