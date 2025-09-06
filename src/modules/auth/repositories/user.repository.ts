import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { UserRepositoryInterface } from 'src/common/interfaces';

@Injectable()
export class UserRepository implements UserRepositoryInterface<User, string> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id: parseInt(id) } });
  }

  async findByAuthId(authId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { authId } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findActiveUsers(): Promise<User[]> {
    return await this.userRepository.find({ where: { isActive: true } });
  }

  async findUsersByRole(roleId: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.id = :roleId', { roleId })
      .getMany();
  }

  async save(entity: User): Promise<User> {
    return await this.userRepository.save(entity);
  }

  async update(entity: User): Promise<User> {
    return await this.userRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  // Métodos de búsqueda con relaciones
  async findByIdWithRoles(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByEmailWithRoles(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByIdWithProfile(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['profile'],
    });
  }

  // Métodos de estadísticas
  async countActiveUsers(): Promise<number> {
    return await this.userRepository.count({ where: { isActive: true } });
  }

  async countVerifiedUsers(): Promise<number> {
    return await this.userRepository.count({ where: { verified: true } });
  }

  async countUsersByRole(roleId: string): Promise<number> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'role')
      .where('role.id = :roleId', { roleId })
      .getCount();
  }

  // Métodos de búsqueda avanzada
  async findUsersByEmailPattern(pattern: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.email ILIKE :pattern', { pattern: `%${pattern}%` })
      .getMany();
  }

  async findUsersByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  async findUsersWith2FA(): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.otpEnabled = :enabled', { enabled: true })
      .getMany();
  }

  // Métodos de actualización masiva
  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async updateVerificationStatus(
    userId: string,
    verified: boolean,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      verified,
      verifyToken: verified ? null : undefined,
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }

  async update2FAStatus(
    userId: string,
    enabled: boolean,
    secret?: string,
  ): Promise<void> {
    const updateData: any = { otpEnabled: enabled };
    if (enabled && secret) {
      updateData.otpSecret = secret;
    } else if (!enabled) {
      updateData.otpSecret = null;
    }

    await this.userRepository.update(userId, updateData);
  }
}
