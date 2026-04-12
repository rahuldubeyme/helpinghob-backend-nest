import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';
import { Institution, InstitutionSchema } from '@mongodb/schemas/institution.schema';
import { EducationInquiry, EducationInquirySchema } from '@mongodb/schemas/education-inquiry.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Institution.name, schema: InstitutionSchema },
            { name: EducationInquiry.name, schema: EducationInquirySchema },
        ]),
    ],
    controllers: [EducationController],
    providers: [EducationService],
})
export class EducationModule { }
