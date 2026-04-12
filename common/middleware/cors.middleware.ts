import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) { } // Inject ConfigService

  use(req: Request, res: Response, next: NextFunction) {
    const corsOptions = {
      origin: '*',
      // origin: [
      //   this.configService.get('SITE_URL'),
      //   this.configService.get('WEB_URL'),
      // ], // Allowed origins
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'accept-language',
        'x-fivra-platform',
        'x-fivra-version',
      ], // Allowed headers
    };
    cors(corsOptions)(req, res, next);
  }
}
