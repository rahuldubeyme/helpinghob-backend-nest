import { Module, Global, Logger } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Global()
@Module({
    imports: [
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100000,
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
