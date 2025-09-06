import { Injectable } from '@nestjs/common';
import { NativeLoggerService } from './native-logger.service';

/**
 * Ejemplo de uso del NativeLoggerService
 * Este archivo es solo para demostración y puede ser eliminado
 */
@Injectable()
export class LoggerExample {
  constructor(private readonly logger: NativeLoggerService) {
    this.logger.setContext(LoggerExample.name);
  }

  demonstrateLogging() {
    // Logging básico
    this.logger.log('Este es un mensaje de información');
    this.logger.warn('Este es un mensaje de advertencia');
    this.logger.error('Este es un mensaje de error', 'Stack trace aquí');
    this.logger.debug('Este es un mensaje de debug');
    this.logger.verbose('Este es un mensaje verbose');

    // Logging estructurado
    this.logger.logStructured('log', 'Operación de usuario', {
      userId: '123',
      operation: 'login',
      timestamp: new Date().toISOString(),
    });

    // Logging específico de autenticación
    this.logger.logAuth('login_attempt', 'user123', 'user@example.com');
    this.logger.logAuth('login_success', 'user123', 'user@example.com');
    this.logger.logAuthError(
      'login',
      'Invalid credentials',
      'user123',
      'user@example.com',
    );

    // Logging con metadata
    this.logger.logAuth('password_reset', 'user456', 'admin@example.com', {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
    });
  }
}
