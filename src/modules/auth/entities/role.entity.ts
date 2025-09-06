import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { RoleId } from 'src/common/value-objects';
import { Permission } from './permission.entity';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Métodos de dominio
  static create(
    name: string,
    description: string,
    isDefault: boolean = false,
  ): Role {
    const role = new Role();
    role.id = RoleId.create().getValue();
    role.name = name;
    role.description = description;
    role.isDefault = isDefault;
    role.isActive = true;
    role.permissions = [];
    return role;
  }

  static fromData(data: {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Role {
    const role = new Role();
    role.id = data.id;
    role.name = data.name;
    role.description = data.description;
    role.permissions = data.permissions || [];
    role.isDefault = data.isDefault;
    role.isActive = data.isActive;
    role.createdAt = data.createdAt;
    role.updatedAt = data.updatedAt;
    return role;
  }

  addPermission(permission: Permission): void {
    // Verificar si el permiso ya existe
    const permissionExists = this.permissions.some(
      (p) => p.id === permission.id,
    );
    if (permissionExists) {
      throw new Error(
        `Permission ${permission.getPermissionName()} is already assigned to role ${this.name}`,
      );
    }

    this.permissions.push(permission);
    this.updatedAt = new Date();
  }

  removePermission(permissionId: string): void {
    const permissionExists = this.permissions.some(
      (p) => p.id === permissionId,
    );
    if (!permissionExists) {
      return; // Permission not found, no change needed
    }

    this.permissions = this.permissions.filter((p) => p.id !== permissionId);
    this.updatedAt = new Date();
  }

  updateDetails(name?: string, description?: string): void {
    let hasChanges = false;

    if (name && name !== this.name) {
      this.validateName(name);
      this.name = name;
      hasChanges = true;
    }

    if (description && description !== this.description) {
      this.validateDescription(description);
      this.description = description;
      hasChanges = true;
    }

    if (hasChanges) {
      this.updatedAt = new Date();
    }
  }

  setAsDefault(): void {
    if (this.isDefault) {
      return; // Already default, no change needed
    }

    this.isDefault = true;
    this.updatedAt = new Date();
  }

  removeAsDefault(): void {
    if (!this.isDefault) {
      return; // Already not default, no change needed
    }

    this.isDefault = false;
    this.updatedAt = new Date();
  }

  activate(): void {
    if (this.isActive) {
      return; // Already active, no change needed
    }

    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    if (!this.isActive) {
      return; // Already inactive, no change needed
    }

    this.isActive = false;
    this.updatedAt = new Date();
  }

  hasPermission(permissionId: string): boolean {
    return this.permissions.some((p) => p.id === permissionId);
  }

  hasPermissionByName(permissionName: string): boolean {
    return this.permissions.some(
      (p) => p.getPermissionName() === permissionName,
    );
  }

  isAdminRole(): boolean {
    // Business rule: Admin roles are identified by admin permissions or name
    return (
      this.permissions.some((p) => p.getPermissionName().includes('admin')) ||
      this.name.toLowerCase().includes('admin') ||
      this.name.toLowerCase().includes('administrator')
    );
  }

  canBeDeleted(): boolean {
    // Business rule: Default roles cannot be deleted
    return !this.isDefault;
  }

  validateForDeletion(): void {
    if (!this.canBeDeleted()) {
      throw new Error('Default roles cannot be deleted');
    }
  }

  getPermissionNames(): string[] {
    return this.permissions.map((p) => p.getPermissionName());
  }

  // Private validation methods
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Role name cannot be empty');
    }

    if (name.length > 100) {
      throw new Error('Role name cannot exceed 100 characters');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Role description cannot be empty');
    }

    if (description.length > 500) {
      throw new Error('Role description cannot exceed 500 characters');
    }
  }
}
