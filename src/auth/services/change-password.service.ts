import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ChangePasswordDto } from '../dtos';
import { EncoderAdapter } from 'src/infrastructure/adapters';
import { UAE } from 'src/common/exceptions/exception.string';
import { FindUserService } from 'src/modules/user/services/find-user.service';
import { UpdateUserService } from 'src/modules/user/services/update-user.service';

@Injectable()
export class ChangePasswordService {
  private _logger = new Logger(ChangePasswordService.name);
  constructor(
    private readonly _findUserService: FindUserService,
    private readonly _updateUserService: UpdateUserService,
    private readonly _encoderAdapter: EncoderAdapter,
  ) {}

  async execute(
    authId: string,
    data: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = data;

    const user = await this._findUserService.execute({ authId });

    const validateOldPassword = await this._encoderAdapter.checkPassword(
      oldPassword,
      user.password,
    );

    if (!validateOldPassword) {
      this._logger.error(`Error en las credenciales: ${authId}`);
      throw new UnauthorizedException(UAE.UNAUTHORIZED);
    }

    user.password = await this._encoderAdapter.encodePassword(newPassword);
    await this._updateUserService.execute(user.authId, {
      password: user.password,
    });

    this._logger.debug(`Contraseña actualizada exitosamente: ${authId}`);

    return {
      message: 'Password updated successfully',
    };
  }
}
