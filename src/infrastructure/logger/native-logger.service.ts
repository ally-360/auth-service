import {
  Injectable,
  LoggerService as NestLoggerService,
  Logger,
} from '@nestjs/common';

@Injectable()
export class NativeLoggerService implements NestLoggerService {
  private context?: string;
  private readonly logger = new Logger();

  setContext(context: string): void {
    this.context = context;
    // El Logger de NestJS no tiene setContext, manejamos el contexto manualmente
  }

  log(message: any, context?: string): void {
    if (context) {
      this.logger.log(message, context);
    } else {
      this.logger.log(message);
    }
  }

  error(message: any, trace?: string, context?: string): void {
    if (context) {
      this.logger.error(message, trace, context);
    } else {
      this.logger.error(message, trace);
    }
  }

  warn(message: any, context?: string): void {
    if (context) {
      this.logger.warn(message, context);
    } else {
      this.logger.warn(message);
    }
  }

  debug(message: any, context?: string): void {
    if (context) {
      this.logger.debug(message, context);
    } else {
      this.logger.debug(message);
    }
  }

  verbose(message: any, context?: string): void {
    if (context) {
      this.logger.verbose(message, context);
    } else {
      this.logger.verbose(message);
    }
  }

  logStructured(
    level: 'log' | 'error' | 'warn' | 'debug' | 'verbose',
    message: string,
    metadata?: Record<string, any>,
  ): void {
    const logData = {
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
    const logMessage = JSON.stringify(logData);

    switch (level) {
      case 'error':
        this.logger.error(logMessage, undefined, logData.context);
        break;
      case 'warn':
        this.logger.warn(logMessage, logData.context);
        break;
      case 'debug':
        this.logger.debug(logMessage, logData.context);
        break;
      case 'verbose':
        this.logger.verbose(logMessage, logData.context);
        break;
      default:
        this.logger.log(logMessage, logData.context);
    }
  }

  // Método para logging de operaciones de autenticación
  logAuth(
    operation: string,
    userId?: string,
    email?: string,
    metadata?: Record<string, any>,
  ): void {
    const logMessage = `Auth operation: ${operation}`;
    const contextStr = this.context || 'Auth';
    const metadataStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
    const userInfo = userId || email ? ` | User: ${userId || email}` : '';

    this.logger.log(`${logMessage}${userInfo}${metadataStr}`, contextStr);
  }

  // Método para logging de errores de autenticación
  logAuthError(
    operation: string,
    error: string,
    userId?: string,
    email?: string,
    metadata?: Record<string, any>,
  ): void {
    const logMessage = `Auth error: ${operation} - ${error}`;
    const contextStr = this.context || 'Auth';
    const metadataStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
    const userInfo = userId || email ? ` | User: ${userId || email}` : '';

    this.logger.error(`${logMessage}${userInfo}${metadataStr}`, contextStr);
  }
}
