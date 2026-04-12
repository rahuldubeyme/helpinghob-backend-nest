import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MerchantDocument = Merchant & Document;

@Schema({ collection: 'merchants', timestamps: true })
export class Merchant {
    @Prop() businessName: string;
    @Prop() email: string;
    @Prop() phone: string;
    @Prop() countryCode: string;
    @Prop() profilePicture: string;
    @Prop({ type: [Number], index: '2dsphere', default: [0, 0] }) location: number[];
    @Prop({ default: false }) isDeleted: boolean;
    @Prop({ default: true }) isActive: boolean;
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
