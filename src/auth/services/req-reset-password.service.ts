import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReqResetPasswordDto } from '../dtos';
import { GenstrAdapter } from 'src/infrastructure/adapters';
import { ReqResetPasswordEvent } from 'src/modules/mail/events';
import { EmailActionsEvent } from 'src/modules/mail/enums/email-events.enum';
import { UserRepository } from 'src/common/repositories';

@Injectable()
export class ReqResetPasswordService {
  constructor(
    @Inject(UserRepository)
    private readonly _userRepo: UserRepository,
    private readonly _genstrAdapter: GenstrAdapter,
    private readonly _eventEmitter: EventEmitter2,
  ) {}

  async execute(data: ReqResetPasswordDto): Promise<{ message: string }> {
    const { email } = data;

    const user = await this._userRepo.findOneByFilters({ email });
    user.resetPasswordToken = this._genstrAdapter.generate(50);

    await this._userRepo.save(user);

    this._eventEmitter.emit(
      EmailActionsEvent.ReqResetPassword,
      new ReqResetPasswordEvent(
        user.email,
        user.profile.name,
        user.resetPasswordToken,
      ),
    );

    return {
      message: 'Email sent successfully',
    };
  }
}
