import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { configuration } from './config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

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
        return addTransactionalDataSource(
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
