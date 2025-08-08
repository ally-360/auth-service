import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './dtos/register-user.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterService } from './services/register.service';
import { LoginService } from './services/login.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    // TODO: En el futuro migrar a CQRS y usar el patrón de diseño Command
    private readonly _registerService: RegisterService,
    private readonly _loginService: LoginService,
  ) {}

  @Post('/register')
  register(@Body() data: RegisterUserDto) {
    return this._registerService.execute(data);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this._loginService.execute(loginDto);
  }
}
