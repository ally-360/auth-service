import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para creación de realm de empresa
 */
export class CreateCompanyRealmResponseDto {
  @ApiProperty({
    description: 'Nombre del realm creado',
    example: 'empresa-demo-sa',
  })
  realmName: string;

  @ApiProperty({
    description: 'ID del usuario propietario en Keycloak',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  keycloakUserId: string;

  @ApiProperty({
    description: 'Contraseña temporal generada para el propietario',
    example: 'TempPass123!',
  })
  temporaryPassword: string;

  @ApiProperty({
    description: 'URL del realm para iniciar sesión',
    example: 'http://localhost:8080/realms/empresa-demo-sa',
  })
  realmUrl: string;

  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Realm creado exitosamente con usuario propietario',
  })
  message: string;
}

/**
 * DTO de respuesta para agregar usuario a empresa
 */
export class AddUserToCompanyResponseDto {
  @ApiProperty({
    description: 'ID del usuario en Keycloak',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  keycloakUserId: string;

  @ApiProperty({
    description: 'Contraseña temporal generada',
    example: 'TempPass456!',
  })
  temporaryPassword: string;

  @ApiProperty({
    description: 'Rol asignado al usuario',
    example: 'Empleado',
  })
  assignedRole: string;

  @ApiProperty({
    description: 'Nombre del realm',
    example: 'empresa-demo-sa',
  })
  realmName: string;

  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Usuario agregado exitosamente a la empresa',
  })
  message: string;
}

/**
 * DTO de respuesta para registro en realm genérico
 */
export class RegisterInGenericRealmResponseDto {
  @ApiProperty({
    description: 'ID del usuario en Keycloak',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  keycloakUserId: string;

  @ApiProperty({
    description: 'Contraseña temporal generada',
    example: 'TempPass789!',
  })
  temporaryPassword: string;

  @ApiProperty({
    description: 'Nombre del realm genérico',
    example: 'ally',
  })
  realmName: string;

  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Usuario registrado en realm genérico exitosamente',
  })
  message: string;
}

/**
 * DTO de respuesta para login con Keycloak
 */
export class KeycloakLoginResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT de Keycloak',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyc2ExIn0...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de refresco para renovar el access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyc2ExIn0...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tiempo de expiración del token en segundos',
    example: 1800,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Tiempo de expiración del refresh token en segundos',
    example: 3600,
  })
  refreshExpiresIn: number;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Información del usuario autenticado',
  })
  userInfo: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    realmName: string;
    companyId?: string;
    roles: string[];
  };
}

/**
 * DTO de respuesta para información de usuario en Keycloak
 */
export class KeycloakUserInfoDto {
  @ApiProperty({
    description: 'ID del usuario en Keycloak',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@empresa-demo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  lastName: string;

  @ApiProperty({
    description: 'Indica si el email está verificado',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Indica si el usuario está habilitado',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({
    description: 'Realm al que pertenece el usuario',
    example: 'empresa-demo-sa',
  })
  realmName: string;

  @ApiProperty({
    description: 'ID de la empresa (si aplica)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  companyId?: string;

  @ApiProperty({
    description: 'Roles asignados al usuario',
    example: ['Admin', 'Empleado'],
  })
  roles: string[];

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdTimestamp: Date;
}

/**
 * DTO de respuesta genérica para operaciones exitosas
 */
export class KeycloakOperationResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo de la operación',
    example: 'Operación completada exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Datos adicionales de la respuesta',
    required: false,
  })
  data?: any;
}
