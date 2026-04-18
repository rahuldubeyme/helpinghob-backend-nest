import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AllExceptionsFilter } from '@filters/all-exceptions.filter';
import {
  LoggingInterceptor,
  TimeoutInterceptor,
  RpcTimeoutInterceptor,
} from '@interceptors/index';
import compression from 'compression';

export function setupGlobalConfig(app: INestApplication) {
  // Body Parser — tightened limit for security
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(compression({ threshold: 512 }));

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global Interceptors — single call, all interceptors together
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
    new RpcTimeoutInterceptor(reflector),
  );

  // Global Filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS — restrict origins in production
  const allowedOrigins = [
    process.env.SITE_URL,
    process.env.WEB_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' && allowedOrigins.length
      ? allowedOrigins
      : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 'Authorization', 'accept-language',
      'x-platform', 'x-app-version', 'x-lang',
    ],
    credentials: true,
  });
}
