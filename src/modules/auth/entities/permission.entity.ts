import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  PermissionId,
  ResourceAction,
  PermissionName,
} from 'src/common/value-objects';

@Entity('permissions')
@Index(['name'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  resource: string;

  @Column({ type: 'varchar', length: 20 })
  action: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Métodos de dominio
  static create(
    resourceAction: ResourceAction,
    description: string,
  ): Permission {
    const permission = new Permission();
    permission.id = PermissionId.create().getValue();
    permission.name = PermissionName.create(
      resourceAction.getResource(),
      resourceAction.getAction().toString(),
    ).getValue();
    permission.description = description;
    permission.resource = resourceAction.getResource();
    permission.action = resourceAction.getAction().toString();
    permission.isActive = true;
    return permission;
  }

  static fromData(data: {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Permission {
    const permission = new Permission();
    permission.id = data.id;
    permission.name = data.name;
    permission.description = data.description;
    permission.resource = data.resource;
    permission.action = data.action;
    permission.isActive = data.isActive;
    permission.createdAt = data.createdAt;
    permission.updatedAt = data.updatedAt;
    return permission;
  }

  updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim().length === 0) {
      throw new Error('Permission description cannot be empty');
    }

    if (newDescription.length > 500) {
      throw new Error('Permission description cannot exceed 500 characters');
    }

    if (this.description === newDescription) {
      return; // No change needed
    }

    this.description = newDescription;
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

  getResource(): string {
    return this.resource;
  }

  getAction(): string {
    return this.action;
  }

  getPermissionName(): string {
    return this.name;
  }

  getStringName(): string {
    return this.name;
  }

  allowsAction(resource: string, action: string): boolean {
    return this.resource === resource && this.action === action;
  }

  // Método para obtener el ResourceAction como Value Object
  getResourceAction(): ResourceAction {
    return ResourceAction.create(this.resource, this.action as any);
  }

  // Método para obtener el PermissionName como Value Object
  getPermissionNameVO(): PermissionName {
    return PermissionName.create(this.resource, this.action);
  }
}
