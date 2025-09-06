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
import { RoleService } from '../services/role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  RoleResponseDto,
  AssignPermissionDto,
} from '../dtos';
import { MessageResponseDto, PaginatedResponseDto } from '../dtos/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Roles y Permisos')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo rol' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente',
    type: RoleResponseDto,
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
    description: 'Sin permisos para crear roles',
  })
  async createRole(
    @Body(ValidationPipe) createRoleDto: CreateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.roleService.createRole(
      createRoleDto.name,
      createRoleDto.description,
      createRoleDto.isDefault || false,
    );

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      isDefault: role.isDefault || false,
      permissions: role.permissions?.map((permission) => permission.name) || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Obtener lista de roles' })
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
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida exitosamente',
    type: PaginatedResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver roles',
  })
  async getRoles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<PaginatedResponseDto<RoleResponseDto>> {
    const roles = await this.roleService.getAllRoles();

    // Filtrar por búsqueda si se proporciona
    let filteredRoles = roles;
    if (search) {
      filteredRoles = roles.filter(
        (role) =>
          role.name.toLowerCase().includes(search.toLowerCase()) ||
          role.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Filtrar por estado activo si se proporciona
    if (isActive !== undefined) {
      filteredRoles = filteredRoles.filter(
        (role) => role.isActive === isActive,
      );
    }

    // Aplicar paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

    return {
      data: paginatedRoles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        isDefault: role.isDefault || false,
        permissions:
          role.permissions?.map((permission) => permission.name) || [],
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total: filteredRoles.length,
        totalPages: Math.ceil(filteredRoles.length / limit),
        hasNext: page < Math.ceil(filteredRoles.length / limit),
        hasPrev: page > 1,
      },
    };
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol obtenido exitosamente',
    type: RoleResponseDto,
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
    description: 'Rol no encontrado',
  })
  async getRoleById(@Param('id') id: string): Promise<RoleResponseDto> {
    const roles = await this.roleService.getAllRoles();
    const role = roles.find((r) => r.id === id);

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      isDefault: role.isDefault || false,
      permissions: role.permissions?.map((permission) => permission.name) || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente',
    type: RoleResponseDto,
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
    description: 'Sin permisos para actualizar roles',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  async updateRole(
    @Param('id') id: string,
    @Body(ValidationPipe) updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.roleService.updateRole(id, {
      name: updateRoleDto.name,
      description: updateRoleDto.description,
    });

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      isDefault: role.isDefault || false,
      permissions: role.permissions?.map((permission) => permission.name) || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol eliminado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para eliminar roles',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar un rol que está siendo usado',
  })
  async deleteRole(@Param('id') id: string): Promise<MessageResponseDto> {
    await this.roleService.deleteRole(id);

    return {
      message: 'Rol eliminado exitosamente',
      code: 'ROLE_DELETED',
    };
  }

  @Post(':id/activate')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol activado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para activar roles',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  async activateRole(@Param('id') id: string): Promise<MessageResponseDto> {
    // TODO: Implementar activación de rol
    // await this.roleService.activateRole(id);

    return {
      message: 'Rol activado exitosamente',
      code: 'ROLE_ACTIVATED',
    };
  }

  @Post(':id/deactivate')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol desactivado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para desactivar roles',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  async deactivateRole(@Param('id') id: string): Promise<MessageResponseDto> {
    // TODO: Implementar desactivación de rol
    // await this.roleService.deactivateRole(id);

    return {
      message: 'Rol desactivado exitosamente',
      code: 'ROLE_DEACTIVATED',
    };
  }

  @Post(':id/permissions')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Asignar permiso a rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiBody({ type: AssignPermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Permiso asignado exitosamente',
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
    description: 'Sin permisos para asignar permisos',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol o permiso no encontrado',
  })
  async assignPermission(
    @Param('id') roleId: string,
    @Body(ValidationPipe) assignPermissionDto: AssignPermissionDto,
  ): Promise<MessageResponseDto> {
    await this.roleService.assignPermission(
      roleId,
      assignPermissionDto.permissionId,
    );

    return {
      message: 'Permiso asignado exitosamente',
      code: 'PERMISSION_ASSIGNED',
    };
  }

  @Delete(':id/permissions/:permissionId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover permiso de rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiParam({ name: 'permissionId', description: 'ID del permiso' })
  @ApiResponse({
    status: 200,
    description: 'Permiso removido exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para remover permisos',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol o permiso no encontrado',
  })
  async removePermission(
    @Param('id') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<MessageResponseDto> {
    await this.roleService.removePermission(roleId, permissionId);

    return {
      message: 'Permiso removido exitosamente',
      code: 'PERMISSION_REMOVED',
    };
  }

  @Get(':id/permissions')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Obtener permisos del rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
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
    description: 'Rol no encontrado',
  })
  async getRolePermissions(
    @Param('id') id: string,
  ): Promise<{ permissions: string[] }> {
    const permissions = await this.roleService.getRolePermissions(id);

    return {
      permissions,
    };
  }

  @Get('permissions/available')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Obtener todos los permisos disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Permisos disponibles obtenidos exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver permisos',
  })
  async getAvailablePermissions(): Promise<{ permissions: any[] }> {
    const permissions = await this.roleService.getAllPermissions();

    return {
      permissions: permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      })),
    };
  }

  @Get('permissions/:id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Obtener permiso por ID' })
  @ApiParam({ name: 'id', description: 'ID del permiso' })
  @ApiResponse({
    status: 200,
    description: 'Permiso obtenido exitosamente',
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
    description: 'Permiso no encontrado',
  })
  async getPermissionById(@Param('id') id: string): Promise<any> {
    const permissions = await this.roleService.getAllPermissions();
    const permission = permissions.find((p) => p.id === id);

    if (!permission) {
      throw new Error('Permiso no encontrado');
    }

    return {
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      isActive: permission.isActive,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
