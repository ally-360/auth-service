import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para extraer información del usuario autenticado con Keycloak
 * Extrae información del usuario validado por KeycloakJwtStrategy
 */
export const GetKeycloakUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // Si se especifica un campo específico, retornarlo
    if (data) {
      return user[data];
    }

    // Retornar todo el objeto usuario
    return user;
  },
);
