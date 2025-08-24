import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Redirect,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActivateUserDto } from './dtos/activate-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { LoginDto } from './dtos/login.dto';
import { ReqResetPasswordDto } from './dtos/req-reset-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { RegisterService } from './services/register.service';
import { LoginService } from './services/login.service';
import { VerifyUserService } from './services/verify-user.service';
import { ReqResetPasswordService } from './services/req-reset-password.service';
import { ResetPasswordService } from './services/reset-password.service';
import { ChangePasswordService } from './services/change-password.service';
import { SelectCompanyService } from './services/select-company.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly _registerService: RegisterService,
    private readonly _loginService: LoginService,
    private readonly _verifyUserService: VerifyUserService,
    private readonly _reqResetPasswordService: ReqResetPasswordService,
    private readonly _resetPasswordService: ResetPasswordService,
    private readonly _changePasswordService: ChangePasswordService,
    private readonly _selectCompanyService: SelectCompanyService,
  ) {}

  @Post('/register')
  register(@Body() data: RegisterUserDto) {
    return this._registerService.execute(data);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this._loginService.execute(loginDto);
  }

  @Patch('/req/reset-password')
  reqResetPassword(@Body() data: ReqResetPasswordDto) {
    return this._reqResetPasswordService.execute(data);
  }

  @Patch('/reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this._resetPasswordService.execute(resetPasswordDto);
  }

  @Patch('/change-password')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  changePassword(
    @GetUser('authId', ParseUUIDPipe) authId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this._changePasswordService.execute(authId, changePasswordDto);
  }

  @Get('/user/:authId/verify')
  @Redirect('https://ally360.netlify.app/')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  putActivateAccount(
    @Param('authId') authId: string,
    @Query() data: ActivateUserDto,
  ) {
    return this._verifyUserService.execute(authId, data);
  }

  @Get('/user/select-company')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  getUserCompany(
    @GetUser('authId', ParseUUIDPipe) authId: string,
    @GetUser('email') email: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
  ) {
    return this._selectCompanyService.execute(companyId, { authId, email });
  }
}
