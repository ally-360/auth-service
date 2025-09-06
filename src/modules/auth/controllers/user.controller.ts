import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  AssignRoleDto,
} from '../dtos';
import { MessageResponseDto, PaginatedResponseDto } from '../dtos/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Usuarios')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin')
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para crear usuarios',
  })
  async createUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.createUser(
      createUserDto.email,
      createUserDto.password,
      createUserDto.profile,
    );

    return {
      id: user.id.toString(),
      authId: (user as any).authId || user.id.toString(),
      email: user.email,
      isActive: (user as any).isActive || true,
      verified: (user as any).verified || false,
      otpEnabled: (user as any).otpEnabled || false,
      lastLoginAt: (user as any).lastLoginAt,
      profile: (user as any).profile || {
        id: user.id.toString(),
        name: (user as any).firstName || '',
        lastName: (user as any).lastName || '',
        phone: (user as any).phone,
        avatar: (user as any).avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      roles:
        (user as any).roles?.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          isActive: role.isActive,
          isDefault: role.isDefault || false,
        })) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Obtener lista de usuarios' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Límite de elementos por página',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Término de búsqueda',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    type: String,
    description: 'Filtrar por rol',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: PaginatedResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver usuarios',
  })
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    // TODO: Implementar método getUsers con paginación en UserService
    // Por ahora, usamos un mock
    const result = {
      data: [],
      page,
      limit,
      total: 0,
      totalPages: 0,
    };

    return {
      data: (result.data as any[]).map((user) => ({
        id: user.id,
        authId: (user as any).authId || user.id,
        email: user.email,
        isActive: (user as any).isActive || true,
        verified: (user as any).verified || false,
        otpEnabled: (user as any).otpEnabled || false,
        lastLoginAt: (user as any).lastLoginAt,
        profile: (user as any).profile || {
          id: user.id,
          name: (user as any).firstName || '',
          lastName: (user as any).lastName || '',
          phone: (user as any).phone,
          avatar: (user as any).avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        roles:
          (user as any).roles?.map((role: any) => ({
            id: role.id,
            name: role.name,
            description: role.description,
            isActive: role.isActive,
            isDefault: role.isDefault || false,
          })) || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      },
    };
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver usuarios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findUserById(id);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      id: user.id.toString(),
      authId: (user as any).authId || user.id.toString(),
      email: user.email,
      isActive: (user as any).isActive || true,
      verified: (user as any).verified || false,
      otpEnabled: (user as any).otpEnabled || false,
      lastLoginAt: (user as any).lastLoginAt,
      profile: (user as any).profile || {
        id: user.id.toString(),
        name: (user as any).firstName || '',
        lastName: (user as any).lastName || '',
        phone: (user as any).phone,
        avatar: (user as any).avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      roles:
        (user as any).roles?.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          isActive: role.isActive,
          isDefault: role.isDefault || false,
        })) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Put(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para actualizar usuarios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(id, updateUserDto as any);

    return {
      id: user.id.toString(),
      authId: (user as any).authId || user.id.toString(),
      email: user.email,
      isActive: (user as any).isActive || true,
      verified: (user as any).verified || false,
      otpEnabled: (user as any).otpEnabled || false,
      lastLoginAt: (user as any).lastLoginAt,
      profile: (user as any).profile || {
        id: user.id.toString(),
        name: (user as any).firstName || '',
        lastName: (user as any).lastName || '',
        phone: (user as any).phone,
        avatar: (user as any).avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      roles:
        (user as any).roles?.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          isActive: role.isActive,
          isDefault: role.isDefault || false,
        })) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para eliminar usuarios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async deleteUser(@Param('id') id: string): Promise<MessageResponseDto> {
    await this.userService.deleteUser(id);

    return {
      message: 'Usuario eliminado exitosamente',
      code: 'USER_DELETED',
    };
  }

  @Post(':id/activate')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario activado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para activar usuarios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async activateUser(@Param('id') id: string): Promise<MessageResponseDto> {
    await this.userService.activateUser(id);

    return {
      message: 'Usuario activado exitosamente',
      code: 'USER_ACTIVATED',
    };
  }

  @Post(':id/deactivate')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario desactivado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para desactivar usuarios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async deactivateUser(@Param('id') id: string): Promise<MessageResponseDto> {
    await this.userService.deactivateUser(id);

    return {
      message: 'Usuario desactivado exitosamente',
      code: 'USER_DEACTIVATED',
    };
  }

  @Post(':id/roles')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Asignar rol a usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Rol asignado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para asignar roles',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o rol no encontrado',
  })
  async assignRole(
    @Param('id') userId: string,
    @Body(ValidationPipe) assignRoleDto: AssignRoleDto,
  ): Promise<MessageResponseDto> {
    await this.userService.assignRole(userId, assignRoleDto.roleId);

    return {
      message: 'Rol asignado exitosamente',
      code: 'ROLE_ASSIGNED',
    };
  }

  @Delete(':id/roles/:roleId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover rol de usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiParam({ name: 'roleId', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol removido exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para remover roles',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o rol no encontrado',
  })
  async removeRole(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
  ): Promise<MessageResponseDto> {
    await this.userService.removeRole(userId, roleId);

    return {
      message: 'Rol removido exitosamente',
      code: 'ROLE_REMOVED',
    };
  }

  @Get(':id/permissions')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Obtener permisos del usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Permisos obtenidos exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver permisos',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserPermissions(
    @Param('id') id: string,
  ): Promise<{ permissions: string[] }> {
    const permissions = await this.userService.getUserPermissions(id);

    return {
      permissions,
    };
  }

  @Get(':id/roles')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Obtener roles del usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Roles obtenidos exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver roles',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserRoles(@Param('id') id: string): Promise<{ roles: string[] }> {
    const roles = await this.userService.getUserRoles(id);

    return {
      roles,
    };
  }
}
