import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EncoderAdapter } from 'src/infrastructure/adapters';
import { LoginDto } from '../dtos';

@Injectable()
export class LoginService {
  private _logger = new Logger(LoginService.name);
  constructor(
    private readonly _encoderAdapter: EncoderAdapter,
    private readonly _jwtService: JwtService,
  ) {}

  execute(loginDto: LoginDto): { accessToken: string } {
    const { email } = loginDto;

    this._logger.debug(`Inicio de sesión: ${email}`);

    return {
      accessToken: 'LoginService.execute',
    };
  }
}
