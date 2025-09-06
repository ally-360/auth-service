import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  userId: string;

  @ApiProperty({
    description: 'ID del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del rol debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  roleId: string;
}

export class RemoveRoleDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  userId: string;

  @ApiProperty({
    description: 'ID del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del rol debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  roleId: string;
}

export class AssignMultipleRolesDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  userId: string;

  @ApiProperty({
    description: 'IDs de los roles',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '456e7890-e89b-12d3-a456-426614174000',
    ],
    type: [String],
  })
  @IsArray({ message: 'Los roles deben ser un array' })
  @IsString({
    each: true,
    message: 'Cada ID de rol debe ser una cadena de texto',
  })
  roleIds: string[];
}
