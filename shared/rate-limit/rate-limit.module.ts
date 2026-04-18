import { Module, Global, Logger } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Global()
@Module({
    imports: [
        ThrottlerModule.forRoot([{
            ttl: 60000,   // 1 minute window
            limit: 100,   // 100 requests per minute per IP
        }]),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    exports: [ThrottlerModule],
})
export class RateLimitModule {
    private readonly logger = new Logger(RateLimitModule.name);
    constructor() {
        this.logger.log('Global Rate Limiting (Throttler) Active');
    }
}
