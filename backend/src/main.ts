import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupSwagger } from './config/swagger.config.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('API_PREFIX') ?? 'api/v1';
  const port = configService.get<number>('PORT') ?? 3000;
  const isProd = configService.get<string>('NODE_ENV') === 'production';

  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') ?? true,
    credentials: true,
  });

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (!isProd) {
    setupSwagger(app, `${apiPrefix}/docs`);
  }

  await app.listen(port);

  console.log(`Application: http://localhost:${port}/${apiPrefix}/health`);
  if (!isProd) {
    console.log(`Swagger:     http://localhost:${port}/${apiPrefix}/docs`);
  }
}
bootstrap();