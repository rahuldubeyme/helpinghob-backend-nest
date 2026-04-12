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
  // Body Parser and Compression
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
  app.use(compression({ threshold: 512 }));

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
  );

  // Global Filters
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new RpcTimeoutInterceptor(reflector));
  // const httpAdapter = app.getHttpAdapter();
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS
  app.enableCors();
}
