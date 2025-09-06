import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { OtpServiceInterface } from 'src/common/interfaces';
import { NativeLoggerService } from 'src/infrastructure/logger/native-logger.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class OtpService implements OtpServiceInterface {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @Inject(NativeLoggerService)
    private readonly nativeLogger: NativeLoggerService,
  ) {
    this.nativeLogger.setContext(OtpService.name);
  }

  /**
   * Genera un secreto para 2FA
   */
  generateSecret(): string {
    try {
      const secret = speakeasy.generateSecret({
        name: 'Auth Service',
        issuer: 'Ally 360',
        length: 32,
      });

      this.nativeLogger.logStructured('log', 'OTP secret generated', {
        operation: 'generate_secret',
      });

      return secret.base32;
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to generate OTP secret',
        {
          operation: 'generate_secret',
          error: error.message,
        },
      );
      throw new BadRequestException('Failed to generate OTP secret');
    }
  }

  /**
   * Genera un código QR para configurar 2FA
   */
  generateQRCode(secret: string, email: string): string {
    try {
      const otpauthUrl = speakeasy.otpauthURL({
        secret: secret,
        label: email,
        issuer: 'Ally 360',
        algorithm: 'sha1',
        digits: 6,
      });

      this.nativeLogger.logStructured(
        'log',
        'QR code generated for 2FA setup',
        {
          operation: 'generate_qr_code',
          email: email,
        },
      );

      return otpauthUrl;
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Failed to generate QR code', {
        operation: 'generate_qr_code',
        email: email,
        error: error.message,
      });
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  /**
   * Verifica un código OTP
   */
  verifyOTP(secret: string, token: string): boolean {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2, // Permite un margen de 2 períodos (60 segundos)
        algorithm: 'sha1',
        digits: 6,
      });

      this.nativeLogger.logStructured('log', 'OTP verification attempt', {
        operation: 'verify_otp',
        verified: verified,
      });

      return verified;
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Failed to verify OTP', {
        operation: 'verify_otp',
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Genera un código OTP para testing
   */
  generateOTP(secret: string): string {
    try {
      const token = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
        algorithm: 'sha1',
        digits: 6,
      });

      this.nativeLogger.logStructured('log', 'OTP generated for testing', {
        operation: 'generate_otp',
      });

      return token;
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Failed to generate OTP', {
        operation: 'generate_otp',
        error: error.message,
      });
      throw new BadRequestException('Failed to generate OTP');
    }
  }

  /**
   * Valida el formato del secreto
   */
  validateSecret(secret: string): boolean {
    try {
      // Verificar que el secreto sea válido para speakeasy
      speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Genera un código QR como imagen base64
   */
  async generateQRCodeImage(secret: string, email: string): Promise<string> {
    try {
      const otpauthUrl = this.generateQRCode(secret, email);
      const qrCodeImage = await QRCode.toDataURL(otpauthUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      this.nativeLogger.logStructured('log', 'QR code image generated', {
        operation: 'generate_qr_code_image',
        email: email,
      });

      return qrCodeImage;
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to generate QR code image',
        {
          operation: 'generate_qr_code_image',
          email: email,
          error: error.message,
        },
      );
      throw new BadRequestException('Failed to generate QR code image');
    }
  }

  /**
   * Obtiene información del secreto
   */
  getSecretInfo(secret: string): {
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
  } {
    try {
      const qrCodeUrl = this.generateQRCode(secret, 'user@example.com');

      return {
        secret: secret,
        qrCodeUrl: qrCodeUrl,
        manualEntryKey: secret,
      };
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Failed to get secret info', {
        operation: 'get_secret_info',
        error: error.message,
      });
      throw new BadRequestException('Failed to get secret info');
    }
  }
}
