import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

/**
 * Strategy JWT integrada con Keycloak para validación de tokens
 * Valida tokens JWT emitidos por cualquier realm de Keycloak
 */
@Injectable()
export class KeycloakJwtStrategy extends PassportStrategy(
  Strategy,
  'keycloak-jwt',
) {
  private readonly _logger = new Logger(KeycloakJwtStrategy.name);

  constructor(private readonly _configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: _configService.get('oidc').jwksUri,
      }),
      audience: ['account', 'api'],
      issuer: (payload: any, done: any) => {
        // Validación dinámica del issuer basada en el realm del token
        const tokenIssuer = payload.iss;
        if (tokenIssuer && tokenIssuer.includes('/realms/')) {
          done(null, tokenIssuer);
        } else {
          done(new UnauthorizedException('Token issuer inválido'), false);
        }
      },
      algorithms: ['RS256'],
    });
  }

  /**
   * Valida el payload del JWT y extrae información del usuario
   * @param payload - Payload del JWT de Keycloak
   */
  async validate(payload: any) {
    try {
      this._logger.debug(`Validando token JWT para usuario: ${payload.email}`);

      // Extraer información del realm desde el issuer
      const realmMatch = payload.iss.match(/\/realms\/([^/]+)/);
      const realmName = realmMatch ? realmMatch[1] : null;

      if (!realmName) {
        this._logger.warn('No se pudo extraer el realm del token');
        throw new UnauthorizedException('Token realm inválido');
      }

      // Extraer roles del realm
      const realmRoles = payload.realm_access?.roles || [];

      // Extraer información de la empresa desde los custom attributes
      const companyId = payload.companyId || payload.company_id || null;
      const authId = payload.authId || payload.auth_id || payload.sub;

      // Validar que el token tenga la información mínima requerida
      if (!payload.email || !authId) {
        this._logger.warn('Token JWT no contiene información mínima requerida');
        throw new UnauthorizedException('Token JWT inválido');
      }

      const user = {
        id: payload.sub,
        authId,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        emailVerified: payload.email_verified || false,
        realmName,
        companyId,
        roles: realmRoles,
        // Información adicional del token
        tokenInfo: {
          iat: payload.iat,
          exp: payload.exp,
          aud: payload.aud,
          iss: payload.iss,
          typ: payload.typ,
        },
      };

      this._logger.debug(
        `Usuario autenticado: ${user.email} en realm: ${realmName}`,
      );
      return user;
    } catch (error) {
      this._logger.error('Error validando token JWT', error);
      throw new UnauthorizedException('Token JWT inválido');
    }
  }
}
