import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class Address {
    @Prop({ default: 'Other' })
    addressTag: string;

    @Prop()
    address: string;

    @Prop({ type: [Number], index: '2dsphere', default: [0, 0] })
    location: number[];

    @Prop()
    zipcode: string;

    @Prop({ default: false })
    isPrimary: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ collection: 'users', timestamps: true })
export class User {
    @Prop({ default: 1 }) //1: user, 2: provider
    role: number;

    @Prop({ default: 'user' }) // user, provider, driver , merchant, vendor
    roleName: string;

    @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
    accountStatus: string;

    @Prop()
    fullName: string;

    @Prop()
    avatar: string;

    @Prop()
    email: string;

    @Prop({ lowercase: true })
    gender: string;

    @Prop()
    dob: string;

    @Prop()
    bio: string;

    @Prop()
    countryCode: string;

    @Prop()
    mobile: string;

    @Prop()
    formattedNumber: string;

    @Prop()
    password: string;

    @Prop({ default: false })
    mobileVerify: boolean;

    @Prop({ default: false })
    emailVerify: boolean;

    @Prop({ type: [AddressSchema], default: [] })
    userAddress: Address[];

    @Prop({ type: [Number], index: '2dsphere', default: [0, 0] })
    location: number[];

    @Prop({ type: [Number], index: '2dsphere', default: [0, 0] })
    lastLocation: number[];

    @Prop({ enum: ['Online', 'Offline', 'Busy'], default: 'Offline' })
    availability: string;

    @Prop({ default: 0 })
    walletBalance: number;

    @Prop({ default: 'en' })
    language: string;

    @Prop({ default: true })
    allowNotification: boolean;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ default: false })
    isSuspended: boolean;

    @Prop()
    authTokenIssuedAt: number;

    @Prop({ default: false })
    otpVerified: boolean;

    @Prop({ type: Object })
    device: {
        deviceToken: string;
        deviceType: string;
        langauge: string;
    };

    @Prop({ type: Object })
    vehicle?: {
        vehicleOwnerShip?: string;
        vehicleId?: Types.ObjectId;
        haveHelmet?: boolean;
        aadharNumber?: string;
        personalDoc?: string[];
        vehicleDocuments?: string[];
        numberPlate?: string;
        color?: string;
        year?: string;
        modelId?: string;
    };

    @Prop({ type: Object })
    shop?: {
        name: string;
    };

    @Prop()
    validTill: Date;

    @Prop({ type: Object, default: { total: 0, today: 0, pending: 0 } })
    earnings: {
        total: number;
        today: number;
        pending: number;
    };

    @Prop({ default: 0 })
    rating: number;

    @Prop({ default: 0 })
    totalReviews: number;

    @Prop({ type: [Object], default: [] })
    cart: any[];

    @Prop({ default: 0 })
    experience: number;

    @Prop({ default: 0 })
    startingPrice: number;

    @Prop({ type: Types.ObjectId, ref: 'Category', index: true })
    category: Types.ObjectId;

    @Prop({ index: true })
    categoryName: string;

    @Prop({ default: 0 })
    dailyRideCount: number;

    @Prop({ default: 0 })
    totalIncentivesEarned: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
