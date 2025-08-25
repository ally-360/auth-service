import { PartialType } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/modules/auth/dtos/register-user.dto';
import {
  CreateProfileDto,
  UpdateProfileDto,
} from 'src/modules/user/dtos/profile.dto';

export { CreateProfileDto, UpdateProfileDto };

export class CreateUserDto extends RegisterUserDto {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
