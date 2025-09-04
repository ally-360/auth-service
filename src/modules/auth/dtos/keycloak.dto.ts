import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';

/**
 * DTO para crear una nueva empresa con realm en Keycloak
 */
export class CreateCompanyRealmDto {
  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Empresa Demo S.A.',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'ID de la empresa generado por el core-service',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({
    description: 'Email del usuario propietario',
    example: 'owner@empresa-demo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;

  @ApiProperty({
    description: 'Nombre del propietario',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty()
  ownerFirstName: string;

  @ApiProperty({
    description: 'Apellido del propietario',
    example: 'Pérez',
  })
  @IsString()
  @IsNotEmpty()
  ownerLastName: string;

  @ApiProperty({
    description: 'Auth ID del usuario propietario',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  @IsNotEmpty()
  ownerAuthId: string;
}

/**
 * DTO para agregar un usuario a un realm de empresa existente
 */
export class AddUserToCompanyDto {
  @ApiProperty({
    description: 'Nombre del realm de la empresa',
    example: 'empresa-demo-sa',
  })
  @IsString()
  @IsNotEmpty()
  realmName: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'empleado@empresa-demo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'María',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'González',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Auth ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsString()
  @IsNotEmpty()
  authId: string;

  @ApiProperty({
    description: 'ID de la empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({
    description: 'Rol a asignar al usuario',
    enum: ['Admin', 'Empleado', 'Contador', 'Supervisor'],
    example: 'Empleado',
  })
  @IsEnum(['Admin', 'Empleado', 'Contador', 'Supervisor'])
  @IsNotEmpty()
  roleName: 'Admin' | 'Empleado' | 'Contador' | 'Supervisor';
}

/**
 * DTO para registrar usuario en realm genérico
 */
export class RegisterInGenericRealmDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Carlos',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Rodriguez',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Auth ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsString()
  @IsNotEmpty()
  authId: string;
}

/**
 * DTO para iniciar sesión con Keycloak
 */
export class KeycloakLoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@empresa-demo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description:
      'Realm donde iniciar sesión (opcional, se detecta automáticamente)',
    example: 'empresa-demo-sa',
    required: false,
  })
  @IsString()
  @IsOptional()
  realmName?: string;
}

/**
 * DTO para verificar usuario en Keycloak
 */
export class VerifyKeycloakUserDto {
  @ApiProperty({
    description: 'Nombre del realm',
    example: 'empresa-demo-sa',
  })
  @IsString()
  @IsNotEmpty()
  realmName: string;

  @ApiProperty({
    description: 'ID del usuario en Keycloak',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsNotEmpty()
  keycloakUserId: string;
}

/**
 * DTO para cambiar contraseña en Keycloak
 */
export class ChangeKeycloakPasswordDto {
  @ApiProperty({
    description: 'Nombre del realm',
    example: 'empresa-demo-sa',
  })
  @IsString()
  @IsNotEmpty()
  realmName: string;

  @ApiProperty({
    description: 'ID del usuario en Keycloak',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsNotEmpty()
  keycloakUserId: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
