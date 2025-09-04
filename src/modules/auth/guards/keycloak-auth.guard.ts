import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para autenticación con tokens JWT de Keycloak
 * Utiliza la estrategia keycloak-jwt para validar tokens multi-tenant
 */
@Injectable()
export class KeycloakAuthGuard extends AuthGuard('keycloak-jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token JWT de Keycloak inválido');
    }
    return user;
  }
}
