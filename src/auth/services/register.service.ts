import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EncoderAdapter, GenstrAdapter } from 'src/infrastructure/adapters';
import { RegisterUserDto } from '../dtos';
import { User } from 'src/common/entities';
import { EmailActionsEvent } from 'src/modules/mail/enums/email-events.enum';
import { ActivationLinkEvent } from 'src/modules/mail/events';
import { ConfigService } from '@nestjs/config';
import { CreateUserService } from 'src/modules/user/services/create-user.service';

@Injectable()
export class RegisterService {
  private _logger = new Logger(RegisterService.name);
  constructor(
    private readonly _configService: ConfigService,
    private readonly _createUserService: CreateUserService,
    private readonly _encoderAdapter: EncoderAdapter,
    private readonly _genstrAdapter: GenstrAdapter,
    private readonly _eventEmitter: EventEmitter2,
  ) {}

  async execute(data: RegisterUserDto): Promise<User> {
    const { password } = data;

    const hash = await this._encoderAdapter.encodePassword(password);
    const verifyToken = this._genstrAdapter.generate(25);

    const user = await this._createUserService.execute({
      ...data,
      password: hash,
      verifyToken,
    });

    // TODO: Implementar primer estado de Onboarding

    if (!user) {
      this._logger.error('Error intentando crear el usuario');
      throw new InternalServerErrorException(
        'Error intentando crear el usuario',
      );
    }

    delete user.password;

    this._logger.debug(
      `${user.createdAt} -> Usuario ${user.email} registrado exitosamente`,
    );

    const url = `http://127.0.0.1:${this._configService.get(
      'port',
    )}/api/v1/auth/user/${user.authId}/verify?code=${user.verifyToken}`;

    this._eventEmitter.emit(
      EmailActionsEvent.ActivationLink,
      new ActivationLinkEvent(user.email, user.profile.name, url),
    );

    return user;
  }
}
