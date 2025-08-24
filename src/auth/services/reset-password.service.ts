import { Injectable, Logger, Inject } from '@nestjs/common';
import { UserRepository } from 'src/common/repositories';
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
    const { resetPasswordToken, password } = data;

    const user = await this._userRepo.findOneByFilters({ resetPasswordToken });
    const newPassword = await this._encoderAdapter.encodePassword(password);

    user.password = newPassword;
    user.resetPasswordToken = null;

    await this._userRepo.save(user);

    this._logger.debug(
      `Contraseña actualizada exitosamente para el usuario ${user.email}`,
    );

    return {
      message: 'Password updated successfully',
    };
  }
}
