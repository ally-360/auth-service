import { Injectable, Inject } from '@nestjs/common';
import { RequestPasswordResetDto } from '../dtos';
import { GenstrAdapter } from 'src/infrastructure/adapters';
import { UserRepository } from 'src/modules/user/repositories/user.repository';

@Injectable()
export class RequestPasswordResetService {
  constructor(
    @Inject(UserRepository)
    private readonly _userRepo: UserRepository,
    private readonly _genstrAdapter: GenstrAdapter,
  ) {}

  async execute(data: RequestPasswordResetDto): Promise<{ message: string }> {
    const { email } = data;

    const user = await this._userRepo.findOneByFilters({ email });
    user.resetPasswordToken = this._genstrAdapter.generate(50);

    await this._userRepo.save(user);

    // TODO: Emitir el evento para enviar el correo
    // this._eventEmitter.emit(
    //   EmailActionsEvent.ReqResetPassword,
    //   new ReqResetPasswordEvent(
    //     user.email,
    //     user.profile.name,
    //     user.resetPasswordToken,
    //   ),
    // );

    return {
      message: 'Email sent successfully',
    };
  }
}
