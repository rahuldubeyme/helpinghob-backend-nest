import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TempMobileDocument = TempMobile & Document;

@Schema({ collection: 'temp_mobiles', timestamps: true })
export class TempMobile {
    @Prop({ required: true })
    mobile: string;

    @Prop({ required: true })
    countryCode: string;

    @Prop({ required: true })
    otp: string;

    @Prop({ default: false })
    isVerify: boolean;

    @Prop()
    validTill: Date;
}

export const TempMobileSchema = SchemaFactory.createForClass(TempMobile);
