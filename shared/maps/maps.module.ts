import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MapsService } from './maps.service';
import { MapsCacheService } from './maps-cache.service';
import { AdminSetting, AdminSettingSchema, MapRoute, MapRouteSchema, MapApiHit, MapApiHitSchema } from '@mongodb/schemas';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AdminSetting.name, schema: AdminSettingSchema },
            { name: MapRoute.name, schema: MapRouteSchema },
            { name: MapApiHit.name, schema: MapApiHitSchema }
        ]),
    ],
    providers: [MapsService, MapsCacheService],
    exports: [MapsService, MapsCacheService],
})
export class MapsModule { }
