import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from '../entities';
import { TokenRepositoryInterface } from 'src/common/interfaces';

@Injectable()
export class PasswordResetRepository
  implements TokenRepositoryInterface<PasswordReset, string>
{
  constructor(
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
  ) {}

  async findById(id: string): Promise<PasswordReset | null> {
    return await this.passwordResetRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<PasswordReset[]> {
    return await this.passwordResetRepository.find();
  }

  async save(entity: PasswordReset): Promise<PasswordReset> {
    return await this.passwordResetRepository.save(entity);
  }

  async update(entity: PasswordReset): Promise<PasswordReset> {
    return await this.passwordResetRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.passwordResetRepository.delete(id);
  }

  // Métodos específicos para reset de contraseña
  async findByToken(token: string): Promise<PasswordReset | null> {
    return await this.passwordResetRepository.findOne({ where: { token } });
  }

  async findByUserId(userId: string): Promise<PasswordReset[]> {
    return await this.passwordResetRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveTokens(userId: string): Promise<PasswordReset[]> {
    return await this.passwordResetRepository.find({
      where: {
        userId,
        isActive: true,
        expiresAt: new Date(), // No expirados
      },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.passwordResetRepository.update(
      { userId },
      { isActive: false, revokedAt: new Date() },
    );
  }

  async revokeByToken(token: string): Promise<void> {
    await this.passwordResetRepository.update(
      { token },
      { isActive: false, revokedAt: new Date() },
    );
  }

  async revokeById(id: string): Promise<void> {
    await this.passwordResetRepository.update(
      { id },
      { isActive: false, revokedAt: new Date() },
    );
  }

  // Métodos de validación
  async isTokenValid(token: string): Promise<boolean> {
    const passwordReset = await this.findByToken(token);
    if (!passwordReset) return false;

    return (
      passwordReset.isActive &&
      !passwordReset.isExpired() &&
      !passwordReset.isUsed()
    );
  }

  async isTokenActive(token: string): Promise<boolean> {
    const passwordReset = await this.findByToken(token);
    if (!passwordReset) return false;

    return passwordReset.isActive;
  }

  async isTokenExpired(token: string): Promise<boolean> {
    const passwordReset = await this.findByToken(token);
    if (!passwordReset) return true;

    return passwordReset.isExpired();
  }

  async isTokenUsed(token: string): Promise<boolean> {
    const passwordReset = await this.findByToken(token);
    if (!passwordReset) return true;

    return passwordReset.isUsed();
  }

  // Métodos de uso
  async markAsUsed(token: string): Promise<boolean> {
    const passwordReset = await this.findByToken(token);
    if (
      !passwordReset ||
      !passwordReset.isActive ||
      passwordReset.isExpired()
    ) {
      return false;
    }

    passwordReset.markAsUsed();
    await this.save(passwordReset);
    return true;
  }

  async markAsUsedById(id: string): Promise<boolean> {
    const passwordReset = await this.findById(id);
    if (
      !passwordReset ||
      !passwordReset.isActive ||
      passwordReset.isExpired()
    ) {
      return false;
    }

    passwordReset.markAsUsed();
    await this.save(passwordReset);
    return true;
  }

  // Métodos de limpieza
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.passwordResetRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  async cleanupUsedTokens(): Promise<number> {
    const result = await this.passwordResetRepository
      .createQueryBuilder()
      .delete()
      .where('usedAt IS NOT NULL')
      .andWhere('usedAt < :cutoffDate', {
        cutoffDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días
      })
      .execute();

    return result.affected || 0;
  }

  async cleanupOldTokens(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date(
      Date.now() - olderThanDays * 24 * 60 * 60 * 1000,
    );

    const result = await this.passwordResetRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  // Métodos de estadísticas
  async countActiveTokens(): Promise<number> {
    return await this.passwordResetRepository.count({
      where: { isActive: true },
    });
  }

  async countUserTokens(userId: string): Promise<number> {
    return await this.passwordResetRepository.count({ where: { userId } });
  }

  async countActiveUserTokens(userId: string): Promise<number> {
    return await this.passwordResetRepository.count({
      where: { userId, isActive: true },
    });
  }

  async countExpiredTokens(): Promise<number> {
    return await this.passwordResetRepository
      .createQueryBuilder('reset')
      .where('reset.expiresAt < :now', { now: new Date() })
      .getCount();
  }

  async countUsedTokens(): Promise<number> {
    return await this.passwordResetRepository
      .createQueryBuilder('reset')
      .where('reset.usedAt IS NOT NULL')
      .getCount();
  }

  // Métodos de búsqueda avanzada
  async findTokensByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<PasswordReset[]> {
    return await this.passwordResetRepository
      .createQueryBuilder('reset')
      .where('reset.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  async findTokensByIpAddress(ipAddress: string): Promise<PasswordReset[]> {
    return await this.passwordResetRepository.find({ where: { ipAddress } });
  }

  async findTokensByUserAgent(userAgent: string): Promise<PasswordReset[]> {
    return await this.passwordResetRepository.find({ where: { userAgent } });
  }

  async findTokensByEmail(email: string): Promise<PasswordReset[]> {
    return await this.passwordResetRepository.find({
      where: { email },
      order: { createdAt: 'DESC' },
    });
  }

  // Métodos de análisis de seguridad
  async findSuspiciousTokens(
    userId: string,
    ipAddress: string,
  ): Promise<PasswordReset[]> {
    return await this.passwordResetRepository
      .createQueryBuilder('reset')
      .where('reset.userId = :userId', { userId })
      .andWhere('reset.ipAddress != :ipAddress', { ipAddress })
      .andWhere('reset.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findMultipleAttempts(
    userId: string,
    hours: number = 24,
  ): Promise<PasswordReset[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await this.passwordResetRepository
      .createQueryBuilder('reset')
      .where('reset.userId = :userId', { userId })
      .andWhere('reset.createdAt > :cutoffTime', { cutoffTime })
      .orderBy('reset.createdAt', 'DESC')
      .getMany();
  }

  // Métodos de búsqueda con filtros
  async findTokensWithFilters(filters: {
    userId?: string;
    email?: string;
    isActive?: boolean;
    isUsed?: boolean;
    ipAddress?: string;
    userAgent?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PasswordReset[]> {
    const query = this.passwordResetRepository.createQueryBuilder('reset');

    if (filters.userId) {
      query.andWhere('reset.userId = :userId', { userId: filters.userId });
    }

    if (filters.email) {
      query.andWhere('reset.email = :email', { email: filters.email });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('reset.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.isUsed !== undefined) {
      if (filters.isUsed) {
        query.andWhere('reset.usedAt IS NOT NULL');
      } else {
        query.andWhere('reset.usedAt IS NULL');
      }
    }

    if (filters.ipAddress) {
      query.andWhere('reset.ipAddress = :ipAddress', {
        ipAddress: filters.ipAddress,
      });
    }

    if (filters.userAgent) {
      query.andWhere('reset.userAgent = :userAgent', {
        userAgent: filters.userAgent,
      });
    }

    if (filters.startDate) {
      query.andWhere('reset.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('reset.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    return await query.orderBy('reset.createdAt', 'DESC').getMany();
  }

  // Métodos de actualización
  async updateLastAttempt(token: string): Promise<void> {
    await this.passwordResetRepository.update(
      { token },
      { lastAttemptAt: new Date() },
    );
  }

  async updateAttempts(token: string, attempts: number): Promise<void> {
    await this.passwordResetRepository.update({ token }, { attempts });
  }

  async extendExpiration(
    token: string,
    newExpirationDate: Date,
  ): Promise<void> {
    await this.passwordResetRepository.update(
      { token },
      { expiresAt: newExpirationDate },
    );
  }

  // Métodos de validación de límites
  async canRequestReset(
    userId: string,
    maxAttempts: number = 3,
    timeWindowHours: number = 24,
  ): Promise<boolean> {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

    const count = await this.passwordResetRepository
      .createQueryBuilder('reset')
      .where('reset.userId = :userId', { userId })
      .andWhere('reset.createdAt > :cutoffTime', { cutoffTime })
      .getCount();

    return count < maxAttempts;
  }

  async getResetAttempts(
    userId: string,
    timeWindowHours: number = 24,
  ): Promise<number> {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

    return await this.passwordResetRepository
      .createQueryBuilder('reset')
      .where('reset.userId = :userId', { userId })
      .andWhere('reset.createdAt > :cutoffTime', { cutoffTime })
      .getCount();
  }

  // Métodos de búsqueda por email
  async findByEmail(email: string): Promise<PasswordReset[]> {
    return await this.passwordResetRepository.find({
      where: { email },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveTokensByEmail(email: string): Promise<PasswordReset[]> {
    return await this.passwordResetRepository.find({
      where: {
        email,
        isActive: true,
        expiresAt: new Date(),
      },
      order: { createdAt: 'DESC' },
    });
  }
}
