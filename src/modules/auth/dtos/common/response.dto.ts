import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiPropertyOptional({
    description: 'Token de actualización',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'Información del usuario',
    type: 'object',
    properties: {
      id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      email: { type: 'string', example: 'usuario@example.com' },
      roles: { type: 'array', items: { type: 'string' }, example: ['user'] },
      permissions: {
        type: 'array',
        items: { type: 'string' },
        example: ['users:read'],
      },
      is2FAEnabled: { type: 'boolean', example: false },
    },
  })
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    is2FAEnabled: boolean;
  };

  @ApiProperty({
    description: 'Tiempo de expiración del token en segundos',
    example: 3600,
  })
  expiresIn: number;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Mensaje de respuesta',
    example: 'Operación realizada exitosamente',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Código de estado',
    example: 'SUCCESS',
  })
  code?: string;

  @ApiPropertyOptional({
    description: 'Datos adicionales',
    example: {},
  })
  data?: any;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Mensaje de error',
    example: 'Error en la operación',
  })
  message: string;

  @ApiProperty({
    description: 'Código de error',
    example: 'VALIDATION_ERROR',
  })
  code: string;

  @ApiPropertyOptional({
    description: 'Detalles del error',
    example: [
      'El email es requerido',
      'La contraseña debe tener al menos 8 caracteres',
    ],
  })
  details?: string[];

  @ApiProperty({
    description: 'Timestamp del error',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Ruta donde ocurrió el error',
    example: '/api/v1/auth/login',
  })
  path: string;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Página actual',
    example: 1,
    minimum: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Límite por página',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de elementos',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Si hay página siguiente',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Si hay página anterior',
    example: false,
  })
  hasPrev: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Datos paginados',
    type: 'array',
  })
  data: T[];

  @ApiProperty({
    description: 'Información de paginación',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}
