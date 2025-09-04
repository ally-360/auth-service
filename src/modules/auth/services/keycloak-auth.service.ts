import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { KeycloakLoginDto } from '../dtos/keycloak.dto';
import { KeycloakLoginResponseDto } from '../dtos/keycloak-response.dto';

/**
 * Servicio para autenticación OIDC con Keycloak
 * Maneja el flujo de autenticación y obtención de tokens JWT
 */
@Injectable()
export class KeycloakAuthService {
  private readonly _logger = new Logger(KeycloakAuthService.name);
  private readonly keycloakBaseUrl: string;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _jwtService: JwtService,
  ) {
    const issuer = this._configService.get('oidc').issuer;
    this.keycloakBaseUrl = issuer.replace('/realms/master', '');
  }

  /**
   * Autentica un usuario con Keycloak usando el flujo Resource Owner Password Credentials
   * @param loginDto - Credenciales de login
   */
  async authenticateWithKeycloak(
    loginDto: KeycloakLoginDto,
  ): Promise<KeycloakLoginResponseDto> {
    this._logger.log(`Iniciando autenticación para usuario: ${loginDto.email}`);

    // Si no se especifica realm, intentar encontrarlo
    let realmName = loginDto.realmName;
    if (!realmName) {
      realmName = await this.findUserRealm(loginDto.email);
    }

    try {
      const tokenUrl = `${this.keycloakBaseUrl}/realms/${realmName}/protocol/openid-connect/token`;

      const params = new URLSearchParams({
        grant_type: 'password',
        client_id: `${realmName}-web`, // Cliente web del realm específico
        username: loginDto.email,
        password: loginDto.password,
        scope: 'openid profile email',
      });

      this._logger.debug(`Solicitando token a: ${tokenUrl}`);

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const tokenData = response.data;

      // Decodificar el token para obtener información del usuario
      const decodedToken = this._jwtService.decode(tokenData.access_token);

      if (!decodedToken) {
        throw new UnauthorizedException('Token JWT inválido');
      }

      const userInfo = {
        id: decodedToken.sub,
        email: decodedToken.email,
        firstName: decodedToken.given_name,
        lastName: decodedToken.family_name,
        realmName,
        companyId: decodedToken.companyId || decodedToken.company_id,
        roles: decodedToken.realm_access?.roles || [],
      };

      this._logger.log(
        `Usuario autenticado exitosamente: ${loginDto.email} en realm: ${realmName}`,
      );

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        refreshExpiresIn: tokenData.refresh_expires_in,
        tokenType: tokenData.token_type || 'Bearer',
        userInfo,
      };
    } catch (error) {
      this._logger.error(`Error autenticando usuario ${loginDto.email}`, error);

      if (error.response?.status === 401) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      if (error.response?.status === 400) {
        throw new BadRequestException('Solicitud de autenticación inválida');
      }

      throw new UnauthorizedException('Error durante la autenticación');
    }
  }

  /**
   * Refresca un token de acceso usando el refresh token
   * @param refreshToken - Token de refresco
   * @param realmName - Nombre del realm
   */
  async refreshAccessToken(
    refreshToken: string,
    realmName: string,
  ): Promise<any> {
    try {
      const tokenUrl = `${this.keycloakBaseUrl}/realms/${realmName}/protocol/openid-connect/token`;

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: `${realmName}-web`,
        refresh_token: refreshToken,
      });

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this._logger.log(
        `Token refrescado exitosamente para realm: ${realmName}`,
      );
      return response.data;
    } catch (error) {
      this._logger.error(
        `Error refrescando token para realm ${realmName}`,
        error,
      );
      throw new UnauthorizedException('Error refrescando token');
    }
  }

  /**
   * Cierra la sesión del usuario en Keycloak
   * @param refreshToken - Token de refresco
   * @param realmName - Nombre del realm
   */
  async logout(refreshToken: string, realmName: string): Promise<void> {
    try {
      const logoutUrl = `${this.keycloakBaseUrl}/realms/${realmName}/protocol/openid-connect/logout`;

      const params = new URLSearchParams({
        client_id: `${realmName}-web`,
        refresh_token: refreshToken,
      });

      await axios.post(logoutUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this._logger.log(`Sesión cerrada exitosamente para realm: ${realmName}`);
    } catch (error) {
      this._logger.error(
        `Error cerrando sesión para realm ${realmName}`,
        error,
      );
      throw new BadRequestException('Error cerrando sesión');
    }
  }

  /**
   * Obtiene información del usuario desde un token JWT
   * @param accessToken - Token de acceso JWT
   */
  async getUserInfoFromToken(accessToken: string): Promise<any> {
    try {
      const decodedToken = this._jwtService.decode(accessToken);

      if (!decodedToken) {
        throw new UnauthorizedException('Token JWT inválido');
      }

      // Extraer realm del issuer
      const realmMatch = decodedToken.iss.match(/\/realms\/([^/]+)/);
      const realmName = realmMatch ? realmMatch[1] : null;

      return {
        id: decodedToken.sub,
        email: decodedToken.email,
        firstName: decodedToken.given_name,
        lastName: decodedToken.family_name,
        emailVerified: decodedToken.email_verified,
        realmName,
        companyId: decodedToken.companyId || decodedToken.company_id,
        roles: decodedToken.realm_access?.roles || [],
        tokenInfo: {
          iat: decodedToken.iat,
          exp: decodedToken.exp,
          aud: decodedToken.aud,
          iss: decodedToken.iss,
        },
      };
    } catch (error) {
      this._logger.error(
        'Error obteniendo información del usuario desde token',
        error,
      );
      throw new UnauthorizedException('Token JWT inválido');
    }
  }

  /**
   * Busca el realm donde existe un usuario específico
   * @param email - Email del usuario
   */
  private async findUserRealm(email: string): Promise<string> {
    // Lista de realms a verificar (genérico primero, luego otros)
    const realmsToCheck = ['ally']; // Empezar por el realm genérico

    // TODO: Implementar lógica para obtener lista de realms dinámicamente
    // Por ahora, intentar primero con el realm genérico

    for (const realm of realmsToCheck) {
      try {
        const userInfoUrl = `${this.keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/userinfo`;

        // Realizar una consulta de prueba (esto requiere implementar búsqueda por email)
        // Por simplicidad, asumimos que el usuario está en el realm genérico 'ally'
        if (realm === 'ally') {
          return realm;
        }
      } catch (error) {
        // Continuar con el siguiente realm
        continue;
      }
    }

    // Si no se encuentra en ningún realm, asumir realm genérico
    this._logger.warn(
      `No se pudo determinar el realm para ${email}, usando realm genérico`,
    );
    return 'ally';
  }
}
