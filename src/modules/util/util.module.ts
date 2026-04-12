import { Module } from '@nestjs/common';
import { S3Service } from './util.service';
import { UtilController } from './util.controller';

@Module({
    providers: [S3Service],
    controllers: [UtilController],
    exports: [S3Service]
})
export class UtilModule { }
