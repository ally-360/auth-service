import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllyExceptionInterceptor } from './infrastructure/interceptors/exception.interceptor';
import { ResponseInterceptor } from './infrastructure/interceptors/response.interceptor';
import { CONFIG_DEFAULT } from './config/config.default';
import { TypeormTransactionalAdapter } from './infrastructure/adapters/transactional.adapter';

async function bootstrap() {
  new TypeormTransactionalAdapter().initialize();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(`auth`);
  const configService = app.get(ConfigService);

  // Enable validation and transformation globally
  app.useGlobalPipes(new ValidationPipe({ forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(
    new AllyExceptionInterceptor(),
    new ResponseInterceptor(),
  );

  if (configService.get('app.enableSwagger')) {
    const config = new DocumentBuilder()
      .setTitle('Auth Service')
      .setDescription('API docs for Auth Service')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(configService.get('app.port') || CONFIG_DEFAULT.app.port);
}
void bootstrap();
