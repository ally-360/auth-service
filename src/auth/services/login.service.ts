import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EncoderAdapter } from 'src/infrastructure/adapters';
import { LoginDto } from '../dtos';
import { UAE } from 'src/common/exceptions/exception.string';
import { FindUserService } from 'src/modules/user/services/find-user.service';

@Injectable()
export class LoginService {
  private _logger = new Logger(LoginService.name);
  constructor(
    private readonly _findUserService: FindUserService,
    private readonly _encoderAdapter: EncoderAdapter,
    private readonly _jwtService: JwtService,
  ) {}

  async execute(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;

    const userExists = await this._findUserService.execute(
      { email },
      { companies: true },
    );

    const passwordChecked = await this._encoderAdapter.checkPassword(
      password,
      userExists.password,
    );

    if (!passwordChecked) {
      this._logger.warn(`Falló en inicio de sesión: ${userExists.id}`);
      throw new UnauthorizedException(UAE.UNAUTHORIZED);
    }

    if (!userExists.verified) {
      throw new UnauthorizedException(UAE.USER_UNVERIFY);
    }

    delete userExists.password;
    // TODO: Identificar la o las empresas del usuario
    /*
     * [company - company]
     * [company]
     */

    return {
      accessToken: this._jwtService.sign({
        id: userExists.id,
        email: userExists.email,
        authId: userExists.authId,
        selectedCompanyId: null, // TODO: Agregar el id de la empresa inicial
        // TODO: Agregar el rol del usuario
      }),
    };
  }
}
