import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MapsService } from './maps.service';
import { AdminSetting, AdminSettingSchema } from '@mongodb/schemas/admin-settings.schema';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AdminSetting.name, schema: AdminSettingSchema }
        ]),
    ],
    providers: [MapsService],
    exports: [MapsService],
})
export class MapsModule { }
