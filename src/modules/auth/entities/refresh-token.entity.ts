import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Token } from 'src/common/value-objects';

@Entity('refresh_tokens')
@Index(['token'], { unique: true })
@Index(['userId'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceName: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Métodos de dominio
  static create(
    userId: string,
    token: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
    deviceId?: string,
    deviceName?: string,
  ): RefreshToken {
    const refreshToken = new RefreshToken();
    refreshToken.userId = userId;
    refreshToken.token = token;
    refreshToken.expiresAt = expiresAt;
    refreshToken.isActive = true;
    refreshToken.verified = false;
    refreshToken.ipAddress = ipAddress as any;
    refreshToken.userAgent = userAgent as any;
    refreshToken.deviceId = deviceId;
    refreshToken.deviceName = deviceName;
    return refreshToken;
  }

  static fromData(data: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    revokedAt?: Date;
    isActive: boolean;
    verified: boolean;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    deviceName?: string;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): RefreshToken {
    const refreshToken = new RefreshToken();
    refreshToken.id = data.id;
    refreshToken.userId = data.userId;
    refreshToken.token = data.token;
    refreshToken.expiresAt = data.expiresAt;
    refreshToken.revokedAt = data.revokedAt as any;
    refreshToken.isActive = data.isActive;
    refreshToken.verified = data.verified;
    refreshToken.ipAddress = data.ipAddress as any;
    refreshToken.userAgent = data.userAgent as any;
    refreshToken.deviceId = data.deviceId;
    refreshToken.deviceName = data.deviceName;
    refreshToken.lastUsedAt = data.lastUsedAt as any;
    refreshToken.createdAt = data.createdAt;
    refreshToken.updatedAt = data.updatedAt;
    return refreshToken;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  // isActive(): boolean {
  //   return !this.isExpired() && !this.isRevoked();
  // }

  revoke(): void {
    if (this.isRevoked()) {
      return; // Already revoked, no change needed
    }

    this.revokedAt = new Date();
    this.updatedAt = new Date();
  }

  updateLastUsed(): void {
    this.lastUsedAt = new Date();
    this.updatedAt = new Date();
  }

  setDeviceInfo(deviceId: string, deviceName: string): void {
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Método para obtener el Token como Value Object
  getTokenVO(): Token {
    return Token.fromString(this.token);
  }

  // Método para verificar si el token coincide
  matches(token: string): boolean {
    return this.token === token;
  }

  // Método para obtener información de la sesión
  getSessionInfo(): {
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    expiresAt: Date;
    isActive: boolean;
  } {
    return {
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      isActive: this.isActive,
    };
  }
}
