import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InstitutionDocument = Institution & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class Institution {
    @Prop({ type: Number, required: true, index: true })
    masterServiceId: number; // references MasterService.serviceId (e.g. 1001)

    @Prop({ type: Types.ObjectId, ref: 'ServiceCategory' })
    categoryId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'SubCategory' }] })
    subCategoryId: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }] })
    serviceId: Types.ObjectId[];

    @Prop()
    type: string;

    @Prop()
    image: string;

    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop({ type: [String] })
    imageGallery: string[];

    @Prop({ type: [Number] })
    location: number[];

    @Prop()
    address: string;

    @Prop()
    totalRating: string;

    @Prop()
    avgRating: string;

    @Prop()
    fee: string;

    @Prop({ default: 'monthly' })
    feeType: string;

    @Prop({ default: '8AM-4PM' })
    timing: string;

    @Prop()
    affiliated: string;

    @Prop({ type: [String], default: ['library', 'labs', 'sports', 'wifi', 'canteen'] })
    facilities: string[];

    @Prop({ type: [{ name: String, image: String, bio: String }] })
    faculties: { name: string, image: string, bio: string }[];

    @Prop({ type: [{ name: String, image: String, rank: String, year: String }] })
    toppers: { name: string, image: string, rank: string, year: string }[];

    @Prop({ type: [{ name: String, fee: String, duration: String, facilities: [String] }] })
    courses: { name: string, fee: string, duration: string, facilities: string[] }[];

    @Prop({ type: [String] })
    achievements: string[];

    @Prop()
    contactNo: string;

    @Prop()
    email: string;

    @Prop({ type: [String] })
    category: string[]; // e.g. ["coaching", "dance", "school"]

    @Prop({ default: false })
    isAdmissionOpen: boolean;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop({ default: false })
    isSuspended: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const InstitutionSchema = SchemaFactory.createForClass(Institution);
