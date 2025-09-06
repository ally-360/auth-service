import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { EmailVerification } from '../entities';
import { VerificationRepositoryInterface } from 'src/common/interfaces';

@Injectable()
export class EmailVerificationRepository
  implements VerificationRepositoryInterface<EmailVerification, string>
{
  constructor(
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
  ) {}

  async findById(id: string): Promise<EmailVerification | null> {
    return await this.emailVerificationRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<EmailVerification[]> {
    return await this.emailVerificationRepository.find();
  }

  async save(entity: EmailVerification): Promise<EmailVerification> {
    return await this.emailVerificationRepository.save(entity);
  }

  async update(entity: EmailVerification): Promise<EmailVerification> {
    return await this.emailVerificationRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.emailVerificationRepository.delete(id);
  }

  // Métodos específicos para verificación de email
  async findByEmail(email: string): Promise<EmailVerification | null> {
    return await this.emailVerificationRepository.findOne({
      where: { email },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCode(code: string): Promise<EmailVerification | null> {
    return await this.emailVerificationRepository.findOne({ where: { code } });
  }

  async findActiveVerifications(email: string): Promise<EmailVerification[]> {
    return await this.emailVerificationRepository.find({
      where: {
        email,
        isActive: true,
        verifiedAt: IsNull(), // No verificadas aún
      },
      order: { createdAt: 'DESC' },
    });
  }

  async cleanupExpired(): Promise<number> {
    const result = await this.emailVerificationRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  // Métodos de validación
  async isCodeValid(email: string, code: string): Promise<boolean> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { email, code },
    });

    if (!verification) return false;

    return verification.isActive && !verification.isExpired();
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const verification = await this.emailVerificationRepository.findOne({
      where: {
        email,
        verifiedAt: new Date(), // Verificadas
      },
    });

    return !!verification;
  }

  async hasActiveVerification(email: string): Promise<boolean> {
    const verification = await this.emailVerificationRepository.findOne({
      where: {
        email,
        verified: false,
        verifiedAt: IsNull(),
      },
    });

    return !!verification;
  }

  // Métodos de verificación
  async markAsVerified(email: string, code: string): Promise<boolean> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { email, code },
    });

    if (!verification || !verification.isActive || verification.isExpired()) {
      return false;
    }

    verification.markAsVerified();
    await this.save(verification);
    return true;
  }

  async markAsUsed(email: string, code: string): Promise<boolean> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { email, code },
    });

    if (!verification || !verification.isActive) {
      return false;
    }

    verification.markAsVerified();
    await this.save(verification);
    return true;
  }

  // Métodos de limpieza
  async cleanupOldVerifications(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date(
      Date.now() - olderThanDays * 24 * 60 * 60 * 1000,
    );

    const result = await this.emailVerificationRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  async cleanupVerifiedVerifications(): Promise<number> {
    const result = await this.emailVerificationRepository
      .createQueryBuilder()
      .delete()
      .where('verifiedAt IS NOT NULL')
      .andWhere('verifiedAt < :cutoffDate', {
        cutoffDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día
      })
      .execute();

    return result.affected || 0;
  }

  // Métodos de estadísticas
  async countActiveVerifications(): Promise<number> {
    return await this.emailVerificationRepository.count({
      where: { verified: false },
    });
  }

  async countVerifiedEmails(): Promise<number> {
    return await this.emailVerificationRepository
      .createQueryBuilder('verification')
      .where('verification.verifiedAt IS NOT NULL')
      .getCount();
  }

  async countExpiredVerifications(): Promise<number> {
    return await this.emailVerificationRepository
      .createQueryBuilder('verification')
      .where('verification.expiresAt < :now', { now: new Date() })
      .getCount();
  }

  async countVerificationsByEmail(email: string): Promise<number> {
    return await this.emailVerificationRepository.count({ where: { email } });
  }

  // Métodos de búsqueda avanzada
  async findVerificationsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<EmailVerification[]> {
    return await this.emailVerificationRepository
      .createQueryBuilder('verification')
      .where('verification.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  async findVerificationsByIpAddress(
    ipAddress: string,
  ): Promise<EmailVerification[]> {
    return await this.emailVerificationRepository.find({
      where: { ipAddress },
    });
  }

  async findVerificationsByUserAgent(
    userAgent: string,
  ): Promise<EmailVerification[]> {
    return await this.emailVerificationRepository.find({
      where: { userAgent },
    });
  }

  // Métodos de análisis de seguridad
  async findSuspiciousVerifications(
    email: string,
    ipAddress: string,
  ): Promise<EmailVerification[]> {
    return await this.emailVerificationRepository
      .createQueryBuilder('verification')
      .where('verification.email = :email', { email })
      .andWhere('verification.ipAddress != :ipAddress', { ipAddress })
      .andWhere('verification.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findMultipleAttempts(
    email: string,
    hours: number = 1,
  ): Promise<EmailVerification[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await this.emailVerificationRepository
      .createQueryBuilder('verification')
      .where('verification.email = :email', { email })
      .andWhere('verification.createdAt > :cutoffTime', { cutoffTime })
      .orderBy('verification.createdAt', 'DESC')
      .getMany();
  }

  // Métodos de búsqueda con filtros
  async findVerificationsWithFilters(filters: {
    email?: string;
    isActive?: boolean;
    isVerified?: boolean;
    ipAddress?: string;
    userAgent?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<EmailVerification[]> {
    const query =
      this.emailVerificationRepository.createQueryBuilder('verification');

    if (filters.email) {
      query.andWhere('verification.email = :email', { email: filters.email });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('verification.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.isVerified !== undefined) {
      if (filters.isVerified) {
        query.andWhere('verification.verifiedAt IS NOT NULL');
      } else {
        query.andWhere('verification.verifiedAt IS NULL');
      }
    }

    if (filters.ipAddress) {
      query.andWhere('verification.ipAddress = :ipAddress', {
        ipAddress: filters.ipAddress,
      });
    }

    if (filters.userAgent) {
      query.andWhere('verification.userAgent = :userAgent', {
        userAgent: filters.userAgent,
      });
    }

    if (filters.startDate) {
      query.andWhere('verification.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('verification.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    return await query.orderBy('verification.createdAt', 'DESC').getMany();
  }

  // Métodos de actualización
  async updateAttempts(
    email: string,
    code: string,
    attempts: number,
  ): Promise<void> {
    await this.emailVerificationRepository.update(
      { email, code },
      { attempts },
    );
  }

  async updateLastAttempt(email: string, code: string): Promise<void> {
    await this.emailVerificationRepository.update(
      { email, code },
      { lastAttemptAt: new Date() },
    );
  }

  async extendExpiration(
    email: string,
    code: string,
    newExpirationDate: Date,
  ): Promise<void> {
    await this.emailVerificationRepository.update(
      { email, code },
      { expiresAt: newExpirationDate },
    );
  }

  // Métodos de validación de límites
  async canSendVerification(
    email: string,
    maxAttempts: number = 3,
    timeWindowMinutes: number = 60,
  ): Promise<boolean> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const count = await this.emailVerificationRepository
      .createQueryBuilder('verification')
      .where('verification.email = :email', { email })
      .andWhere('verification.createdAt > :cutoffTime', { cutoffTime })
      .getCount();

    return count < maxAttempts;
  }

  async getVerificationAttempts(
    email: string,
    timeWindowMinutes: number = 60,
  ): Promise<number> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    return await this.emailVerificationRepository
      .createQueryBuilder('verification')
      .where('verification.email = :email', { email })
      .andWhere('verification.createdAt > :cutoffTime', { cutoffTime })
      .getCount();
  }
}
