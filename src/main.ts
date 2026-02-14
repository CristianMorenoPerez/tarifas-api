import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Tarifas API')
    .setDescription('Api para consultar las tarifas de energia')
    .setVersion('1.0')
    .addTag('tarifas')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

    app.setGlobalPrefix('api/v2');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    })
  );

  await app.listen(envs.port ?? 3000);
  logger.log(`App running on port ${envs.port}`);
}
bootstrap();
