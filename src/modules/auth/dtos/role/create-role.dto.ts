import {
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre del rol',
    example: 'admin',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Administrador del sistema con acceso completo',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Si el rol es por defecto',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Si el rol está activo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'IDs de permisos del rol',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '456e7890-e89b-12d3-a456-426614174000',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los permisos deben ser un array' })
  @IsString({
    each: true,
    message: 'Cada ID de permiso debe ser una cadena de texto',
  })
  permissionIds?: string[];
}
