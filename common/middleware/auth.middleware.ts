// auth.middleware.ts
import { Injectable, NestMiddleware, Next, Req, Res } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

import * as session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: any;
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    if (req.session && req.session.user) {
      console.log(req.session);
      next();
    } else {
      res.redirect('/auth/login');
    }
  }
}
