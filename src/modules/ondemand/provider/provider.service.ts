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
        const providerId = new Types.ObjectId(user.id);

        // 1. Fetch Provider Details for Stats & Location
        const provider = await this.userModel.findById(providerId)
            .select('fullName avatar rating earnings availability location')
            .lean();

        // 2. Fetch Aggregated Stats
        const [totalJobs, incomingRequests] = await Promise.all([
            this.bookingModel.countDocuments({ providerId, status: 'completed' }),
            this.bookingModel.find({
                status: 'pending',
                // For now, fetching requests specific to this provider or matching their category
                $or: [
                    { providerId: providerId },
                    { providerId: { $exists: false } } // Flexible assignment
                ],
                isDeleted: false
            })
                .populate('userId', 'fullName avatar userAddress location')
                .populate('serviceId', 'title price')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
        ]);

        // 3. Process Incoming Requests (Calculate Distance)
        const processedRequests = incomingRequests.map(req => {
            const userRef: any = req.userId;
            const serviceRef: any = req.serviceId;
            const userLoc = userRef?.location || userRef?.userAddress?.find((a: any) => a.isPrimary)?.location;

            let distanceStr = 'N/A';
            if (userLoc && provider?.location) {
                // Simple distance calculation (Haversine or similar could be used for better accuracy)
                const dist = this.calculateDistance(
                    provider.location[1], provider.location[0],
                    userLoc[1], userLoc[0]
                );
                distanceStr = `${dist.toFixed(1)} km`;
            }

            return {
                id: req._id,
                userName: userRef?.fullName || 'Anonymous',
                userAvatar: userRef?.avatar,
                service: serviceRef?.title || 'General Service',
                amount: req.amount || serviceRef?.price || 0,
                address: userRef?.userAddress?.find((a: any) => a.isPrimary)?.address || 'Address N/A',
                distance: distanceStr,
                timer: 30, // Mock timer as seen in UI
                status: req.status,
                bookingType: req.bookingType,
                scheduledAt: req.scheduledAt
            };
        });

        return {
            stats: {
                totalJobs: totalJobs || provider?.provider?.completedJobs || 0,
                earnings: provider?.earnings?.total || 0,
                avgRating: provider?.rating || 0
            },
            incomingRequests: processedRequests,
            providerAvailability: provider?.availability || 'Offline'
        };
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
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

    async getMyJobs(providerId: string, tab: string, subFilter?: string, page = 1, limit = 20) {
        const providerOid = new Types.ObjectId(providerId);

        // Determine status filter based on tab
        let statusFilter: any;
        switch (tab) {
            case 'active':
                statusFilter = { $in: ['started', 'on_the_way', 'reached'] };
                break;
            case 'upcoming':
                statusFilter = { $in: ['pending', 'accepted'] };
                break;
            case 'past':
                if (subFilter && ['completed', 'cancelled', 'disputed'].includes(subFilter)) {
                    statusFilter = subFilter;
                } else {
                    statusFilter = { $in: ['completed', 'cancelled', 'disputed'] };
                }
                break;
            default:
                statusFilter = { $in: ['started', 'on_the_way', 'reached'] };
        }

        const filter: any = {
            providerId: providerOid,
            status: statusFilter,
            isDeleted: false
        };

        // Fetch provider location for distance calc
        const provider = await this.userModel.findById(providerOid).select('location').lean();

        const skip = (page - 1) * limit;
        const [jobs, total] = await Promise.all([
            this.bookingModel.find(filter)
                .populate('userId', 'fullName avatar mobile userAddress location')
                .populate('serviceId', 'title price estimatedTime')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.bookingModel.countDocuments(filter)
        ]);

        const data = jobs.map(job => {
            const userRef: any = job.userId;
            const serviceRef: any = job.serviceId;
            const primaryAddr = userRef?.userAddress?.find((a: any) => a.isPrimary);
            const userLoc = userRef?.location || primaryAddr?.location;

            // Distance
            let distance = 'N/A';
            if (userLoc && provider?.location) {
                const dist = this.calculateDistance(
                    provider.location[1], provider.location[0],
                    userLoc[1], userLoc[0]
                );
                distance = `${dist.toFixed(1)} km`;
            }

            // Elapsed time for active jobs
            let elapsedTime: string | null = null;
            if (tab === 'active' && job.startedAt) {
                const diffMs = Date.now() - new Date(job.startedAt).getTime();
                const hrs = Math.floor(diffMs / 3600000);
                const mins = Math.floor((diffMs % 3600000) / 60000);
                const secs = Math.floor((diffMs % 60000) / 1000);
                elapsedTime = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }

            return {
                id: job._id,
                status: job.status,
                bookingType: job.bookingType,

                // User info
                userName: userRef?.fullName || 'Unknown',
                userAvatar: userRef?.avatar,
                userMobile: userRef?.mobile,
                address: primaryAddr?.address || 'Address N/A',

                // Service info
                service: serviceRef?.title || 'General Service',
                amount: job.amount || serviceRef?.price || 0,
                estimatedTime: serviceRef?.estimatedTime || null,

                // Geo & time
                distance,
                elapsedTime,

                // Dates
                bookedAt: job.createdAt,
                scheduledAt: job.scheduledAt,
                startedAt: job.startedAt,
                completedAt: job.completedAt,
                cancelledAt: job.cancelledAt,
            };
        });

        return { data, total, page, limit };
    }
}
