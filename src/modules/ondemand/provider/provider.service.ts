import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, OndemandBooking, OndemandBookingDocument, LiveLocation, LiveLocationDocument } from '@mongodb/schemas';

@Injectable()
export class ProviderService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(OndemandBooking.name) private bookingModel: Model<OndemandBookingDocument>,
        @InjectModel(LiveLocation.name) private liveLocationModel: Model<LiveLocationDocument>,
    ) { }

    async getHomeScreen(user: any) {
        const [provider, activeBookings, earnings] = await Promise.all([
            this.userModel.findById(user.id).select('availability fullName profileImage rating').lean(),
            this.bookingModel.find({
                providerId: new Types.ObjectId(user.id),
                status: { $in: ['accepted', 'started'] }
            }).limit(5).lean(),
            this.getProviderEarnings(user.id)
        ]);

        return {
            provider,
            activeBookings,
            earnings,
            stats: {
                totalBookings: await this.bookingModel.countDocuments({ providerId: new Types.ObjectId(user.id) }),
                todayEarnings: earnings.today
            }
        };
    }

    async getProviderInfo(providerId: string) {
        return await this.userModel.findById(providerId).lean();
    }

    async updateAvailability(userId: string, availability: string) {
        return (await this.userModel.findByIdAndUpdate(userId, { $set: { availability } }, { new: true }))?.toObject();
    }

    async updateLocation(userId: string, lat: number, lng: number) {
        const user = await this.userModel.findById(userId).select('role').lean();

        await Promise.all([
            this.userModel.updateOne(
                { _id: new Types.ObjectId(userId) },
                { $set: { 'location.coordinates': [lng, lat], 'lastLocation.coordinates': [lng, lat] } }
            ),
            this.liveLocationModel.findOneAndUpdate(
                { userId: new Types.ObjectId(userId) },
                {
                    userId: new Types.ObjectId(userId),
                    role: user?.role || 'provider',
                    location: { type: 'Point', coordinates: [lng, lat] },
                    lastUpdate: new Date()
                },
                { upsert: true, new: true }
            )
        ]);
        return { success: true };
    }

    async getProviderEarnings(providerId: string) {
        const provider = await this.userModel.findById(providerId);
        return provider?.earnings || { total: 0, today: 0, pending: 0 };
    }
}
