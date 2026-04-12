import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          this.logger.log(
            `${method} ${originalUrl} ${res.statusCode} - ${Date.now() - now}ms`,
          );
        },
        error: (err) => {
          this.logger.error(
            `${method} ${originalUrl} ${err?.status || 500} - ${Date.now() - now}ms - ${err?.message}`,
          );
        },
      }),
    );
  }
}
