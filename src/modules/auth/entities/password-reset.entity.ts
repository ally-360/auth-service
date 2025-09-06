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
import { Email, Token } from 'src/common/value-objects';

@Entity('password_resets')
@Index(['token'], { unique: true })
@Index(['userId'])
@Index(['email'])
@Index(['expiresAt'])
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  token: string;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'revoked_at',
    default: null,
  })
  revokedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'revoked_at',
    default: null,
  })
  lastAttemptAt: Date;

  // Métodos de dominio
  static create(
    userId: string,
    email: string,
    token: string,
    expirationMinutes: number = 60,
    ipAddress?: string,
    userAgent?: string,
  ): PasswordReset {
    const passwordReset = new PasswordReset();
    passwordReset.userId = userId;
    passwordReset.email = email;
    passwordReset.token = token;
    passwordReset.expiresAt = new Date(
      Date.now() + expirationMinutes * 60 * 1000,
    );
    passwordReset.used = false;
    passwordReset.isActive = true;
    passwordReset.verified = false;
    passwordReset.ipAddress = ipAddress as any;
    passwordReset.userAgent = userAgent as any;
    return passwordReset;
  }

  static fromData(data: {
    id: string;
    userId: string;
    email: string;
    token: string;
    expiresAt: Date;
    used: boolean;
    usedAt?: Date;
    isActive: boolean;
    verified: boolean;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
  }): PasswordReset {
    const passwordReset = new PasswordReset();
    passwordReset.id = data.id;
    passwordReset.userId = data.userId;
    passwordReset.email = data.email;
    passwordReset.token = data.token;
    passwordReset.expiresAt = data.expiresAt;
    passwordReset.used = data.used;
    passwordReset.usedAt = data.usedAt as any;
    passwordReset.isActive = data.isActive;
    passwordReset.verified = data.verified;
    passwordReset.ipAddress = data.ipAddress as any;
    passwordReset.userAgent = data.userAgent as any;
    passwordReset.createdAt = data.createdAt;
    passwordReset.updatedAt = data.updatedAt;
    return passwordReset;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isUsed(): boolean {
    return this.used;
  }

  // isActive(): boolean {
  //   return !this.isExpired() && !this.isUsed();
  // }

  markAsUsed(): void {
    if (this.isUsed()) {
      return; // Already used, no change needed
    }

    this.used = true;
    this.usedAt = new Date();
    this.updatedAt = new Date();
  }

  // Método para verificar si el token coincide
  matches(token: string): boolean {
    return this.token === token;
  }

  // Método para obtener el Email como Value Object
  getEmailVO(): Email {
    return Email.fromString(this.email);
  }

  // Método para obtener el Token como Value Object
  getTokenVO(): Token {
    return Token.fromString(this.token);
  }

  // Método para obtener información del reset
  getInfo(): {
    userId: string;
    email: string;
    expiresAt: Date;
    used: boolean;
    usedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    isActive: boolean;
    timeRemaining: number; // en segundos
  } {
    const now = new Date();
    const timeRemaining = Math.max(
      0,
      Math.floor((this.expiresAt.getTime() - now.getTime()) / 1000),
    );

    return {
      userId: this.userId,
      email: this.email,
      expiresAt: this.expiresAt,
      used: this.used,
      usedAt: this.usedAt,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      isActive: this.isActive,
      timeRemaining,
    };
  }
}
