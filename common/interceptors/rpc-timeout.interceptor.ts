// rpc-timeout.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, timeout, retry, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RpcTimeoutInterceptor implements NestInterceptor {
    private readonly logger = new Logger('RPC');

    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const handlerName = context.getHandler().name;
        const className = context.getClass().name;
        const apiName = `${className}.${handlerName}`;

        const timeoutMs = this.reflector.get<number>('rpc:timeout', context.getHandler()) || 10000;
        const retryCount = this.reflector.get<number>('rpc:retry', context.getHandler()) || 0;

        const start = Date.now();
        this.logger.log(`[START] ${apiName} - Timeout: ${timeoutMs}ms Retry: ${retryCount}`);

        return next.handle().pipe(
            timeout(timeoutMs),
            retry(retryCount),
            tap({
                next: () => {
                    const duration = Date.now() - start;
                    this.logger.log(`[SUCCESS] ${apiName} - Duration: ${duration}ms`);
                },
                error: (err) => {
                    const duration = Date.now() - start;
                    if (err?.name === 'TimeoutError') {
                        this.logger.error(`[TIMEOUT] ${apiName} - No response within ${timeoutMs}ms`);
                    } else {
                        this.logger.error(`[ERROR] ${apiName} - ${err?.message} - Duration: ${duration}ms`);
                    }
                },
            }),
        );
    }
}
