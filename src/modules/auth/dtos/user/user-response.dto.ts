import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'ID del perfil',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Avatar del usuario',
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;

  @ApiProperty({
    description: 'Fecha de creación del perfil',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización del perfil',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class UserRoleResponseDto {
  @ApiProperty({
    description: 'ID del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'user',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Usuario regular del sistema',
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
}

export class UserResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Auth ID del usuario',
    example: 'auth_123e4567-e89b-12d3-a456-426614174000',
  })
  authId: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Si el usuario está activo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Si el usuario está verificado',
    example: true,
  })
  verified: boolean;

  @ApiProperty({
    description: 'Si el usuario tiene 2FA habilitado',
    example: false,
  })
  otpEnabled: boolean;

  @ApiPropertyOptional({
    description: 'Fecha del último login',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Perfil del usuario',
    type: UserProfileResponseDto,
  })
  profile: UserProfileResponseDto;

  @ApiProperty({
    description: 'Roles del usuario',
    type: [UserRoleResponseDto],
  })
  roles: UserRoleResponseDto[];

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización del usuario',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'Lista de usuarios',
    type: [UserResponseDto],
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Total de usuarios',
    example: 100,
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
    example: 10,
  })
  totalPages: number;
}
