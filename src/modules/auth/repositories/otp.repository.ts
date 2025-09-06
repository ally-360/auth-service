import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Otp } from '../entities';
import { VerificationRepositoryInterface } from 'src/common/interfaces';

@Injectable()
export class OtpRepository
  implements VerificationRepositoryInterface<Otp, string>
{
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async findById(id: string): Promise<Otp | null> {
    return await this.otpRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Otp[]> {
    return await this.otpRepository.find();
  }

  async save(entity: Otp): Promise<Otp> {
    return await this.otpRepository.save(entity);
  }

  async update(entity: Otp): Promise<Otp> {
    return await this.otpRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.otpRepository.delete(id);
  }

  // Métodos específicos para OTP
  async findByEmail(email: string): Promise<Otp | null> {
    return await this.otpRepository.findOne({
      where: { email },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCode(code: string): Promise<Otp | null> {
    return await this.otpRepository.findOne({ where: { code } });
  }

  async findActiveVerifications(email: string): Promise<Otp[]> {
    return await this.otpRepository.find({
      where: {
        email,
        isActive: true,
        verifiedAt: IsNull(), // No verificadas aún
      },
      order: { createdAt: 'DESC' },
    });
  }

  async cleanupExpired(): Promise<number> {
    const result = await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  // Métodos específicos para OTP
  async findByUserId(userId: string): Promise<Otp | null> {
    return await this.otpRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findBySecret(secret: string): Promise<Otp | null> {
    return await this.otpRepository.findOne({ where: { secret } });
  }

  async findActiveByUserId(userId: string): Promise<Otp | null> {
    return await this.otpRepository.findOne({
      where: {
        userId,
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Métodos de validación
  async isCodeValid(email: string, code: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { email, code },
    });

    if (!otp) return false;

    return otp.isActive && !otp.isExpired();
  }

  async isSecretValid(userId: string, secret: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { userId, secret },
    });

    if (!otp) return false;

    return otp.isActive && !otp.isExpired();
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        verifiedAt: new Date(), // Verificadas
      },
    });

    return !!otp;
  }

  async hasActiveVerification(email: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        isActive: true,
        verifiedAt: IsNull(),
      },
    });

    return !!otp;
  }

  async hasActiveSecret(userId: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    return !!otp;
  }

  // Métodos de verificación
  async markAsVerified(email: string, code: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { email, code },
    });

    if (!otp || !otp.isActive || otp.isExpired()) {
      return false;
    }

    otp.markAsVerified();
    await this.save(otp);
    return true;
  }

  async markAsVerifiedBySecret(
    userId: string,
    secret: string,
  ): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { userId, secret },
    });

    if (!otp || !otp.isActive || otp.isExpired()) {
      return false;
    }

    otp.markAsVerified();
    await this.save(otp);
    return true;
  }

  async markAsUsed(email: string, code: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { email, code },
    });

    if (!otp || !otp.isActive) {
      return false;
    }

    otp.markAsUsed();
    await this.save(otp);
    return true;
  }

  async markAsUsedBySecret(userId: string, secret: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { userId, secret },
    });

    if (!otp || !otp.isActive) {
      return false;
    }

    otp.markAsUsed();
    await this.save(otp);
    return true;
  }

  // Métodos de limpieza
  async cleanupOldVerifications(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date(
      Date.now() - olderThanDays * 24 * 60 * 60 * 1000,
    );

    const result = await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  async cleanupVerifiedSecrets(): Promise<number> {
    const result = await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('verifiedAt IS NOT NULL')
      .andWhere('verifiedAt < :cutoffDate', {
        cutoffDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día
      })
      .execute();

    return result.affected || 0;
  }

  async cleanupExpiredSecrets(): Promise<number> {
    const result = await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  // Métodos de estadísticas
  async countActiveVerifications(): Promise<number> {
    return await this.otpRepository.count({
      where: { isActive: true },
    });
  }

  async countVerifiedSecrets(): Promise<number> {
    return await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.verifiedAt IS NOT NULL')
      .getCount();
  }

  async countExpiredVerifications(): Promise<number> {
    return await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.expiresAt < :now', { now: new Date() })
      .getCount();
  }

  async countVerificationsByEmail(email: string): Promise<number> {
    return await this.otpRepository.count({ where: { email } });
  }

  async countSecretsByUserId(userId: string): Promise<number> {
    return await this.otpRepository.count({ where: { userId } });
  }

  // Métodos de búsqueda avanzada
  async findVerificationsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Otp[]> {
    return await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  async findVerificationsByIpAddress(ipAddress: string): Promise<Otp[]> {
    return await this.otpRepository.find({ where: { ipAddress } });
  }

  async findVerificationsByUserAgent(userAgent: string): Promise<Otp[]> {
    return await this.otpRepository.find({ where: { userAgent } });
  }

  // Métodos de análisis de seguridad
  async findSuspiciousVerifications(
    email: string,
    ipAddress: string,
  ): Promise<Otp[]> {
    return await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.email = :email', { email })
      .andWhere('otp.ipAddress != :ipAddress', { ipAddress })
      .andWhere('otp.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findMultipleAttempts(email: string, hours: number = 1): Promise<Otp[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.email = :email', { email })
      .andWhere('otp.createdAt > :cutoffTime', { cutoffTime })
      .orderBy('otp.createdAt', 'DESC')
      .getMany();
  }

  async findMultipleSecretAttempts(
    userId: string,
    hours: number = 1,
  ): Promise<Otp[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.userId = :userId', { userId })
      .andWhere('otp.createdAt > :cutoffTime', { cutoffTime })
      .orderBy('otp.createdAt', 'DESC')
      .getMany();
  }

  // Métodos de búsqueda con filtros
  async findVerificationsWithFilters(filters: {
    email?: string;
    userId?: string;
    isActive?: boolean;
    isVerified?: boolean;
    ipAddress?: string;
    userAgent?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Otp[]> {
    const query = this.otpRepository.createQueryBuilder('otp');

    if (filters.email) {
      query.andWhere('otp.email = :email', { email: filters.email });
    }

    if (filters.userId) {
      query.andWhere('otp.userId = :userId', { userId: filters.userId });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('otp.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.isVerified !== undefined) {
      if (filters.isVerified) {
        query.andWhere('otp.verifiedAt IS NOT NULL');
      } else {
        query.andWhere('otp.verifiedAt IS NULL');
      }
    }

    if (filters.ipAddress) {
      query.andWhere('otp.ipAddress = :ipAddress', {
        ipAddress: filters.ipAddress,
      });
    }

    if (filters.userAgent) {
      query.andWhere('otp.userAgent = :userAgent', {
        userAgent: filters.userAgent,
      });
    }

    if (filters.startDate) {
      query.andWhere('otp.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('otp.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return await query.orderBy('otp.createdAt', 'DESC').getMany();
  }

  // Métodos de actualización
  async updateAttempts(
    email: string,
    code: string,
    attempts: number,
  ): Promise<void> {
    await this.otpRepository.update({ email, code }, { attempts });
  }

  async updateLastAttempt(email: string, code: string): Promise<void> {
    await this.otpRepository.update(
      { email, code },
      { lastAttemptAt: new Date() },
    );
  }

  async extendExpiration(
    email: string,
    code: string,
    newExpirationDate: Date,
  ): Promise<void> {
    await this.otpRepository.update(
      { email, code },
      { expiresAt: newExpirationDate },
    );
  }

  async extendSecretExpiration(
    userId: string,
    secret: string,
    newExpirationDate: Date,
  ): Promise<void> {
    await this.otpRepository.update(
      { userId, secret },
      { expiresAt: newExpirationDate },
    );
  }

  // Métodos de validación de límites
  async canSendVerification(
    email: string,
    maxAttempts: number = 5,
    timeWindowMinutes: number = 15,
  ): Promise<boolean> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const count = await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.email = :email', { email })
      .andWhere('otp.createdAt > :cutoffTime', { cutoffTime })
      .getCount();

    return count < maxAttempts;
  }

  async canCreateSecret(
    userId: string,
    maxAttempts: number = 3,
    timeWindowHours: number = 24,
  ): Promise<boolean> {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

    const count = await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.userId = :userId', { userId })
      .andWhere('otp.createdAt > :cutoffTime', { cutoffTime })
      .getCount();

    return count < maxAttempts;
  }

  async getVerificationAttempts(
    email: string,
    timeWindowMinutes: number = 15,
  ): Promise<number> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    return await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.email = :email', { email })
      .andWhere('otp.createdAt > :cutoffTime', { cutoffTime })
      .getCount();
  }

  async getSecretAttempts(
    userId: string,
    timeWindowHours: number = 24,
  ): Promise<number> {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

    return await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.userId = :userId', { userId })
      .andWhere('otp.createdAt > :cutoffTime', { cutoffTime })
      .getCount();
  }
}
