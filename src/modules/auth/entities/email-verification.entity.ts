import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Email, VerificationCode } from 'src/common/value-objects';

@Entity('email_verifications')
@Index(['email'], { unique: true })
@Index(['code'])
@Index(['expiresAt'])
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 10 })
  code: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'int', default: 3 })
  maxAttempts: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

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

  // Métodos de dominio
  static create(
    email: string,
    code: string,
    expirationMinutes: number = 5,
    ipAddress?: string,
    userAgent?: string,
  ): EmailVerification {
    const emailVerification = new EmailVerification();
    emailVerification.email = email;
    emailVerification.code = code;
    emailVerification.expiresAt = new Date(
      Date.now() + expirationMinutes * 60 * 1000,
    );
    emailVerification.verified = false;
    emailVerification.attempts = 0;
    emailVerification.maxAttempts = 3;
    emailVerification.isActive = true;
    emailVerification.ipAddress = ipAddress || '';
    emailVerification.userAgent = userAgent || '';
    return emailVerification;
  }

  static fromData(data: {
    id: string;
    email: string;
    code: string;
    expiresAt: Date;
    verified: boolean;
    verifiedAt?: Date;
    attempts: number;
    maxAttempts: number;
    isActive: boolean;
    ipAddress?: string;
    userAgent?: string;
    lastAttemptAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): EmailVerification {
    const emailVerification = new EmailVerification();
    emailVerification.id = data.id;
    emailVerification.email = data.email;
    emailVerification.code = data.code;
    emailVerification.expiresAt = data.expiresAt;
    emailVerification.verified = data.verified;
    emailVerification.verifiedAt = data.verifiedAt as any;
    emailVerification.attempts = data.attempts;
    emailVerification.maxAttempts = data.maxAttempts;
    emailVerification.isActive = data.isActive;
    emailVerification.ipAddress = data.ipAddress || '';
    emailVerification.userAgent = data.userAgent || '';
    emailVerification.lastAttemptAt = data.lastAttemptAt as any;
    emailVerification.createdAt = data.createdAt;
    emailVerification.updatedAt = data.updatedAt;
    return emailVerification;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isVerified(): boolean {
    return this.verified;
  }

  // isActive(): boolean {
  //   return (
  //     !this.isExpired() &&
  //     !this.isVerified() &&
  //     this.attempts < this.maxAttempts
  //   );
  // }

  isBlocked(): boolean {
    return this.attempts >= this.maxAttempts;
  }

  markAsVerified(): void {
    if (this.isVerified()) {
      return; // Already verified, no change needed
    }

    this.verified = true;
    this.verifiedAt = new Date();
    this.updatedAt = new Date();
  }

  incrementAttempts(): void {
    this.attempts += 1;
    this.lastAttemptAt = new Date();
    this.updatedAt = new Date();
  }

  resetAttempts(): void {
    this.attempts = 0;
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

  verifyCode(code: string): boolean {
    if (!this.isActive) {
      return false;
    }

    if (this.code === code) {
      this.markAsVerified();
      return true;
    } else {
      this.incrementAttempts();
      return false;
    }
  }

  // Método para obtener el Email como Value Object
  getEmailVO(): Email {
    return Email.fromString(this.email);
  }

  // Método para obtener el VerificationCode como Value Object
  getCodeVO(): VerificationCode {
    return VerificationCode.fromString(this.code);
  }

  // Método para obtener información de la verificación
  getInfo(): {
    email: string;
    expiresAt: Date;
    verified: boolean;
    verifiedAt?: Date;
    attempts: number;
    maxAttempts: number;
    isActive: boolean;
    isBlocked: boolean;
    timeRemaining: number; // en segundos
  } {
    const now = new Date();
    const timeRemaining = Math.max(
      0,
      Math.floor((this.expiresAt.getTime() - now.getTime()) / 1000),
    );

    return {
      email: this.email,
      expiresAt: this.expiresAt,
      verified: this.verified,
      verifiedAt: this.verifiedAt,
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      isActive: this.isActive,
      isBlocked: this.isBlocked(),
      timeRemaining,
    };
  }
}
