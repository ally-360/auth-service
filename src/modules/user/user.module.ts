import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { DefaultStrategy } from 'src/common/constants/app/jwt.app';
import { JwtStrategy } from '../auth/jwt/jwt.strategy';
import { User } from 'src/modules/auth/entities/user.entity';
import { Profile } from 'src/modules/auth/entities/profile.entity';
import { UserServices } from './services';
import { UserRepository } from 'src/modules/user/repositories/user.repository';

@Module({
  imports: [
    PassportModule.register(DefaultStrategy),
    TypeOrmModule.forFeature([User, Profile]),
  ],
  controllers: [UsersController],
  providers: [...UserServices, UserRepository, JwtStrategy],
  exports: [...UserServices, UserRepository],
})
export class UserModule {}
