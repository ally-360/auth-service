import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/modules/auth/decorators';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { User } from 'src/modules/auth/entities/user.entity';
import { ValidRoles } from 'src/common/constants/app/valid-roles.app';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateUserDto } from './dtos/in/create-user.dto';
import { UserListResponseDto } from './dtos/out/user-list-response.dto';
import { UpdateUserService } from './services/update-user.service';
import { FindUsersService } from './services/find-users.service';
import { FindUserService } from './services/find-user.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly _findUsersService: FindUsersService,
    private readonly _findUserService: FindUserService,
    private readonly _updateUserService: UpdateUserService,
  ) {}

  @Get()
  @Auth(ValidRoles.owner)
  find(@Query() pags: PaginationDto): Promise<UserListResponseDto> {
    return this._findUsersService.execute(pags);
  }

  @Get('me')
  getMe(@GetUser('authId', ParseUUIDPipe) authId: string): Promise<User> {
    return this._findUserService.execute({ authId }, { profile: true });
  }

  @Get(':authId')
  findOne(@Param('authId', ParseUUIDPipe) authId: string): Promise<User> {
    return this._findUserService.execute({ authId });
  }

  @Auth(ValidRoles.admin, ValidRoles.owner)
  @Patch(':authId')
  update(
    @Param('authId', ParseUUIDPipe) authId: string,
    @Body() data: UpdateUserDto,
  ): Promise<User> {
    return this._updateUserService.execute(authId, data);
  }
}
