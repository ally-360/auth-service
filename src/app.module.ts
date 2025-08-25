import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { configuration } from './config';
import { DataSource } from 'typeorm';
import { TypeormTransactionalAdapter } from './infrastructure/adapters/transactional.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        ...config.get<TypeOrmModuleOptions>('database'),
      }),
      inject: [ConfigService],
      async dataSourceFactory(options) {
        if (!options) throw new Error('Invalid options passed');
        return new TypeormTransactionalAdapter().create(
          await new DataSource(options).initialize(),
        );
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
