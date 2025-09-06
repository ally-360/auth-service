import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Param,
  Query,
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
import { AuthEnhancedService } from '../services/auth.enhanced.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  RevokeTokenDto,
  SendEmailVerificationDto,
  VerifyEmailDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  ChangePasswordDto,
  Enable2FADto,
  Disable2FADto,
  Verify2FADto,
  LoginWith2FADto,
} from '../dtos';
import { AuthResponseDto, MessageResponseDto } from '../dtos/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthEnhancedService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.login(
      loginDto.email,
      loginDto.password,
      loginDto.ipAddress,
      loginDto.userAgent,
    );
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
  ): Promise<MessageResponseDto> {
    // TODO: Implementar registro usando AuthEnhancedService
    // const user = await this.authService.register(registerDto);

    return {
      message:
        'Usuario registrado exitosamente. Se ha enviado un email de verificación.',
      code: 'USER_REGISTERED',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiBody({ type: RevokeTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async logout(
    @Request() req: any,
    @Body(ValidationPipe) revokeTokenDto: RevokeTokenDto,
  ): Promise<MessageResponseDto> {
    await this.authService.logout(req.user.id, revokeTokenDto.refreshToken);

    return {
      message: 'Sesión cerrada exitosamente',
      code: 'LOGOUT_SUCCESS',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token renovado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de actualización inválido',
  })
  async refreshToken(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('email/verification/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar código de verificación de email' })
  @ApiBody({ type: SendEmailVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'Código de verificación enviado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async sendEmailVerification(
    @Body(ValidationPipe) sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<MessageResponseDto> {
    await this.authService.sendEmailVerification(
      sendEmailVerificationDto.email,
    );

    return {
      message: 'Código de verificación enviado exitosamente',
      code: 'EMAIL_VERIFICATION_SENT',
    };
  }

  @Post('email/verification/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código de email' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email verificado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Código de verificación inválido o expirado',
  })
  async verifyEmail(
    @Body(ValidationPipe) verifyEmailDto: VerifyEmailDto,
  ): Promise<MessageResponseDto> {
    const verified = await this.authService.verifyEmail(
      verifyEmailDto.email,
      verifyEmailDto.code,
    );

    if (verified) {
      return {
        message: 'Email verificado exitosamente',
        code: 'EMAIL_VERIFIED',
      };
    } else {
      return {
        message: 'Código de verificación inválido o expirado',
        code: 'EMAIL_VERIFICATION_FAILED',
      };
    }
  }

  @Post('password/reset/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar reset de contraseña' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({
    status: 200,
    description: 'Email de reset enviado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async requestPasswordReset(
    @Body(ValidationPipe) requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<MessageResponseDto> {
    await this.authService.requestPasswordReset(
      requestPasswordResetDto.email,
      requestPasswordResetDto.ipAddress,
      requestPasswordResetDto.userAgent,
    );

    return {
      message: 'Email de reset enviado exitosamente',
      code: 'PASSWORD_RESET_SENT',
    };
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetear contraseña' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o contraseña no válida',
  })
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    const reset = await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );

    if (reset) {
      return {
        message: 'Contraseña restablecida exitosamente',
        code: 'PASSWORD_RESET_SUCCESS',
      };
    } else {
      return {
        message: 'Token inválido o expirado',
        code: 'PASSWORD_RESET_FAILED',
      };
    }
  }

  @Post('password/change')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Contraseña cambiada exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 400,
    description: 'Contraseña actual incorrecta o nueva contraseña no válida',
  })
  async changePassword(
    @Request() req: any,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    // TODO: Implementar cambio de contraseña usando UserService
    // const changed = await this.userService.changePassword(
    //   req.user.id,
    //   changePasswordDto.currentPassword,
    //   changePasswordDto.newPassword,
    // );

    return {
      message: 'Contraseña cambiada exitosamente',
      code: 'PASSWORD_CHANGED',
    };
  }

  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Habilitar autenticación de dos factores' })
  @ApiBody({ type: Enable2FADto })
  @ApiResponse({
    status: 200,
    description: '2FA habilitado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async enable2FA(
    @Body(ValidationPipe) enable2FADto: Enable2FADto,
  ): Promise<MessageResponseDto> {
    const result = await this.authService.enable2FA(enable2FADto.userId);

    return {
      message:
        '2FA habilitado exitosamente. Escanea el código QR con tu aplicación de autenticación.',
      code: '2FA_ENABLED',
      data: {
        secret: result.secret,
        qrCode: result.qrCode,
      },
    };
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deshabilitar autenticación de dos factores' })
  @ApiBody({ type: Disable2FADto })
  @ApiResponse({
    status: 200,
    description: '2FA deshabilitado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 400,
    description: 'Código OTP inválido',
  })
  async disable2FA(
    @Body(ValidationPipe) disable2FADto: Disable2FADto,
  ): Promise<MessageResponseDto> {
    const disabled = await this.authService.disable2FA(
      disable2FADto.userId,
      disable2FADto.otpCode,
    );

    if (disabled) {
      return {
        message: '2FA deshabilitado exitosamente',
        code: '2FA_DISABLED',
      };
    } else {
      return {
        message: 'Código OTP inválido',
        code: '2FA_DISABLE_FAILED',
      };
    }
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar código 2FA' })
  @ApiBody({ type: Verify2FADto })
  @ApiResponse({
    status: 200,
    description: 'Código 2FA verificado exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 400,
    description: 'Código OTP inválido',
  })
  async verify2FA(
    @Body(ValidationPipe) verify2FADto: Verify2FADto,
  ): Promise<MessageResponseDto> {
    const verified = await this.authService.verify2FA(
      verify2FADto.userId,
      verify2FADto.otpCode,
    );

    if (verified) {
      return {
        message: 'Código 2FA verificado exitosamente',
        code: '2FA_VERIFIED',
      };
    } else {
      return {
        message: 'Código OTP inválido',
        code: '2FA_VERIFICATION_FAILED',
      };
    }
  }

  @Post('2fa/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con 2FA' })
  @ApiBody({ type: LoginWith2FADto })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión con 2FA exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales o código 2FA inválidos',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async loginWith2FA(
    @Body(ValidationPipe) loginWith2FADto: LoginWith2FADto,
  ): Promise<AuthResponseDto> {
    // TODO: Implementar login con 2FA
    // return await this.authService.loginWith2FA(loginWith2FADto);

    return {
      accessToken: 'mock-token',
      user: {
        id: 'mock-user-id',
        email: loginWith2FADto.email,
        roles: ['user'],
        permissions: ['users:read'],
        is2FAEnabled: true,
      },
      expiresIn: 3600,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener información del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario obtenida exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getCurrentUser(@Request() req: any): Promise<any> {
    // TODO: Implementar obtención de usuario actual
    return {
      id: req.user.id,
      email: req.user.email,
      roles: req.user.roles,
      permissions: req.user.permissions,
      is2FAEnabled: req.user.is2FAEnabled,
    };
  }

  @Post('revoke-all-tokens')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revocar todos los tokens del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Todos los tokens revocados exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async revokeAllTokens(@Request() req: any): Promise<MessageResponseDto> {
    await this.authService.revokeAllUserTokens(req.user.id);

    return {
      message: 'Todos los tokens revocados exitosamente',
      code: 'TOKENS_REVOKED',
    };
  }
}
