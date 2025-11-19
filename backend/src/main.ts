import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${corsOrigin}`);
}
bootstrap();
