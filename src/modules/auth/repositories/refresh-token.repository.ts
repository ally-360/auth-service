import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities';
import { TokenRepositoryInterface } from 'src/common/interfaces';

@Injectable()
export class RefreshTokenRepository
  implements TokenRepositoryInterface<RefreshToken, string>
{
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async findById(id: string): Promise<RefreshToken | null> {
    return await this.refreshTokenRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<RefreshToken[]> {
    return await this.refreshTokenRepository.find();
  }

  async save(entity: RefreshToken): Promise<RefreshToken> {
    return await this.refreshTokenRepository.save(entity);
  }

  async update(entity: RefreshToken): Promise<RefreshToken> {
    return await this.refreshTokenRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.refreshTokenRepository.delete(id);
  }

  // Métodos específicos para refresh tokens
  async findByToken(token: string): Promise<RefreshToken | null> {
    return await this.refreshTokenRepository.findOne({ where: { token } });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return await this.refreshTokenRepository.find({ where: { userId } });
  }

  async findActiveTokens(userId: string): Promise<RefreshToken[]> {
    return await this.refreshTokenRepository.find({
      where: {
        userId,
        isActive: true,
        expiresAt: new Date(), // Tokens que no han expirado
      },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId },
      { isActive: false, revokedAt: new Date() },
    );
  }

  async revokeByToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { isActive: false, revokedAt: new Date() },
    );
  }

  async revokeById(id: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { id },
      { isActive: false, revokedAt: new Date() },
    );
  }

  // Métodos de validación
  async isTokenValid(token: string): Promise<boolean> {
    const refreshToken = await this.findByToken(token);
    if (!refreshToken) return false;

    return refreshToken.isActive && !refreshToken.isExpired();
  }

  async isTokenActive(token: string): Promise<boolean> {
    const refreshToken = await this.findByToken(token);
    if (!refreshToken) return false;

    return refreshToken.isActive;
  }

  async isTokenExpired(token: string): Promise<boolean> {
    const refreshToken = await this.findByToken(token);
    if (!refreshToken) return true;

    return refreshToken.isExpired();
  }

  // Métodos de limpieza
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  async cleanupRevokedTokens(): Promise<number> {
    const result = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('isActive = :isActive', { isActive: false })
      .andWhere('revokedAt < :cutoffDate', {
        cutoffDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días
      })
      .execute();

    return result.affected || 0;
  }

  async cleanupOldTokens(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date(
      Date.now() - olderThanDays * 24 * 60 * 60 * 1000,
    );

    const result = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  // Métodos de estadísticas
  async countActiveTokens(): Promise<number> {
    return await this.refreshTokenRepository.count({
      where: { isActive: true },
    });
  }

  async countUserTokens(userId: string): Promise<number> {
    return await this.refreshTokenRepository.count({ where: { userId } });
  }

  async countActiveUserTokens(userId: string): Promise<number> {
    return await this.refreshTokenRepository.count({
      where: { userId, isActive: true },
    });
  }

  async countExpiredTokens(): Promise<number> {
    return await this.refreshTokenRepository
      .createQueryBuilder('token')
      .where('token.expiresAt < :now', { now: new Date() })
      .getCount();
  }

  // Métodos de búsqueda avanzada
  async findTokensByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<RefreshToken[]> {
    return await this.refreshTokenRepository
      .createQueryBuilder('token')
      .where('token.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  async findTokensByIpAddress(ipAddress: string): Promise<RefreshToken[]> {
    return await this.refreshTokenRepository.find({ where: { ipAddress } });
  }

  async findTokensByUserAgent(userAgent: string): Promise<RefreshToken[]> {
    return await this.refreshTokenRepository.find({ where: { userAgent } });
  }

  async findTokensByDevice(deviceId: string): Promise<RefreshToken[]> {
    return await this.refreshTokenRepository.find({ where: { deviceId } });
  }

  // Métodos de análisis de seguridad
  async findSuspiciousTokens(
    userId: string,
    ipAddress: string,
  ): Promise<RefreshToken[]> {
    return await this.refreshTokenRepository
      .createQueryBuilder('token')
      .where('token.userId = :userId', { userId })
      .andWhere('token.ipAddress != :ipAddress', { ipAddress })
      .andWhere('token.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findTokensFromDifferentLocations(
    userId: string,
  ): Promise<RefreshToken[]> {
    return await this.refreshTokenRepository
      .createQueryBuilder('token')
      .select('DISTINCT token.ipAddress', 'ipAddress')
      .addSelect('COUNT(*)', 'count')
      .where('token.userId = :userId', { userId })
      .andWhere('token.isActive = :isActive', { isActive: true })
      .groupBy('token.ipAddress')
      .having('COUNT(*) > 1')
      .getRawMany();
  }

  // Métodos de actualización
  async updateLastUsed(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { lastUsedAt: new Date() },
    );
  }

  async updateDeviceInfo(
    token: string,
    deviceId: string,
    deviceName: string,
  ): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { deviceId, deviceName },
    );
  }

  async extendExpiration(
    token: string,
    newExpirationDate: Date,
  ): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { expiresAt: newExpirationDate },
    );
  }

  // Métodos de búsqueda con filtros
  async findTokensWithFilters(filters: {
    userId?: string;
    isActive?: boolean;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<RefreshToken[]> {
    const query = this.refreshTokenRepository.createQueryBuilder('token');

    if (filters.userId) {
      query.andWhere('token.userId = :userId', { userId: filters.userId });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('token.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.ipAddress) {
      query.andWhere('token.ipAddress = :ipAddress', {
        ipAddress: filters.ipAddress,
      });
    }

    if (filters.userAgent) {
      query.andWhere('token.userAgent = :userAgent', {
        userAgent: filters.userAgent,
      });
    }

    if (filters.deviceId) {
      query.andWhere('token.deviceId = :deviceId', {
        deviceId: filters.deviceId,
      });
    }

    if (filters.startDate) {
      query.andWhere('token.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('token.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    return await query.getMany();
  }
}
