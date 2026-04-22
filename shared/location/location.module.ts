import { Module, Global } from '@nestjs/common';
import { LocationThrottlingService } from './location-throttling.service';

@Global()
@Module({
    providers: [LocationThrottlingService],
    exports: [LocationThrottlingService],
})
export class LocationModule { }
