import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MapsService } from './maps.service';
import { MapsCacheService } from './maps-cache.service';
import { AdminSetting, AdminSettingSchema, MapRoute, MapRouteSchema } from '@mongodb/schemas';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AdminSetting.name, schema: AdminSettingSchema },
            { name: MapRoute.name, schema: MapRouteSchema }
        ]),
    ],
    providers: [MapsService, MapsCacheService],
    exports: [MapsService, MapsCacheService],
})
export class MapsModule { }
