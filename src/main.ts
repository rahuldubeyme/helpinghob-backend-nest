import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { join } from 'path';
import initSwagger from '@swagger/index';
import { setupGlobalConfig } from '@config/global.config';
import { JwtUtility } from '@common/utils/jwt.utility';

async function bootstrap() {
  const httpsOptions =
    process.env.SERVER_MODE === 'https'
      ? {
          key: fs.readFileSync(process.env.SSL_KEY_PATH || '', 'utf8'),
          cert: fs.readFileSync(process.env.SSL_CERT_PATH || '', 'utf8'),
          ca: process.env.SSL_CA_PATH ? fs.readFileSync(process.env.SSL_CA_PATH, 'utf8') : undefined,
        }
      : undefined;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['log', 'debug', 'error', 'warn', 'verbose'],
  });

  const configService = app.get(ConfigService);
  JwtUtility.init(configService);

  setupGlobalConfig(app);

  // Swagger only in non-production
  if (process.env.NODE_ENV !== 'production') {
    await initSwagger(app);
  }

  app.useStaticAssets(join(__dirname, '..', 'static'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`[Bootstrap] Server running on port ${port} [${process.env.NODE_ENV}]`);
}

bootstrap().catch(err => {
  console.error('[Bootstrap] Fatal error during startup:', err);
  process.exit(1);
});
