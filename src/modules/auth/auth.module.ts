import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Auth } from './entities/auth.entity';
import { AuthController } from './auth.controller';
import { AuthServices } from './services';
import { DefaultStrategy } from 'src/common/constants/app/jwt.app';
import { EncoderAdapter } from 'src/infrastructure/adapters/encoder.adapter';
import { GenstrAdapter } from 'src/infrastructure/adapters/genstr.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
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
  ],
  controllers: [AuthController],
  providers: [...AuthServices, EncoderAdapter, GenstrAdapter],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
