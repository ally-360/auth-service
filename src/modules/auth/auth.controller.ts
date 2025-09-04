import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Redirect,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  RegisterUserDto,
  LoginDto,
  ReqResetPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  ActivateUserDto,
} from './dtos';
import { RegisterService } from './services/register.service';
import { LoginService } from './services/login.service';
import { ReqResetPasswordService } from './services/req-reset-password.service';
import { ResetPasswordService } from './services/reset-password.service';
import { ChangePasswordService } from './services/change-password.service';
import { VerifyUserService } from './services/verify-user.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { MessageResponseDto } from 'src/common/dtos/message-response.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { LoginResponseDto } from 'src/modules/auth/dtos/login-response.dto';
import { KeycloakAuthService } from './services/keycloak-auth.service';
import { KeycloakLoginDto } from './dtos/keycloak.dto';
import { KeycloakLoginResponseDto } from './dtos/keycloak-response.dto';

@ApiTags('Authentication')
@ApiExtraModels(
  UserResponseDto,
  MessageResponseDto,
  LoginResponseDto,
  KeycloakLoginResponseDto,
)
@Controller()
export class AuthController {
  constructor(
    private readonly _registerService: RegisterService,
    private readonly _loginService: LoginService,
    private readonly _reqResetPasswordService: ReqResetPasswordService,
    private readonly _resetPasswordService: ResetPasswordService,
    private readonly _changePasswordService: ChangePasswordService,
    private readonly _verifyUserService: VerifyUserService,
    private readonly _keycloakAuthService: KeycloakAuthService,
  ) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(UserResponseDto) },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  register(@Body() data: RegisterUserDto) {
    return this._registerService.execute(data);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(LoginResponseDto) },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this._loginService.execute(loginDto);
  }

  @Post('/keycloak/login')
  @ApiOperation({
    summary: 'Login with Keycloak OIDC',
    description:
      'Autentica un usuario utilizando Keycloak y retorna tokens JWT',
  })
  @ApiBody({ type: KeycloakLoginDto })
  @ApiOkResponse({
    description: 'Login successful with Keycloak',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(KeycloakLoginResponseDto) },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or realm not found',
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  async keycloakLogin(@Body() keycloakLoginDto: KeycloakLoginDto) {
    return this._keycloakAuthService.authenticateWithKeycloak(keycloakLoginDto);
  }

  @Patch('/req/reset-password')
  @ApiOperation({ summary: 'Request reset password email' })
  @ApiBody({ type: ReqResetPasswordDto })
  @ApiOkResponse({
    description: 'Reset request accepted',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(MessageResponseDto) },
          },
        },
      ],
    },
  })
  reqResetPassword(@Body() data: ReqResetPasswordDto) {
    return this._reqResetPasswordService.execute(data);
  }

  @Patch('/reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    description: 'Password reset',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(MessageResponseDto) },
          },
        },
      ],
    },
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this._resetPasswordService.execute(resetPasswordDto);
  }

  @Patch('/change-password')
  @ApiOperation({ summary: 'Change password (auth required)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiOkResponse({
    description: 'Password changed',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(MessageResponseDto) },
          },
        },
      ],
    },
  })
  changePassword(
    @GetUser('authId', ParseUUIDPipe) authId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this._changePasswordService.execute(authId, changePasswordDto);
  }

  @Get('/user/:authId/verify')
  @ApiOperation({ summary: 'Verify user via activation link' })
  @ApiOkResponse({
    description: 'Verification processed',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: { success: { type: 'boolean', example: true } },
        },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(MessageResponseDto) },
          },
        },
      ],
    },
  })
  @Redirect('https://ally360.netlify.app/')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  putActivateAccount(
    @Param('authId') authId: string,
    @Query() data: ActivateUserDto,
  ) {
    return this._verifyUserService.execute(authId, data);
  }
}
