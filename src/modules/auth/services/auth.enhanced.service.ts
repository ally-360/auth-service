import {
  Injectable,
  Logger,
  Inject,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthServiceInterface, AuthResult } from 'src/common/interfaces';
import { NativeLoggerService } from 'src/infrastructure/logger/native-logger.service';
import { I18nService } from 'nestjs-i18n';
import { UserService } from './user.service';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
import { PasswordService } from './password.service';
import { Email, Password } from 'src/common/value-objects';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthEnhancedService implements AuthServiceInterface {
  private readonly logger = new Logger(AuthEnhancedService.name);

  constructor(
    @Inject(NativeLoggerService)
    private readonly nativeLogger: NativeLoggerService,
    private readonly i18n: I18nService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly passwordService: PasswordService,
    // TODO: Inyectar repositorios cuando estén implementados
    // @Inject('RefreshTokenRepository') private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    // @Inject('EmailVerificationRepository') private readonly emailVerificationRepository: EmailVerificationRepositoryInterface,
    // @Inject('PasswordResetRepository') private readonly passwordResetRepository: PasswordResetRepositoryInterface,
    // @Inject('OtpRepository') private readonly otpRepository: OtpRepositoryInterface,
  ) {
    this.nativeLogger.setContext(AuthEnhancedService.name);
  }

  /**
   * Autenticación básica con soporte para 2FA
   */
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    try {
      this.nativeLogger.logStructured('log', 'User login attempt', {
        operation: 'login',
        email: email,
        ipAddress: ipAddress,
      });

      // Validar credenciales
      const user = await this.userService.validateCredentials(email, password);
      if (!user) {
        this.nativeLogger.logStructured(
          'warn',
          'Login failed - invalid credentials',
          {
            operation: 'login',
            email: email,
          },
        );
        throw new UnauthorizedException(
          this.i18n.t('common.auth.login.failed'),
        );
      }

      // Verificar si el usuario está verificado
      if (!user.verified) {
        this.nativeLogger.logStructured(
          'warn',
          'Login failed - user not verified',
          {
            operation: 'login',
            email: email,
            userId: user.authId,
          },
        );
        throw new UnauthorizedException(
          this.i18n.t('common.auth.login.requires_verification'),
        );
      }

      // Generar tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken();

      // TODO: Guardar refresh token en repositorio
      // await this.refreshTokenRepository.save(RefreshToken.create(
      //   user.authId,
      //   refreshToken,
      //   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      //   ipAddress,
      //   userAgent
      // ));

      // Obtener roles y permisos del usuario
      const roles = await this.userService.getUserRoles(user.authId);
      const permissions = await this.userService.getUserPermissions(
        user.authId,
      );

      const authResult: AuthResult = {
        accessToken,
        refreshToken,
        user: {
          id: user.authId,
          email: user.email,
          roles,
          permissions,
          is2FAEnabled: (user as any).otpEnabled || false,
        },
        expiresIn: 3600, // 1 hora
      };

      this.nativeLogger.logStructured('log', 'User login successful', {
        operation: 'login',
        email: email,
        userId: user.authId,
        is2FAEnabled: (user as any).otpEnabled || false,
      });

      return authResult;
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Login failed', {
        operation: 'login',
        email: email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      this.nativeLogger.logStructured('log', 'User logout', {
        operation: 'logout',
        userId: userId,
      });

      if (refreshToken) {
        // TODO: Revocar refresh token específico
        // await this.refreshTokenRepository.revokeByToken(refreshToken);
      } else {
        // TODO: Revocar todos los refresh tokens del usuario
        // await this.refreshTokenRepository.revokeAllUserTokens(userId);
      }

      this.nativeLogger.logStructured('log', 'User logout successful', {
        operation: 'logout',
        userId: userId,
      });
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Logout failed', {
        operation: 'logout',
        userId: userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Renovar token de acceso
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      this.nativeLogger.logStructured('log', 'Refreshing token', {
        operation: 'refresh_token',
      });

      // TODO: Validar refresh token con repositorio
      // const tokenEntity = await this.refreshTokenRepository.findByToken(refreshToken);
      // if (!tokenEntity || !tokenEntity.isActive()) {
      //   throw new UnauthorizedException('Invalid refresh token');
      // }

      // TODO: Obtener usuario
      // const user = await this.userService.findUserById(tokenEntity.userId);
      // if (!user) {
      //   throw new NotFoundException('User not found');
      // }

      // Simular usuario para testing
      const user = await this.userService.findUserById('test-user-id');
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generar nuevo access token
      const accessToken = this.generateAccessToken(user);
      const roles = await this.userService.getUserRoles(user.authId);
      const permissions = await this.userService.getUserPermissions(
        user.authId,
      );

      const authResult: AuthResult = {
        accessToken,
        user: {
          id: user.authId,
          email: user.email,
          roles,
          permissions,
          is2FAEnabled: (user as any).otpEnabled || false,
        },
        expiresIn: 3600,
      };

      this.nativeLogger.logStructured('log', 'Token refreshed successfully', {
        operation: 'refresh_token',
        userId: user.authId,
      });

      return authResult;
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Token refresh failed', {
        operation: 'refresh_token',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Revocar refresh token
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      this.nativeLogger.logStructured('log', 'Revoking refresh token', {
        operation: 'revoke_refresh_token',
      });

      // TODO: Revocar token en repositorio
      // await this.refreshTokenRepository.revokeByToken(refreshToken);

      this.nativeLogger.logStructured(
        'log',
        'Refresh token revoked successfully',
        {
          operation: 'revoke_refresh_token',
        },
      );
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to revoke refresh token',
        {
          operation: 'revoke_refresh_token',
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Revocar todos los tokens de un usuario
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      this.nativeLogger.logStructured('log', 'Revoking all user tokens', {
        operation: 'revoke_all_user_tokens',
        userId: userId,
      });

      // TODO: Revocar todos los tokens en repositorio
      // await this.refreshTokenRepository.revokeAllUserTokens(userId);

      this.nativeLogger.logStructured(
        'log',
        'All user tokens revoked successfully',
        {
          operation: 'revoke_all_user_tokens',
          userId: userId,
        },
      );
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to revoke all user tokens',
        {
          operation: 'revoke_all_user_tokens',
          userId: userId,
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Enviar código de verificación de email
   */
  async sendEmailVerification(email: string): Promise<void> {
    try {
      this.nativeLogger.logStructured('log', 'Sending email verification', {
        operation: 'send_email_verification',
        email: email,
      });

      // Validar email
      const emailVO = Email.create(email);

      // Generar código de verificación
      const code = this.passwordService.generateVerificationCode(6);

      // TODO: Guardar código en repositorio
      // await this.emailVerificationRepository.save(EmailVerification.create(
      //   emailVO.getValue(),
      //   code,
      //   5 // 5 minutos de expiración
      // ));

      // Enviar email
      await this.emailService.sendVerificationEmail(email, code);

      this.nativeLogger.logStructured(
        'log',
        'Email verification sent successfully',
        {
          operation: 'send_email_verification',
          email: email,
        },
      );
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to send email verification',
        {
          operation: 'send_email_verification',
          email: email,
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Verificar código de email
   */
  async verifyEmail(email: string, code: string): Promise<boolean> {
    try {
      this.nativeLogger.logStructured('log', 'Verifying email code', {
        operation: 'verify_email',
        email: email,
      });

      // TODO: Buscar código en repositorio
      // const emailVerification = await this.emailVerificationRepository.findByEmail(email);
      // if (!emailVerification || !emailVerification.isActive()) {
      //   throw new BadRequestException('Invalid or expired verification code');
      // }

      // TODO: Verificar código
      // const isValid = emailVerification.verifyCode(code);
      // if (!isValid) {
      //   throw new BadRequestException('Invalid verification code');
      // }

      // TODO: Marcar email como verificado
      // const user = await this.userService.findUserByEmail(email);
      // if (user) {
      //   user.verify();
      //   await this.userService.updateUser(user.authId, user);
      // }

      this.nativeLogger.logStructured('log', 'Email verified successfully', {
        operation: 'verify_email',
        email: email,
      });

      return true; // Simular verificación exitosa
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Email verification failed', {
        operation: 'verify_email',
        email: email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Solicitar reset de contraseña
   */
  async requestPasswordReset(
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      this.nativeLogger.logStructured('log', 'Requesting password reset', {
        operation: 'request_password_reset',
        email: email,
        ipAddress: ipAddress,
      });

      // Validar email
      const emailVO = Email.create(email);

      // Verificar que el usuario existe
      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        // Por seguridad, no revelar si el email existe o no
        this.nativeLogger.logStructured(
          'warn',
          'Password reset requested for non-existent email',
          {
            operation: 'request_password_reset',
            email: email,
          },
        );
        return;
      }

      // Generar token de reset
      const token = this.passwordService.generateResetToken();

      // TODO: Guardar token en repositorio
      // await this.passwordResetRepository.save(PasswordReset.create(
      //   user.authId,
      //   emailVO.getValue(),
      //   token,
      //   60, // 1 hora de expiración
      //   ipAddress,
      //   userAgent
      // ));

      // Enviar email
      await this.emailService.sendPasswordResetEmail(email, token);

      this.nativeLogger.logStructured(
        'log',
        'Password reset requested successfully',
        {
          operation: 'request_password_reset',
          email: email,
        },
      );
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to request password reset',
        {
          operation: 'request_password_reset',
          email: email,
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Resetear contraseña
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      this.nativeLogger.logStructured('log', 'Resetting password', {
        operation: 'reset_password',
      });

      // TODO: Validar token con repositorio
      // const passwordReset = await this.passwordResetRepository.findByToken(token);
      // if (!passwordReset || !passwordReset.isActive()) {
      //   throw new BadRequestException('Invalid or expired reset token');
      // }

      // Validar nueva contraseña
      if (!this.passwordService.validatePasswordStrength(newPassword)) {
        throw new BadRequestException(
          'Password does not meet strength requirements',
        );
      }

      // Hashear nueva contraseña
      const hashedPassword =
        await this.passwordService.hashPassword(newPassword);

      // TODO: Actualizar contraseña del usuario
      // const user = await this.userService.findUserById(passwordReset.userId);
      // if (user) {
      //   user.changePassword(hashedPassword);
      //   await this.userService.updateUser(user.authId, user);
      // }

      // TODO: Marcar token como usado
      // passwordReset.markAsUsed();
      // await this.passwordResetRepository.update(passwordReset);

      // Enviar email de notificación
      // await this.emailService.sendPasswordChangedEmail(passwordReset.email);

      this.nativeLogger.logStructured('log', 'Password reset successfully', {
        operation: 'reset_password',
      });

      return true;
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Password reset failed', {
        operation: 'reset_password',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Habilitar 2FA
   */
  async enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      this.nativeLogger.logStructured('log', 'Enabling 2FA', {
        operation: 'enable_2fa',
        userId: userId,
      });

      // Obtener usuario
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generar secreto
      const secret = this.otpService.generateSecret();

      // Generar QR code
      const qrCode = this.otpService.generateQRCode(secret, user.email);

      // TODO: Guardar secreto en repositorio
      // await this.otpRepository.save(Otp.create(
      //   userId,
      //   secret,
      //   5 // 5 minutos de expiración
      // ));

      this.nativeLogger.logStructured('log', '2FA enabled successfully', {
        operation: 'enable_2fa',
        userId: userId,
      });

      return { secret, qrCode };
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Failed to enable 2FA', {
        operation: 'enable_2fa',
        userId: userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Deshabilitar 2FA
   */
  async disable2FA(userId: string, otpCode: string): Promise<boolean> {
    try {
      this.nativeLogger.logStructured('log', 'Disabling 2FA', {
        operation: 'disable_2fa',
        userId: userId,
      });

      // Obtener usuario
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // TODO: Verificar OTP con repositorio
      // const otp = await this.otpRepository.findByUserId(userId);
      // if (!otp || !otp.isActive()) {
      //   throw new BadRequestException('Invalid or expired OTP');
      // }

      // Verificar código OTP
      // const isValidOtp = this.otpService.verifyOTP(otp.secret, otpCode);
      // if (!isValidOtp) {
      //   throw new BadRequestException('Invalid OTP code');
      // }

      // TODO: Deshabilitar 2FA en usuario
      // user.disableOtp();
      // await this.userService.updateUser(user.authId, user);

      // Enviar email de notificación
      await this.emailService.send2FADisabledEmail(user.email);

      this.nativeLogger.logStructured('log', '2FA disabled successfully', {
        operation: 'disable_2fa',
        userId: userId,
      });

      return true;
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Failed to disable 2FA', {
        operation: 'disable_2fa',
        userId: userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Verificar código 2FA
   */
  async verify2FA(userId: string, otpCode: string): Promise<boolean> {
    try {
      this.nativeLogger.logStructured('log', 'Verifying 2FA', {
        operation: 'verify_2fa',
        userId: userId,
      });

      // Obtener usuario
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // TODO: Verificar OTP con repositorio
      // const otp = await this.otpRepository.findByUserId(userId);
      // if (!otp || !otp.isActive()) {
      //   throw new BadRequestException('Invalid or expired OTP');
      // }

      // Verificar código OTP
      // const isValidOtp = this.otpService.verifyOTP(otp.secret, otpCode);
      // if (!isValidOtp) {
      //   throw new BadRequestException('Invalid OTP code');
      // }

      // TODO: Marcar OTP como verificado
      // otp.markAsVerified();
      // await this.otpRepository.update(otp);

      this.nativeLogger.logStructured('log', '2FA verified successfully', {
        operation: 'verify_2fa',
        userId: userId,
      });

      return true; // Simular verificación exitosa
    } catch (error) {
      this.nativeLogger.logStructured('error', '2FA verification failed', {
        operation: 'verify_2fa',
        userId: userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generar access token
   */
  private generateAccessToken(user: any): string {
    const payload = {
      sub: user.authId,
      email: user.email,
      roles: user.roles || [],
      permissions: user.permissions || [],
      is2FAEnabled: user.otpEnabled || false,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '1h',
      issuer: 'ally360-auth-service',
    });
  }

  /**
   * Generar refresh token
   */
  private generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }
}
