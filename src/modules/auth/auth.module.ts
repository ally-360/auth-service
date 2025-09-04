import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
} from 'nest-keycloak-connect';
import { AuthController } from './auth.controller';
import { KeycloakController } from './controllers/keycloak.controller';
import { KeycloakManagementController } from './controllers/keycloak-management.controller';
import { AuthServices } from './services';
import { DefaultStrategy } from 'src/common/constants/app/jwt.app';
import { EncoderAdapter } from 'src/infrastructure/adapters/encoder.adapter';
import { GenstrAdapter } from 'src/infrastructure/adapters/genstr.adapter';
import { KeycloakAdapter } from 'src/infrastructure/adapters/keycloak.adapter';
import { KeycloakManagementService } from 'src/infrastructure/services/keycloak-management.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { KeycloakJwtStrategy } from './strategies/keycloak-jwt.strategy';
import { KeycloakMultiTenantService } from './services/keycloak-multitenant.service';
import { KeycloakAuthService } from './services/keycloak-auth.service';
import { UserModule } from '../user/user.module';
import { createKeycloakOptions } from 'src/config/keycloak.config';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature(),
    PassportModule.register(DefaultStrategy),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt').secret,
        signOptions: {
          expiresIn: config.get('jwt').expire_in,
        },
      }),
    }),
    KeycloakConnectModule.registerAsync({
      useFactory: createKeycloakOptions,
      inject: [ConfigService],
    }),
    UserModule,
  ],
  controllers: [
    AuthController,
    KeycloakController,
    KeycloakManagementController,
  ],
  providers: [
    ...AuthServices,
    EncoderAdapter,
    GenstrAdapter,
    KeycloakAdapter,
    KeycloakManagementService,
    KeycloakMultiTenantService,
    KeycloakAuthService,
    JwtStrategy,
    KeycloakJwtStrategy,
    // Validar si se necesita
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: ResourceGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RoleGuard,
    // },
  ],
  exports: [
    JwtModule,
    PassportModule,
    KeycloakAdapter,
    KeycloakManagementService,
    KeycloakMultiTenantService,
    KeycloakAuthService,
    KeycloakJwtStrategy,
  ],
})
export class AuthModule {}
