import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KeycloakManagementService } from 'src/infrastructure/services/keycloak-management.service';

export class CreateRealmDto {
  companyName: string;
  description?: string;
}

export class CreateUserDto {
  realmName: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export class AssignRoleDto {
  realmName: string;
  userId: string;
  roleName: string;
}

@ApiTags('Keycloak Management')
@Controller('v1/keycloak')
export class KeycloakManagementController {
  private readonly logger = new Logger(KeycloakManagementController.name);

  constructor(
    private readonly keycloakManagementService: KeycloakManagementService,
  ) {}

  @Post('realm')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo realm para una empresa' })
  @ApiResponse({
    status: 201,
    description: 'Realm creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos enviados',
  })
  async createRealm(@Body() realmData: CreateRealmDto) {
    this.logger.log(`Creating realm for company: ${realmData.companyName}`);

    const result =
      await this.keycloakManagementService.createRealmForCompany(realmData);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Realm created successfully',
      data: { result },
    };
  }

  @Post('user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario en Keycloak' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
  })
  async createUser(@Body() userData: CreateUserDto) {
    this.logger.log(
      `Creating user: ${userData.username} in realm: ${userData.realmName}`,
    );

    const userId = await this.keycloakManagementService.createUser(userData);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: { userId },
    };
  }

  @Post('assign-role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Asignar rol a un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol asignado exitosamente',
  })
  async assignRole(@Body() roleData: AssignRoleDto) {
    this.logger.log(
      `Assigning role ${roleData.roleName} to user ${roleData.userId} in realm ${roleData.realmName}`,
    );

    await this.keycloakManagementService.assignRoleToUser(
      roleData.realmName,
      roleData.userId,
      roleData.roleName,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Role assigned successfully',
    };
  }
}
