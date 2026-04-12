import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebController } from './web.controller';
import { WebService } from './web.service';
import { MasterService, MasterServiceSchema } from '@mongodb/schemas/master-service.schema';
import { SubCategory, SubCategorySchema } from '@mongodb/schemas/sub-category.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: MasterService.name, schema: MasterServiceSchema },
            { name: SubCategory.name, schema: SubCategorySchema },
        ]),
    ],
    controllers: [WebController],
    providers: [WebService],
    exports: [WebService],
})
export class WebModule { }
