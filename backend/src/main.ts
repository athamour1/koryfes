import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  // In production: __dirname = /usr/src/app/dist/src, so we need '../..' to reach /usr/src/app
  // In development: __dirname = /backend/src, so we need '..' to reach /backend
  const uploadsPath = process.env.NODE_ENV === 'production'
    ? join(__dirname, '..', '..', 'uploads')
    : join(__dirname, '..', 'uploads');

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Global serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Security - configure helmet to allow cross-origin resources
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // Compression
  app.use(compression());

  // CORS
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8080';
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger API Documentation (Development Only)
  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('Korifes API')
      .setDescription('REST API for Korifes Management System')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    console.log(`📚 Swagger documentation available at: http://localhost:${process.env.PORT || 3000}/api-docs`);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${corsOrigin}`);
}
bootstrap();
