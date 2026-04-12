import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MetadataInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // Extract professional metadata headers
        const platform = request.headers['x-platform'] || 'web';
        const version = request.headers['x-app-version'] || '1.0.0';
        const lang = request.headers['x-lang'] || request.headers['accept-language'] || 'en';

        // Attach to request object for easy access in controllers if needed
        request.metadata = {
            platform,
            version,
            lang: lang.split(',')[0].toLowerCase(),
        };

        return next.handle();
    }
}
