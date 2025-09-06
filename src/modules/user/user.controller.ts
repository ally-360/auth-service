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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { User } from 'src/modules/auth/entities/user.entity';
import { ValidRoles } from 'src/common/constants/app/valid-roles.app';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateUserDto } from './dtos/in/create-user.dto';
import { UserListResponseDto } from './dtos/out/user-list-response.dto';
import { UpdateUserService } from './services/update-user.service';
import { FindUsersService } from './services/find-users.service';
import { FindUserService } from './services/find-user.service';
import { UserResponseDto } from '../auth/dtos';
import { Auth, GetUser } from '../auth/decorators';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels(UserResponseDto, UserListResponseDto)
@Controller('users')
export class UsersController {
  constructor(
    private readonly _findUsersService: FindUsersService,
    private readonly _findUserService: FindUserService,
    private readonly _updateUserService: UpdateUserService,
  ) {}

  @Get()
  @Auth(ValidRoles.owner)
  @ApiOkResponse({
    description: 'Listado paginado de usuarios',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(UserListResponseDto) },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @ApiForbiddenResponse({ description: 'Permisos insuficientes' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    example: 10,
    description: 'Máximo 25',
  })
  find(@Query() pags: PaginationDto): Promise<UserListResponseDto> {
    return this._findUsersService.execute(pags);
  }

  @Get('me')
  @ApiOkResponse({
    description: 'Usuario autenticado con su perfil',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: { data: { $ref: getSchemaPath(UserResponseDto) } },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  getMe(@GetUser('authId', ParseUUIDPipe) authId: string): Promise<User> {
    return this._findUserService.execute({ authId }, { profile: true });
  }

  @Get(':authId')
  @ApiParam({
    name: 'authId',
    description: 'UUID del usuario (authId)',
    type: String,
  })
  @ApiOkResponse({
    description: 'Usuario encontrado',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: { data: { $ref: getSchemaPath(UserResponseDto) } },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Parámetro inválido' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  findOne(@Param('authId', ParseUUIDPipe) authId: string): Promise<User> {
    return this._findUserService.execute({ authId });
  }

  @Auth(ValidRoles.admin, ValidRoles.owner)
  @Patch(':authId')
  @ApiParam({
    name: 'authId',
    description: 'UUID del usuario (authId)',
    type: String,
  })
  @ApiOkResponse({
    description: 'Usuario actualizado',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: { data: { $ref: getSchemaPath(UserResponseDto) } },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiForbiddenResponse({ description: 'Permisos insuficientes' })
  update(
    @Param('authId', ParseUUIDPipe) authId: string,
    @Body() data: UpdateUserDto,
  ): Promise<User> {
    return this._updateUserService.execute(authId, data);
  }
}
