import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({
    description: 'ID del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del rol debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  roleId: string;

  @ApiProperty({
    description: 'ID del permiso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del permiso debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del permiso es requerido' })
  permissionId: string;
}

export class RemovePermissionDto {
  @ApiProperty({
    description: 'ID del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del rol debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  roleId: string;

  @ApiProperty({
    description: 'ID del permiso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del permiso debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del permiso es requerido' })
  permissionId: string;
}

export class AssignMultiplePermissionsDto {
  @ApiProperty({
    description: 'ID del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del rol debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  roleId: string;

  @ApiProperty({
    description: 'IDs de los permisos',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '456e7890-e89b-12d3-a456-426614174000',
    ],
    type: [String],
  })
  @IsArray({ message: 'Los permisos deben ser un array' })
  @IsString({
    each: true,
    message: 'Cada ID de permiso debe ser una cadena de texto',
  })
  permissionIds: string[];
}
