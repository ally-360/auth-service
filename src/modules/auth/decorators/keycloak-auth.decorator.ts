import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { KeycloakAuthGuard } from '../guards/keycloak-auth.guard';
import { RoleProtected } from './role-protected.decorator';
import { ValidRoles } from '../../../common/constants/app/valid-roles.app';

/**
 * Decorador combinado para autenticación con Keycloak y autorización por roles
 * Utiliza tokens JWT de Keycloak para validación multi-tenant
 */
export function KeycloakAuth(...roles: ValidRoles[]) {
  return applyDecorators(
    ApiBearerAuth(),
    RoleProtected(...roles),
    UseGuards(KeycloakAuthGuard),
  );
}
