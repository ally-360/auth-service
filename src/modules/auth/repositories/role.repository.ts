import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities';
import { Repository as BaseRepository } from 'src/common/interfaces';

@Injectable()
export class RoleRepository implements BaseRepository<Role, string> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findById(id: string): Promise<Role | null> {
    return await this.roleRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  async save(entity: Role): Promise<Role> {
    return await this.roleRepository.save(entity);
  }

  async update(entity: Role): Promise<Role> {
    return await this.roleRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }

  // Métodos específicos para roles
  async findByName(name: string): Promise<Role | null> {
    return await this.roleRepository.findOne({ where: { name } });
  }

  async findDefaultRoles(): Promise<Role[]> {
    return await this.roleRepository.find({ where: { isDefault: true } });
  }

  async findActiveRoles(): Promise<Role[]> {
    return await this.roleRepository.find({ where: { isActive: true } });
  }

  async findByIdWithPermissions(id: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findByNameWithPermissions(name: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async findRolesByPermission(permissionId: string): Promise<Role[]> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('permission.id = :permissionId', { permissionId })
      .getMany();
  }

  async findRolesByPermissionName(permissionName: string): Promise<Role[]> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('permission.name = :permissionName', { permissionName })
      .getMany();
  }

  // Métodos de estadísticas
  async countRoles(): Promise<number> {
    return await this.roleRepository.count();
  }

  async countActiveRoles(): Promise<number> {
    return await this.roleRepository.count({ where: { isActive: true } });
  }

  async countDefaultRoles(): Promise<number> {
    return await this.roleRepository.count({ where: { isDefault: true } });
  }

  // Métodos de búsqueda avanzada
  async findRolesByPattern(pattern: string): Promise<Role[]> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .where('role.name ILIKE :pattern OR role.description ILIKE :pattern', {
        pattern: `%${pattern}%`,
      })
      .getMany();
  }

  async findRolesByDateRange(startDate: Date, endDate: Date): Promise<Role[]> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .where('role.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  // Métodos de actualización
  async updateName(id: string, name: string): Promise<void> {
    await this.roleRepository.update(id, { name });
  }

  async updateDescription(id: string, description: string): Promise<void> {
    await this.roleRepository.update(id, { description });
  }

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    await this.roleRepository.update(id, { isActive });
  }

  async updateDefaultStatus(id: string, isDefault: boolean): Promise<void> {
    await this.roleRepository.update(id, { isDefault });
  }

  // Métodos de validación
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const query = this.roleRepository
      .createQueryBuilder('role')
      .where('role.name = :name', { name });

    if (excludeId) {
      query.andWhere('role.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async canDelete(id: string): Promise<boolean> {
    // Verificar si el rol tiene usuarios asignados
    const userCount = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoin('role.users', 'user')
      .where('role.id = :id', { id })
      .getCount();

    return userCount === 0;
  }

  // Métodos de asignación de permisos
  async addPermission(roleId: string, permissionId: string): Promise<void> {
    await this.roleRepository
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of(roleId)
      .add(permissionId);
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await this.roleRepository
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of(roleId)
      .remove(permissionId);
  }

  async setPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const role = await this.findByIdWithPermissions(roleId);
    if (role) {
      role.permissions = permissionIds.map((id) => ({ id }) as any);
      await this.save(role);
    }
  }

  // Métodos de búsqueda con filtros
  async findRolesWithFilters(filters: {
    isActive?: boolean;
    isDefault?: boolean;
    hasPermission?: string;
    search?: string;
  }): Promise<Role[]> {
    const query = this.roleRepository.createQueryBuilder('role');

    if (filters.isActive !== undefined) {
      query.andWhere('role.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.isDefault !== undefined) {
      query.andWhere('role.isDefault = :isDefault', {
        isDefault: filters.isDefault,
      });
    }

    if (filters.hasPermission) {
      query
        .leftJoinAndSelect('role.permissions', 'permission')
        .andWhere('permission.id = :permissionId', {
          permissionId: filters.hasPermission,
        });
    }

    if (filters.search) {
      query.andWhere(
        '(role.name ILIKE :search OR role.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return await query.getMany();
  }
}
