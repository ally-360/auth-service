import { Injectable, Logger } from '@nestjs/common';
import { ChangePasswordDto } from '../dtos';

@Injectable()
export class ChangePasswordService {
  private _logger = new Logger(ChangePasswordService.name);
  execute(authId: string, data: ChangePasswordDto) {
    this._logger.debug(`Change password for ${authId} with payload`, data);
    return { message: 'ChangePasswordService.execute' };
  }
}
