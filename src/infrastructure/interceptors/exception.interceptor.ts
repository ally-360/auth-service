import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AllyExceptionInterceptor implements NestInterceptor {
  private readonly _logger = new Logger(AllyExceptionInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let response = { success: false, details: {} };

        if (error instanceof HttpException) {
          status = error.getStatus();
          const errorResponse: any = error.getResponse();

          response = {
            success: false,
            details: this.setACode(errorResponse),
          };
          this._logger.error(
            JSON.stringify({
              ...response,
              path: context.switchToHttp().getRequest().url,
              timestamp: new Date().toISOString(),
            }),
          );
        } else {
          response = {
            success: false,
            details: {
              message: 'Unexpected error',
              acode: 1100,
            },
          };
          this._logger.error(
            JSON.stringify({
              ...response,
              originalError: JSON.stringify(error, null),
              path: context.switchToHttp().getRequest().url,
              timestamp: new Date().toISOString(),
            }),
          );
        }

        return throwError(() => new HttpException(response, status));
      }),
    );
  }

  private setACode(errorResponse: any) {
    if (typeof errorResponse === 'object' && errorResponse.message) {
      return { ...errorResponse, acode: 1000 };
    }
    return errorResponse;
  }
}
