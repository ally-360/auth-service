import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { RegisterUserDto } from 'src/modules/auth/dtos/register-user.dto';
import { MakeTransactional } from 'src/infrastructure/decorators/transactional.decorator';
import { Profile, User } from 'src/modules/auth/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CreateUserService {
  private _logger = new Logger(CreateUserService.name);
  constructor(
    @Inject(UserRepository)
    private readonly _userRepo: UserRepository,
    @InjectRepository(Profile)
    private readonly _profileRepo: Repository<Profile>,
  ) {}

  @MakeTransactional()
  async execute(data: RegisterUserDto): Promise<User> {
    const { profile, ...userData } = data;
    try {
      await this._userRepo.validateIfUserExist({
        email: data.email,
      });

      const userEntity = this._userRepo.create({ ...userData });
      const createdUser = await this._userRepo.save(userEntity);

      const profileEntity = this._profileRepo.create({
        ...profile,
        user: createdUser,
      });
      const createdProfile = await this._profileRepo.save(profileEntity);

      createdUser.profile = createdProfile;
      return createdUser;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException(
        'Error interno inesperado, revise los logs',
      );
    }
  }
}
