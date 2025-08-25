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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
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

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(
    private readonly _registerService: RegisterService,
    private readonly _loginService: LoginService,
    private readonly _reqResetPasswordService: ReqResetPasswordService,
    private readonly _resetPasswordService: ResetPasswordService,
    private readonly _changePasswordService: ChangePasswordService,
    private readonly _verifyUserService: VerifyUserService,
  ) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    schema: { example: { message: 'RegisterService.execute' } },
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
    schema: { example: { accessToken: 'LoginService.execute' } },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this._loginService.execute(loginDto);
  }

  @Patch('/req/reset-password')
  @ApiOperation({ summary: 'Request reset password email' })
  @ApiBody({ type: ReqResetPasswordDto })
  @ApiOkResponse({
    description: 'Reset request accepted',
    schema: { example: { message: 'ReqResetPasswordService.execute' } },
  })
  reqResetPassword(@Body() data: ReqResetPasswordDto) {
    return this._reqResetPasswordService.execute(data);
  }

  @Patch('/reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    description: 'Password reset',
    schema: { example: { message: 'ResetPasswordService.execute' } },
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
    schema: { example: { message: 'ChangePasswordService.execute' } },
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
    description: 'Redirect to app',
    schema: { example: { redirect: true } },
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
