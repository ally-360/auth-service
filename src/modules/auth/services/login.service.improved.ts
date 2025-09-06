import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { EncoderAdapter } from 'src/infrastructure/adapters';
import { LoginDto } from '../dtos';
import { FindUserService } from 'src/modules/user/services/find-user.service';
import { Email, Password } from 'src/common/value-objects';
import { NativeLoggerService } from 'src/infrastructure/logger/native-logger.service';

@Injectable()
export class LoginServiceImproved {
  constructor(
    private readonly _findUserService: FindUserService,
    private readonly _encoderAdapter: EncoderAdapter,
    private readonly _jwtService: JwtService,
    private readonly _i18n: I18nService,
    @Inject(NativeLoggerService) private readonly _logger: NativeLoggerService,
  ) {
    this._logger.setContext(LoginServiceImproved.name);
  }

  async execute(loginDto: LoginDto): Promise<{ accessToken: string }> {
    // Validar email usando Value Object
    let email: Email;
    try {
      email = new Email(loginDto.email);
    } catch (error) {
      this._logger.logAuthError(
        'login',
        'Invalid email format',
        undefined,
        loginDto.email,
      );
      throw new UnauthorizedException(
        this._i18n.t('common.validation.email_invalid'),
      );
    }

    // Validar password usando Value Object
    let password: Password;
    try {
      password = new Password(loginDto.password);
    } catch (error) {
      this._logger.logAuthError(
        'login',
        'Invalid password format',
        undefined,
        email.getValue(),
      );
      throw new UnauthorizedException(
        this._i18n.t('common.validation.password_weak'),
      );
    }

    this._logger.logAuth('login_attempt', undefined, email.getValue());

    // Buscar usuario
    const userExists = await this._findUserService.execute({
      email: email.getValue(),
    });

    // Verificar contraseña
    const passwordChecked = await this._encoderAdapter.checkPassword(
      password.getValue(),
      userExists.password,
    );

    if (!passwordChecked) {
      this._logger.logAuthError(
        'login',
        'Invalid credentials',
        userExists.id.toString(),
        email.getValue(),
      );
      throw new UnauthorizedException(this._i18n.t('common.auth.login.failed'));
    }

    if (!userExists.verified) {
      this._logger.logAuthError(
        'login',
        'User not verified',
        userExists.id.toString(),
        email.getValue(),
      );
      throw new UnauthorizedException(
        this._i18n.t('common.auth.login.requires_verification'),
      );
    }

    // TODO: Identificar la o las empresas del usuario
    /*
     * [company - company]
     * [company]
     */

    this._logger.logAuth(
      'login_success',
      userExists.id.toString(),
      email.getValue(),
    );

    return {
      accessToken: this._jwtService.sign({
        id: userExists.id,
        email: userExists.email,
        authId: userExists.authId,
        selectedCompanyId: null, // TODO: Agregar el id de la empresa inicial
        role: 'user', // TODO: Agregar el rol del usuario desde la base de datos
      }),
    };
  }
}
