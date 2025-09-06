import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthServices } from './services';
import { DefaultStrategy } from 'src/common/constants/app/jwt.app';
import { EncoderAdapter } from 'src/infrastructure/adapters/encoder.adapter';
import { GenstrAdapter } from 'src/infrastructure/adapters/genstr.adapter';
import { JwtStrategy } from './jwt/jwt.strategy';
import { UserModule } from '../user/user.module';
import * as Controllers from './controllers';
import { Guards } from './guards';
import { Interceptors } from './interceptors';
import { Repositories } from './repositories';
import { Entities } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([...Entities]),
    PassportModule.register(DefaultStrategy),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('security.jwtSecret'),
        signOptions: {
          expiresIn: config.get('security.jwtExpiresIn'),
        },
      }),
    }),
    UserModule,
  ],
  controllers: [...Object.values(Controllers)],
  providers: [
    ...AuthServices,
    ...Repositories,
    ...Guards,
    ...Interceptors,
    EncoderAdapter,
    GenstrAdapter,
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: Interceptors[0], // LoggingInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: Interceptors[1], // ResponseTransformInterceptor
    },
  ],
  exports: [JwtModule, PassportModule, ...AuthServices, ...Repositories],
})
export class AuthModule {}
