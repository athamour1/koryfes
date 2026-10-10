import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';

/**
 * Global app configuration shared by main.ts and the e2e tests, so tests run
 * against the same validation / serialization / proxy behaviour as production.
 */
export function configureApp(app: NestExpressApplication) {
  // Requests arrive through the nginx container; trust only private-network
  // proxies so req.ip (used for rate limiting) is the real client address
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');

  // Global serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Security - configure helmet to allow cross-origin resources
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // Compression
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
}
