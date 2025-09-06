import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({
    description: 'ID del permiso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del permiso',
    example: 'users:create',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción del permiso',
    example: 'Crear usuarios',
  })
  description: string;

  @ApiProperty({
    description: 'Recurso del permiso',
    example: 'users',
  })
  resource: string;

  @ApiProperty({
    description: 'Acción del permiso',
    example: 'create',
  })
  action: string;

  @ApiProperty({
    description: 'Si el permiso está activo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación del permiso',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización del permiso',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class RoleResponseDto {
  @ApiProperty({
    description: 'ID del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'admin',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Administrador del sistema con acceso completo',
  })
  description: string;

  @ApiProperty({
    description: 'Si el rol está activo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Si el rol es por defecto',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Permisos del rol',
    type: [PermissionResponseDto],
  })
  permissions: PermissionResponseDto[];

  @ApiProperty({
    description: 'Fecha de creación del rol',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización del rol',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class RoleListResponseDto {
  @ApiProperty({
    description: 'Lista de roles',
    type: [RoleResponseDto],
  })
  roles: RoleResponseDto[];

  @ApiProperty({
    description: 'Total de roles',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Límite por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 1,
  })
  totalPages: number;
}
