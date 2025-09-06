import { Injectable, Logger, Inject } from '@nestjs/common';
import { EmailServiceInterface } from 'src/common/interfaces';
import { NativeLoggerService } from 'src/infrastructure/logger/native-logger.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class EmailService implements EmailServiceInterface {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(NativeLoggerService)
    private readonly nativeLogger: NativeLoggerService,
    private readonly i18n: I18nService,
  ) {
    this.nativeLogger.setContext(EmailService.name);
  }

  /**
   * Envía email de verificación
   */
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    try {
      this.nativeLogger.logStructured('log', 'Sending verification email', {
        operation: 'send_verification_email',
        email: email,
      });

      // TODO: Implementar integración con servicio de email real (SendGrid, AWS SES, etc.)
      // Por ahora solo logueamos la acción
      const subject = this.i18n.t('common.email.verification.subject');
      const message = this.i18n
        .t('common.email.verification.message')
        .replace('{code}', code);

      this.logger.log(`📧 Verification email for ${email}:`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Message: ${message}`);
      this.logger.log(`Code: ${code}`);

      // Simular envío exitoso
      this.nativeLogger.logStructured(
        'log',
        'Verification email sent successfully',
        {
          operation: 'send_verification_email',
          email: email,
        },
      );
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to send verification email',
        {
          operation: 'send_verification_email',
          email: email,
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Envía email de reset de contraseña
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      this.nativeLogger.logStructured('log', 'Sending password reset email', {
        operation: 'send_password_reset_email',
        email: email,
      });

      // TODO: Implementar integración con servicio de email real
      const subject = this.i18n.t('common.email.password_reset.subject');
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      const message = this.i18n
        .t('common.email.password_reset.message')
        .replace('{resetUrl}', resetUrl)
        .replace('{expirationTime}', '1 hora');

      this.logger.log(`📧 Password reset email for ${email}:`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Message: ${message}`);
      this.logger.log(`Reset URL: ${resetUrl}`);

      // Simular envío exitoso
      this.nativeLogger.logStructured(
        'log',
        'Password reset email sent successfully',
        {
          operation: 'send_password_reset_email',
          email: email,
        },
      );
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to send password reset email',
        {
          operation: 'send_password_reset_email',
          email: email,
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Envía email de notificación de 2FA habilitado
   */
  async send2FAEnabledEmail(email: string): Promise<void> {
    try {
      this.nativeLogger.logStructured('log', 'Sending 2FA enabled email', {
        operation: 'send_2fa_enabled_email',
        email: email,
      });

      const subject = this.i18n.t('common.email.2fa_enabled.subject');
      const message = this.i18n.t('common.email.2fa_enabled.message');

      this.logger.log(`📧 2FA enabled email for ${email}:`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Message: ${message}`);

      // Simular envío exitoso
      this.nativeLogger.logStructured(
        'log',
        '2FA enabled email sent successfully',
        {
          operation: 'send_2fa_enabled_email',
          email: email,
        },
      );
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to send 2FA enabled email',
        {
          operation: 'send_2fa_enabled_email',
          email: email,
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Envía email de notificación de 2FA deshabilitado
   */
  async send2FADisabledEmail(email: string): Promise<void> {
    try {
      this.nativeLogger.logStructured('log', 'Sending 2FA disabled email', {
        operation: 'send_2fa_disabled_email',
        email: email,
      });

      const subject = this.i18n.t('common.email.2fa_disabled.subject');
      const message = this.i18n.t('common.email.2fa_disabled.message');

      this.logger.log(`📧 2FA disabled email for ${email}:`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Message: ${message}`);

      // Simular envío exitoso
      this.nativeLogger.logStructured(
        'log',
        '2FA disabled email sent successfully',
        {
          operation: 'send_2fa_disabled_email',
          email: email,
        },
      );
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to send 2FA disabled email',
        {
          operation: 'send_2fa_disabled_email',
          email: email,
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Envía email de bienvenida
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      this.nativeLogger.logStructured('log', 'Sending welcome email', {
        operation: 'send_welcome_email',
        email: email,
      });

      const subject = this.i18n.t('common.email.welcome.subject');
      const message = this.i18n.t('common.email.welcome.message').replace('{name}', name);

      this.logger.log(`📧 Welcome email for ${email}:`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Message: ${message}`);

      // Simular envío exitoso
      this.nativeLogger.logStructured(
        'log',
        'Welcome email sent successfully',
        {
          operation: 'send_welcome_email',
          email: email,
        },
      );
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Failed to send welcome email', {
        operation: 'send_welcome_email',
        email: email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Envía email de notificación de cambio de contraseña
   */
  async sendPasswordChangedEmail(email: string): Promise<void> {
    try {
      this.nativeLogger.logStructured(
        'log',
        'Sending password changed email',
        {
          operation: 'send_password_changed_email',
          email: email,
        },
      );

      const subject = this.i18n.t('common.email.password_changed.subject');
      const message = this.i18n.t('common.email.password_changed.message');

      this.logger.log(`📧 Password changed email for ${email}:`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Message: ${message}`);

      // Simular envío exitoso
      this.nativeLogger.logStructured(
        'log',
        'Password changed email sent successfully',
        {
          operation: 'send_password_changed_email',
          email: email,
        },
      );
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to send password changed email',
        {
          operation: 'send_password_changed_email',
          email: email,
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Valida el formato del email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtiene la configuración del servicio de email
   */
  getEmailConfig(): {
    from: string;
    replyTo: string;
    supportEmail: string;
  } {
    return {
      from: process.env.EMAIL_FROM || 'noreply@ally360.com',
      replyTo: process.env.EMAIL_REPLY_TO || 'support@ally360.com',
      supportEmail: process.env.EMAIL_SUPPORT || 'support@ally360.com',
    };
  }
}
