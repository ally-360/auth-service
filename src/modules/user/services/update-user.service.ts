import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { User } from 'src/modules/auth/entities/user.entity';
import { UpdateUserDto } from '../dtos/in/create-user.dto';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { MakeTransactional } from 'src/infrastructure/decorators/transactional.decorator';
import { FindUserService } from './find-user.service';

@Injectable()
export class UpdateUserService {
  private _logger = new Logger('UpdateUserService');

  constructor(
    @Inject(UserRepository)
    private readonly _userRepo: UserRepository,
    private readonly _findUserService: FindUserService,
  ) {}

  @MakeTransactional()
  async execute(authId: string, data: UpdateUserDto): Promise<User> {
    try {
      const user = await this._findUserService.execute({ authId });
      return await this._userRepo.save({
        ...user,
        ...data,
      });
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException(
        'Error interno inesperado, revise los logs',
      );
    }
  }
}
