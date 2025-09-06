import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from 'src/modules/auth/dtos';
import {
  CreateProfileDto,
  UpdateProfileDto,
} from 'src/modules/user/dtos/profile.dto';

export { CreateProfileDto, UpdateProfileDto };

export class CreateUserDto extends RegisterDto {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
