import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { KeycloakMultiTenantService } from '../services/keycloak-multitenant.service';
import {
  CreateCompanyRealmDto,
  AddUserToCompanyDto,
  RegisterInGenericRealmDto,
  VerifyKeycloakUserDto,
  ChangeKeycloakPasswordDto,
} from '../dtos/keycloak.dto';
import {
  CreateCompanyRealmResponseDto,
  AddUserToCompanyResponseDto,
  RegisterInGenericRealmResponseDto,
  KeycloakOperationResponseDto,
} from '../dtos/keycloak-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Auth } from '../decorators/auth.decorator';
import { ValidRoles } from '../../../common/constants/app/valid-roles.app';

/**
 * Controlador para operaciones multi-tenant con Keycloak
 * Maneja la creación de realms, usuarios y asignación de roles
 */
@ApiTags('Keycloak Multi-Tenant')
@Controller('keycloak')
export class KeycloakController {
  constructor(
    private readonly _keycloakMultiTenantService: KeycloakMultiTenantService,
  ) {}

  /**
   * Crea un nuevo realm para una empresa y asigna al usuario propietario
   */
  @Post('realm/company')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear realm de empresa',
    description:
      'Crea un nuevo realm en Keycloak para una empresa y asigna al usuario como Admin',
  })
  @ApiBody({ type: CreateCompanyRealmDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Realm creado exitosamente',
    type: CreateCompanyRealmResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o realm ya existe',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error interno del servidor',
  })
  async createCompanyRealm(
    @Body() createCompanyRealmDto: CreateCompanyRealmDto,
  ): Promise<CreateCompanyRealmResponseDto> {
    const result =
      await this._keycloakMultiTenantService.createCompanyRealmAndAssignOwner(
        {
          name: createCompanyRealmDto.companyName,
          companyId: createCompanyRealmDto.companyId,
        },
        {
          email: createCompanyRealmDto.ownerEmail,
          firstName: createCompanyRealmDto.ownerFirstName,
          lastName: createCompanyRealmDto.ownerLastName,
          authId: createCompanyRealmDto.ownerAuthId,
        },
      );

    return {
      realmName: result.realmName,
      keycloakUserId: result.keycloakUserId,
      temporaryPassword: result.temporaryPassword,
      realmUrl: `${process.env.KC_ISSUER?.replace('/realms/master', '')}/realms/${result.realmName}`,
      message: 'Realm creado exitosamente con usuario propietario',
    };
  }

  /**
   * Registra un usuario en el realm genérico de Ally360
   */
  @Post('user/register-generic')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar usuario en realm genérico',
    description:
      'Registra un nuevo usuario en el realm genérico antes de crear su empresa',
  })
  @ApiBody({ type: RegisterInGenericRealmDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    type: RegisterInGenericRealmResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Usuario ya existe o datos inválidos',
  })
  async registerUserInGenericRealm(
    @Body() registerDto: RegisterInGenericRealmDto,
  ): Promise<RegisterInGenericRealmResponseDto> {
    const result =
      await this._keycloakMultiTenantService.registerUserInGenericRealm({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        authId: registerDto.authId,
      });

    return {
      keycloakUserId: result.keycloakUserId,
      temporaryPassword: result.temporaryPassword,
      realmName: 'ally',
      message: 'Usuario registrado en realm genérico exitosamente',
    };
  }

  /**
   * Agrega un usuario a un realm de empresa existente
   */
  @Post('user/add-to-company')
  @HttpCode(HttpStatus.CREATED)
  // @Auth(ValidRoles.admin, ValidRoles.owner)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Agregar usuario a empresa',
    description:
      'Agrega un usuario existente a un realm de empresa con un rol específico',
  })
  @ApiBody({ type: AddUserToCompanyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario agregado exitosamente a la empresa',
    type: AddUserToCompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permisos insuficientes',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Usuario ya existe en la empresa o datos inválidos',
  })
  async addUserToCompany(
    @Body() addUserDto: AddUserToCompanyDto,
  ): Promise<AddUserToCompanyResponseDto> {
    const result = await this._keycloakMultiTenantService.addUserToCompanyRealm(
      addUserDto.realmName,
      {
        email: addUserDto.email,
        firstName: addUserDto.firstName,
        lastName: addUserDto.lastName,
        authId: addUserDto.authId,
        companyId: addUserDto.companyId,
      },
      addUserDto.roleName,
    );

    return {
      keycloakUserId: result.keycloakUserId,
      temporaryPassword: result.temporaryPassword,
      assignedRole: addUserDto.roleName,
      realmName: addUserDto.realmName,
      message: 'Usuario agregado exitosamente a la empresa',
    };
  }

  /**
   * Verifica un usuario en Keycloak (marca emailVerified como true)
   */
  @Patch('user/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar usuario',
    description: 'Marca un usuario como verificado en Keycloak',
  })
  @ApiBody({ type: VerifyKeycloakUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario verificado exitosamente',
    type: KeycloakOperationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  async verifyUser(
    @Body() verifyUserDto: VerifyKeycloakUserDto,
  ): Promise<KeycloakOperationResponseDto> {
    await this._keycloakMultiTenantService.verifyUser(
      verifyUserDto.realmName,
      verifyUserDto.keycloakUserId,
    );

    return {
      success: true,
      message: 'Usuario verificado exitosamente',
      data: {
        realmName: verifyUserDto.realmName,
        userId: verifyUserDto.keycloakUserId,
      },
    };
  }

  /**
   * Actualiza la contraseña de un usuario en Keycloak
   */
  @Patch('user/password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar contraseña de usuario',
    description: 'Actualiza la contraseña de un usuario en un realm específico',
  })
  @ApiBody({ type: ChangeKeycloakPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contraseña actualizada exitosamente',
    type: KeycloakOperationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  async changeUserPassword(
    @Body() changePasswordDto: ChangeKeycloakPasswordDto,
  ): Promise<KeycloakOperationResponseDto> {
    await this._keycloakMultiTenantService.updateUserPassword(
      changePasswordDto.realmName,
      changePasswordDto.keycloakUserId,
      changePasswordDto.newPassword,
    );

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
      data: {
        realmName: changePasswordDto.realmName,
        userId: changePasswordDto.keycloakUserId,
      },
    };
  }

  /**
   * Endpoint de salud para verificar conexión con Keycloak
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar salud del servicio Keycloak',
    description:
      'Endpoint para verificar que el servicio puede conectarse a Keycloak',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Servicio funcionando correctamente',
    type: KeycloakOperationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Error de conexión con Keycloak',
  })
  healthCheck(): KeycloakOperationResponseDto {
    // TODO: Implementar verificación de salud con Keycloak
    return {
      success: true,
      message: 'Keycloak Multi-Tenant Service está funcionando correctamente',
      data: {
        timestamp: new Date().toISOString(),
        keycloakAvailable: true, // Implementar verificación real
      },
    };
  }
}
