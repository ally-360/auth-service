import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities';
import { Repository as BaseRepository } from 'src/common/interfaces';

@Injectable()
export class PermissionRepository
  implements BaseRepository<Permission, string>
{
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findById(id: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async save(entity: Permission): Promise<Permission> {
    return await this.permissionRepository.save(entity);
  }

  async update(entity: Permission): Promise<Permission> {
    return await this.permissionRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.permissionRepository.delete(id);
  }

  // Métodos específicos para permisos
  async findByName(name: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ where: { name } });
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { resource },
    });
  }

  async findByAction(action: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { action },
    });
  }

  async findByResourceAndAction(
    resource: string,
    action: string,
  ): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { resource, action },
    });
  }

  async findActivePermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find({ where: { isActive: true } });
  }

  async findByIdWithRoles(id: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async findByNameWithRoles(name: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { name },
      relations: ['roles'],
    });
  }

  async findPermissionsByRole(roleId: string): Promise<Permission[]> {
    return await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.roles', 'role')
      .where('role.id = :roleId', { roleId })
      .getMany();
  }

  // Métodos de estadísticas
  async countPermissions(): Promise<number> {
    return await this.permissionRepository.count();
  }

  async countActivePermissions(): Promise<number> {
    return await this.permissionRepository.count({ where: { isActive: true } });
  }

  async countByResource(resource: string): Promise<number> {
    return await this.permissionRepository.count({ where: { resource } });
  }

  async countByAction(action: string): Promise<number> {
    return await this.permissionRepository.count({ where: { action } });
  }

  // Métodos de búsqueda avanzada
  async findPermissionsByPattern(pattern: string): Promise<Permission[]> {
    return await this.permissionRepository
      .createQueryBuilder('permission')
      .where(
        'permission.name ILIKE :pattern OR permission.description ILIKE :pattern OR permission.resource ILIKE :pattern OR permission.action ILIKE :pattern',
        { pattern: `%${pattern}%` },
      )
      .getMany();
  }

  async findPermissionsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Permission[]> {
    return await this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  async findPermissionsByResourcePattern(
    resourcePattern: string,
  ): Promise<Permission[]> {
    return await this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.resource ILIKE :pattern', {
        pattern: `%${resourcePattern}%`,
      })
      .getMany();
  }

  async findPermissionsByActionPattern(
    actionPattern: string,
  ): Promise<Permission[]> {
    return await this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.action ILIKE :pattern', {
        pattern: `%${actionPattern}%`,
      })
      .getMany();
  }

  // Métodos de actualización
  async updateName(id: string, name: string): Promise<void> {
    await this.permissionRepository.update(id, { name });
  }

  async updateDescription(id: string, description: string): Promise<void> {
    await this.permissionRepository.update(id, { description });
  }

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    await this.permissionRepository.update(id, { isActive });
  }

  async updateResourceAndAction(
    id: string,
    resource: string,
    action: string,
  ): Promise<void> {
    await this.permissionRepository.update(id, { resource, action });
  }

  // Métodos de validación
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const query = this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.name = :name', { name });

    if (excludeId) {
      query.andWhere('permission.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async existsByResourceAndAction(
    resource: string,
    action: string,
    excludeId?: string,
  ): Promise<boolean> {
    const query = this.permissionRepository
      .createQueryBuilder('permission')
      .where(
        'permission.resource = :resource AND permission.action = :action',
        {
          resource,
          action,
        },
      );

    if (excludeId) {
      query.andWhere('permission.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async canDelete(id: string): Promise<boolean> {
    // Verificar si el permiso tiene roles asignados
    const roleCount = await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoin('permission.roles', 'role')
      .where('permission.id = :id', { id })
      .getCount();

    return roleCount === 0;
  }

  // Métodos de búsqueda con filtros
  async findPermissionsWithFilters(filters: {
    isActive?: boolean;
    resource?: string;
    action?: string;
    hasRole?: string;
    search?: string;
  }): Promise<Permission[]> {
    const query = this.permissionRepository.createQueryBuilder('permission');

    if (filters.isActive !== undefined) {
      query.andWhere('permission.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.resource) {
      query.andWhere('permission.resource = :resource', {
        resource: filters.resource,
      });
    }

    if (filters.action) {
      query.andWhere('permission.action = :action', { action: filters.action });
    }

    if (filters.hasRole) {
      query
        .leftJoinAndSelect('permission.roles', 'role')
        .andWhere('role.id = :roleId', { roleId: filters.hasRole });
    }

    if (filters.search) {
      query.andWhere(
        '(permission.name ILIKE :search OR permission.description ILIKE :search OR permission.resource ILIKE :search OR permission.action ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return await query.getMany();
  }

  // Métodos de recursos únicos
  async getUniqueResources(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.resource', 'resource')
      .getRawMany();

    return result.map((item) => item.resource);
  }

  async getUniqueActions(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.action', 'action')
      .getRawMany();

    return result.map((item) => item.action);
  }

  // Métodos de asignación de roles
  async addRole(permissionId: string, roleId: string): Promise<void> {
    await this.permissionRepository
      .createQueryBuilder()
      .relation(Permission, 'roles')
      .of(permissionId)
      .add(roleId);
  }

  async removeRole(permissionId: string, roleId: string): Promise<void> {
    await this.permissionRepository
      .createQueryBuilder()
      .relation(Permission, 'roles')
      .of(permissionId)
      .remove(roleId);
  }

  async setRoles(permissionId: string, roleIds: string[]): Promise<void> {
    const permission = await this.findByIdWithRoles(permissionId);
    if (permission) {
      permission.roles = roleIds.map((id) => ({ id }) as any);
      await this.save(permission);
    }
  }
}
