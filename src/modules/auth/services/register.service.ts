import { Injectable, Logger } from '@nestjs/common';
// import { EventEmitter2 } from '@nestjs/event-emitter';
import { EncoderAdapter, GenstrAdapter } from 'src/infrastructure/adapters';
import { RegisterUserDto } from '../dtos';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RegisterService {
  private _logger = new Logger(RegisterService.name);
  constructor(
    private readonly _configService: ConfigService,
    private readonly _encoderAdapter: EncoderAdapter,
    private readonly _genstrAdapter: GenstrAdapter,
    // private readonly _eventEmitter: EventEmitter2,
  ) {}

  execute(data: RegisterUserDto): { message: string } {
    const { email } = data;

    this._logger.debug(`Inicio de sesión: ${email}`);

    return {
      message: 'RegisterService.execute',
    };
  }
}
