import { Injectable, Logger, Inject } from '@nestjs/common';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { EncoderAdapter } from 'src/infrastructure/adapters';
import { ResetPasswordDto } from '../dtos';

@Injectable()
export class ResetPasswordService {
  private _logger = new Logger(ResetPasswordService.name);
  constructor(
    @Inject(UserRepository)
    private readonly _userRepo: UserRepository,
    private readonly _encoderAdapter: EncoderAdapter,
  ) {}

  async execute(data: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = data;

    const user = await this._userRepo.findOneByFilters({
      resetPasswordToken: token,
    });
    const encodedNewPassword =
      await this._encoderAdapter.encodePassword(newPassword);

    user.password = encodedNewPassword;

    //TODO: Revisar por qué no funciona esta línea
    // user.resetPasswordToken = null;

    await this._userRepo.save(user);

    this._logger.debug(
      `Contraseña actualizada exitosamente para el usuario ${user.email}`,
    );

    return {
      message: 'Password updated successfully',
    };
  }
}
