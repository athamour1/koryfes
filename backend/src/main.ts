import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  configureApp(app);

  // Close the DB pool cleanly on SIGTERM (docker stop / compose up recreate)
  app.enableShutdownHooks();

  // CORS
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8080';
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });


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
