import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { PasswordServiceInterface } from 'src/common/interfaces';
import { NativeLoggerService } from 'src/infrastructure/logger/native-logger.service';
import { EncoderAdapter } from 'src/infrastructure/adapters';
import { Password } from 'src/common/value-objects';
import { randomBytes } from 'crypto';

@Injectable()
export class PasswordService implements PasswordServiceInterface {
  private readonly logger = new Logger(PasswordService.name);

  constructor(
    @Inject(NativeLoggerService)
    private readonly nativeLogger: NativeLoggerService,
    private readonly encoderAdapter: EncoderAdapter,
  ) {
    this.nativeLogger.setContext(PasswordService.name);
  }

  /**
   * Hashea una contraseña usando bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      this.nativeLogger.logStructured('log', 'Hashing password', {
        operation: 'hash_password',
      });

      // Validar la contraseña usando Value Object
      const passwordVO = Password.create(password);

      const hashedPassword = await this.encoderAdapter.encodePassword(
        passwordVO.getValue(),
      );

      this.nativeLogger.logStructured('log', 'Password hashed successfully', {
        operation: 'hash_password',
      });

      return hashedPassword;
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Failed to hash password', {
        operation: 'hash_password',
        error: error.message,
      });
      throw new BadRequestException('Invalid password format');
    }
  }

  /**
   * Verifica una contraseña contra su hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      this.nativeLogger.logStructured('log', 'Verifying password', {
        operation: 'verify_password',
      });

      const isValid = await this.encoderAdapter.checkPassword(password, hash);

      this.nativeLogger.logStructured(
        'log',
        'Password verification completed',
        {
          operation: 'verify_password',
          isValid: isValid,
        },
      );

      return isValid;
    } catch (error) {
      this.nativeLogger.logStructured('error', 'Failed to verify password', {
        operation: 'verify_password',
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Genera un token seguro para reset de contraseña
   */
  generateResetToken(): string {
    try {
      this.nativeLogger.logStructured('log', 'Generating reset token', {
        operation: 'generate_reset_token',
      });

      // Generar un token de 32 bytes (256 bits) y convertirlo a hex
      const token = randomBytes(32).toString('hex');

      this.nativeLogger.logStructured(
        'log',
        'Reset token generated successfully',
        {
          operation: 'generate_reset_token',
        },
      );

      return token;
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to generate reset token',
        {
          operation: 'generate_reset_token',
          error: error.message,
        },
      );
      throw new BadRequestException('Failed to generate reset token');
    }
  }

  /**
   * Valida la fortaleza de una contraseña
   */
  validatePasswordStrength(password: string): boolean {
    try {
      // Usar el Value Object Password para validar
      Password.create(password);
      return true;
    } catch (error) {
      this.nativeLogger.logStructured(
        'warn',
        'Password strength validation failed',
        {
          operation: 'validate_password_strength',
          error: error.message,
        },
      );
      return false;
    }
  }

  /**
   * Genera una contraseña temporal segura
   */
  generateTemporaryPassword(length: number = 12): string {
    try {
      this.nativeLogger.logStructured('log', 'Generating temporary password', {
        operation: 'generate_temporary_password',
        length: length,
      });

      const charset =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';

      // Asegurar al menos un carácter de cada tipo
      password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Mayúscula
      password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
      password += '0123456789'[Math.floor(Math.random() * 10)]; // Número
      password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Carácter especial

      // Completar con caracteres aleatorios
      for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
      }

      // Mezclar la contraseña
      password = password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');

      this.nativeLogger.logStructured(
        'log',
        'Temporary password generated successfully',
        {
          operation: 'generate_temporary_password',
          length: password.length,
        },
      );

      return password;
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to generate temporary password',
        {
          operation: 'generate_temporary_password',
          error: error.message,
        },
      );
      throw new BadRequestException('Failed to generate temporary password');
    }
  }

  /**
   * Valida si una contraseña es diferente a las últimas N contraseñas
   */
  async isPasswordDifferentFromHistory(
    newPassword: string,
    passwordHistory: string[],
    maxHistory: number = 5,
  ): Promise<boolean> {
    try {
      this.nativeLogger.logStructured('log', 'Checking password history', {
        operation: 'check_password_history',
        historyLength: passwordHistory.length,
        maxHistory: maxHistory,
      });

      // Verificar contra las últimas contraseñas
      for (const oldPassword of passwordHistory.slice(-maxHistory)) {
        const isSame = await this.verifyPassword(newPassword, oldPassword);
        if (isSame) {
          this.nativeLogger.logStructured(
            'warn',
            'Password matches previous password',
            {
              operation: 'check_password_history',
            },
          );
          return false;
        }
      }

      this.nativeLogger.logStructured(
        'log',
        'Password is different from history',
        {
          operation: 'check_password_history',
        },
      );

      return true;
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to check password history',
        {
          operation: 'check_password_history',
          error: error.message,
        },
      );
      return false;
    }
  }

  /**
   * Obtiene información sobre la fortaleza de la contraseña
   */
  getPasswordStrengthInfo(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    try {
      const feedback: string[] = [];
      let score = 0;

      // Longitud mínima
      if (password.length >= 8) {
        score += 1;
      } else {
        feedback.push('La contraseña debe tener al menos 8 caracteres');
      }

      // Contiene mayúsculas
      if (/[A-Z]/.test(password)) {
        score += 1;
      } else {
        feedback.push(
          'La contraseña debe contener al menos una letra mayúscula',
        );
      }

      // Contiene minúsculas
      if (/[a-z]/.test(password)) {
        score += 1;
      } else {
        feedback.push(
          'La contraseña debe contener al menos una letra minúscula',
        );
      }

      // Contiene números
      if (/\d/.test(password)) {
        score += 1;
      } else {
        feedback.push('La contraseña debe contener al menos un número');
      }

      // Contiene caracteres especiales
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score += 1;
      } else {
        feedback.push(
          'La contraseña debe contener al menos un carácter especial',
        );
      }

      // Longitud adicional
      if (password.length >= 12) {
        score += 1;
      }

      const isStrong = score >= 4;

      this.nativeLogger.logStructured('log', 'Password strength analyzed', {
        operation: 'get_password_strength_info',
        score: score,
        isStrong: isStrong,
      });

      return {
        score,
        feedback,
        isStrong,
      };
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to analyze password strength',
        {
          operation: 'get_password_strength_info',
          error: error.message,
        },
      );
      return {
        score: 0,
        feedback: ['Error al analizar la contraseña'],
        isStrong: false,
      };
    }
  }

  /**
   * Genera un código de verificación numérico
   */
  generateVerificationCode(length: number = 6): string {
    try {
      this.nativeLogger.logStructured('log', 'Generating verification code', {
        operation: 'generate_verification_code',
        length: length,
      });

      const min = Math.pow(10, length - 1);
      const max = Math.pow(10, length) - 1;
      const code = Math.floor(Math.random() * (max - min + 1)) + min;

      this.nativeLogger.logStructured(
        'log',
        'Verification code generated successfully',
        {
          operation: 'generate_verification_code',
          length: code.toString().length,
        },
      );

      return code.toString();
    } catch (error) {
      this.nativeLogger.logStructured(
        'error',
        'Failed to generate verification code',
        {
          operation: 'generate_verification_code',
          error: error.message,
        },
      );
      throw new BadRequestException('Failed to generate verification code');
    }
  }
}
