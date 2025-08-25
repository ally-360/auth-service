import { Inject, Injectable, Logger } from '@nestjs/common';
import { ActivateUserDto } from '../dtos';
import { UserRepository } from 'src/modules/user/repositories/user.repository';

// TODO: Implement logic to Email Verify

@Injectable()
export class VerifyUserService {
  private _logger = new Logger(VerifyUserService.name);
  constructor(
    @Inject(UserRepository)
    private readonly _userRepo: UserRepository,
  ) {}

  async execute(
    authId: string,
    data: ActivateUserDto,
  ): Promise<{ message: string }> {
    const { code: verifyToken } = data;

    const user = await this._userRepo.findOneByFilters({ authId, verifyToken });

    user.verified = true;

    // TODO: Revisar por qué no funciona esta línea
    // user.verifyToken = null;

    await this._userRepo.save(user);
    this._logger.debug(`Se verificó el usuario con el id: ${authId}`);

    // TODO: Rehabilitar el envío de correo de bienvenida
    // this._eventEmitter.emit(
    //   EmailActionsEvent.UserRegistered,
    //   new WelcomeEvent(user.email),
    // );

    return {
      message: 'User verified successfully',
    };
  }
}
