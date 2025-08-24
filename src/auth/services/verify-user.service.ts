import { Inject, Injectable, Logger } from '@nestjs/common';
import { ActivateUserDto } from '../dtos';
import { UserRepository } from 'src/common/repositories';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailActionsEvent } from 'src/modules/mail/enums/email-events.enum';
import { WelcomeEvent } from 'src/modules/mail/events';

// TODO: Implement logic to Email Verify

@Injectable()
export class VerifyUserService {
  private _logger = new Logger(VerifyUserService.name);
  constructor(
    @Inject(UserRepository)
    private readonly _userRepo: UserRepository,
    private readonly _eventEmitter: EventEmitter2,
  ) {}

  async execute(
    authId: string,
    data: ActivateUserDto,
  ): Promise<{ message: string }> {
    const { code: verifyToken } = data;

    const user = await this._userRepo.findOneByFilters({ authId, verifyToken });

    user.verified = true;
    user.verifyToken = null;

    await this._userRepo.save(user);
    this._logger.debug(`Se verificó el usuario con el id: ${authId}`);

    this._eventEmitter.emit(
      EmailActionsEvent.UserRegistered,
      new WelcomeEvent(user.email),
    );

    return {
      message: 'User verified successfully',
    };
  }
}
