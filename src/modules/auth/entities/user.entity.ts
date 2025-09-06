import {
  BeforeInsert,
  Column,
  Entity,
  Generated,
  Index,
  OneToOne,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Role } from './role.entity';
import { BaseEntity } from './base.entity';
import { Email, UserId } from 'src/common/value-objects';
import { v4 } from 'uuid';

@Entity('users')
@Index(['authId', 'email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number;

  @Column({ name: 'auth_id', type: 'uuid', unique: true })
  @Generated('uuid')
  authId: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 155 })
  password: string;

  @Column({ type: 'boolean', default: true })
  verified: boolean;

  @Column({
    length: 55,
    unique: true,
    nullable: true,
    name: 'verify_token',
  })
  verifyToken: string | null;

  @Column({
    length: 55,
    unique: true,
    nullable: true,
    name: 'reset_password_token',
  })
  resetPasswordToken: string;

  // Campos para 2FA
  @Column({ type: 'boolean', default: false, name: 'otp_enabled' })
  otpEnabled: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'otp_secret' })
  otpSecret: string;

  // Campos de auditoría
  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['soft-remove'],
  })
  profile: Profile;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @BeforeInsert()
  setDefaultValues() {
    this.authId = v4();
    this.isActive = true;
    this.verified = false;
    this.otpEnabled = false;
  }

  // Métodos de dominio
  static create(
    email: string,
    password: string,
    profile?: Partial<Profile>,
  ): User {
    const user = new User();
    user.email = email;
    user.password = password;
    user.verified = false;
    user.isActive = true;
    user.otpEnabled = false;
    user.roles = [];

    if (profile) {
      user.profile = profile as Profile;
    }

    return user;
  }

  static fromData(data: {
    id: number;
    authId: string;
    email: string;
    password: string;
    verified: boolean;
    verifyToken?: string;
    resetPasswordToken?: string;
    otpEnabled: boolean;
    otpSecret?: string;
    lastLoginAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    profile?: Profile;
    roles?: Role[];
  }): User {
    const user = new User();
    user.id = data.id;
    user.authId = data.authId;
    user.email = data.email;
    user.password = data.password;
    user.verified = data.verified;
    user.verifyToken = data.verifyToken as any;
    user.resetPasswordToken = data.resetPasswordToken as any;
    user.otpEnabled = data.otpEnabled;
    user.otpSecret = data.otpSecret as any;
    user.lastLoginAt = data.lastLoginAt as any;
    user.isActive = data.isActive;
    user.createdAt = data.createdAt;
    user.updatedAt = data.updatedAt;
    user.deletedAt = data.deletedAt as any;
    user.profile = data.profile as any;
    user.roles = data.roles || [];
    return user;
  }

  // Métodos de autenticación
  activate(): void {
    if (this.isActive) {
      return; // Already active, no change needed
    }

    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    if (!this.isActive) {
      return; // Already inactive, no change needed
    }

    this.isActive = false;
    this.updatedAt = new Date();
  }

  verify(): void {
    if (this.verified) {
      return; // Already verified, no change needed
    }

    this.verified = true;
    this.verifyToken = null as any;
    this.updatedAt = new Date();
  }

  // Métodos de 2FA
  enableOtp(secret: string): void {
    if (!secret || secret.trim().length === 0) {
      throw new Error('Two-factor secret cannot be empty');
    }

    if (!this.isActive) {
      throw new Error('Cannot enable 2FA for inactive user');
    }

    this.otpEnabled = true;
    this.otpSecret = secret;
    this.updatedAt = new Date();
  }

  disableOtp(): void {
    if (!this.otpEnabled) {
      return; // Already disabled, no change needed
    }

    this.otpEnabled = false;
    this.otpSecret = null as any;
    this.updatedAt = new Date();
  }

  // Métodos de roles
  addRole(role: Role): void {
    if (!this.isActive) {
      throw new Error('Cannot assign role to inactive user');
    }

    const roleExists = this.roles.some((r) => r.id === role.id);
    if (roleExists) {
      throw new Error(`User already has role ${role.name}`);
    }

    this.roles.push(role);
    this.updatedAt = new Date();
  }

  removeRole(roleId: string): void {
    if (!this.isActive) {
      throw new Error('Cannot remove role from inactive user');
    }

    if (this.roles.length <= 1) {
      throw new Error('Cannot remove the last role from user');
    }

    const roleToRemove = this.roles.find((r) => r.id === roleId);
    if (!roleToRemove) {
      return; // Role not found, no change needed
    }

    this.roles = this.roles.filter((r) => r.id !== roleId);
    this.updatedAt = new Date();
  }

  hasRole(roleId: string): boolean {
    return this.roles.some((r) => r.id === roleId);
  }

  hasRoleByName(roleName: string): boolean {
    return this.roles.some((r) => r.name === roleName);
  }

  hasPermission(permissionName: string): boolean {
    return this.roles.some((role) => role.hasPermissionByName(permissionName));
  }

  // Métodos de perfil
  changePassword(newPasswordHash: string): void {
    if (!newPasswordHash || newPasswordHash.trim().length === 0) {
      throw new Error('Password hash cannot be empty');
    }

    if (!this.isActive) {
      throw new Error('Cannot change password for inactive user');
    }

    this.password = newPasswordHash;
    this.updatedAt = new Date();
  }

  changeEmail(newEmail: string): void {
    if (!this.isActive) {
      throw new Error('Cannot change email for inactive user');
    }

    if (this.email === newEmail) {
      return; // Same email, no change needed
    }

    this.email = newEmail;
    this.verified = false; // Require re-verification
    this.verifyToken = null as any;
    this.updatedAt = new Date();
  }

  updateLastLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  // Métodos de consulta
  isEligibleForAdminRole(): boolean {
    return this.isActive && this.roles.some((role) => role.isAdminRole());
  }

  getFullName(): string {
    if (!this.profile) {
      return this.email;
    }
    return `${this.profile.name} ${this.profile.lastname}`;
  }

  // Métodos para obtener Value Objects
  getEmailVO(): Email {
    return Email.fromString(this.email);
  }

  getUserIdVO(): UserId {
    return UserId.fromString(this.authId);
  }

  // Método para obtener información del usuario
  getInfo(): {
    id: number;
    authId: string;
    email: string;
    verified: boolean;
    otpEnabled: boolean;
    isActive: boolean;
    lastLoginAt?: Date;
    roles: string[];
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
  } {
    const allPermissions = this.roles.flatMap((role) =>
      role.getPermissionNames(),
    );
    const uniquePermissions = [...new Set(allPermissions)];

    return {
      id: this.id,
      authId: this.authId,
      email: this.email,
      verified: this.verified,
      otpEnabled: this.otpEnabled,
      isActive: this.isActive,
      lastLoginAt: this.lastLoginAt,
      roles: this.roles.map((role) => role.name),
      permissions: uniquePermissions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
