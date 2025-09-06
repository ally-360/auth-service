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

@Entity('otps')
@Index(['userId'])
@Index(['expiresAt'])
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  secret: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'timestamp', nullable: true })
  lastAttemptAt: Date;

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
    secret: string,
    code?: string,
    email?: string,
    expirationMinutes: number = 5,
  ): Otp {
    const otp = new Otp();
    otp.userId = userId;
    otp.secret = secret;
    otp.code = code;
    otp.email = email;
    otp.expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    otp.verified = false;
    otp.isActive = true;
    otp.attempts = 0;
    return otp;
  }

  static fromData(data: {
    id: string;
    userId: string;
    secret: string;
    code?: string;
    email?: string;
    expiresAt: Date;
    verified: boolean;
    verifiedAt?: Date;
    isActive: boolean;
    attempts: number;
    ipAddress?: string;
    userAgent?: string;
    lastAttemptAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): Otp {
    const otp = new Otp();
    otp.id = data.id;
    otp.userId = data.userId;
    otp.secret = data.secret;
    otp.code = data.code;
    otp.email = data.email;
    otp.expiresAt = data.expiresAt;
    otp.verified = data.verified;
    otp.verifiedAt = data.verifiedAt as any;
    otp.isActive = data.isActive;
    otp.attempts = data.attempts;
    otp.ipAddress = data.ipAddress as string;
    otp.userAgent = data.userAgent as string;
    otp.lastAttemptAt = data.lastAttemptAt as any;
    otp.createdAt = data.createdAt;
    otp.updatedAt = data.updatedAt;
    return otp;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isVerified(): boolean {
    return this.verified;
  }

  isActive(): boolean {
    return !this.isExpired() && !this.isVerified();
  }

  markAsVerified(): void {
    if (this.isVerified()) {
      return; // Already verified, no change needed
    }

    this.verified = true;
    this.verifiedAt = new Date();
    this.updatedAt = new Date();
  }

  markAsUsed(): void {
    this.markAsVerified();
  }

  incrementAttempts(): void {
    this.attempts += 1;
    this.lastAttemptAt = new Date();
    this.updatedAt = new Date();
  }

  setIpAddress(ipAddress: string): void {
    this.ipAddress = ipAddress;
    this.updatedAt = new Date();
  }

  setUserAgent(userAgent: string): void {
    this.userAgent = userAgent;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Método para verificar si el OTP es válido para uso
  canBeUsed(): boolean {
    return this.isActive();
  }

  // Método para obtener información del OTP
  getInfo(): {
    userId: string;
    expiresAt: Date;
    verified: boolean;
    verifiedAt?: Date;
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
      expiresAt: this.expiresAt,
      verified: this.verified,
      verifiedAt: this.verifiedAt,
      isActive: this.isActive(),
      timeRemaining,
    };
  }
}
