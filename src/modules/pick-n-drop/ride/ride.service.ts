import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RideRequest, RideRequestDocument, User, UserDocument, Review, ReviewDocument } from '@mongodb/schemas';
import { SocketService } from '@socket/socket.service';
import { MapsService } from '../maps.service';

@Injectable()
export class RideService {
    constructor(
        @InjectModel(RideRequest.name) private rideRequestModel: Model<RideRequestDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        private readonly socketService: SocketService,
        private readonly mapsService: MapsService,
    ) { }

    async createRideRequest(userId: string, dto: any) {
        const { source, destination, vehicleId, price, paymentMethod, driverId } = dto;
        const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const dropOffOtp = Math.floor(1000 + Math.random() * 9000).toString();

        // Fetch real distance/duration
        let metrics = { distance: 10000, duration: 900 }; // Fallback
        try {
            const org = source.lat ? { lat: source.lat, lng: source.lng } : { lat: source.location[1], lng: source.location[0] };
            const dest = destination.lat ? { lat: destination.lat, lng: destination.lng } : { lat: destination.location[1], lng: destination.location[0] };
            metrics = await this.mapsService.getDistanceAndDuration(org, dest);
        } catch (e) { }

        const rideRequest = new this.rideRequestModel({
            userId: new Types.ObjectId(userId),
            driverId: driverId ? new Types.ObjectId(driverId) : undefined,
            vehicleId: new Types.ObjectId(vehicleId),
            source: {
                ...source,
                location: {
                    type: 'Point',
                    coordinates: source.location || [source.lng, source.lat]
                }
            },
            destination: {
                ...destination,
                location: {
                    type: 'Point',
                    coordinates: destination.location || [destination.lng, destination.lat]
                }
            },
            price: {
                ...price,
                totalFare: price.farePrice || price.totalFare,
                currency: 'INR'
            },
            estimatedDistance: metrics.distance,
            estimatedDuration: metrics.duration,
            status: 'pending',
            pickupOtp,
            dropOffOtp,
            paymentMethod: paymentMethod || 'CASH',
            paymentStatus: 'pending'
        });

        const savedRequest = await rideRequest.save();

        if (driverId) {
            this.socketService.emitToUser(driverId, 'new_ride_request', savedRequest);
        } else {
            this.socketService.broadcast('ride_available', savedRequest);
        }

        return savedRequest;
    }

    async getRide(rideId: string) {
        return await this.rideRequestModel.findById(rideId).populate('userId driverId vehicleId');
    }

    async getRideHistory(userId: string) {
        return await this.rideRequestModel.find({ userId: new Types.ObjectId(userId) })
            .populate('vehicleId driverId')
            .sort({ createdAt: -1 });
    }

    async acceptRide(rideId: string, driverId: string) {
        const ride = await this.rideRequestModel.findById(rideId);
        if (!ride) throw new BadRequestException('Ride not found');
        if (ride.status !== 'pending') throw new BadRequestException('Ride already processed');

        ride.status = 'accepted';
        ride.driverId = new Types.ObjectId(driverId);
        await ride.save();

        this.socketService.emitToUser(ride.userId.toString(), 'ride_accepted', ride);

        return { success: true, ride, userId: ride.userId.toString() };
    }

    async updateStatus(rideId: string, status: string) {
        const ride = await this.rideRequestModel.findById(rideId);
        if (!ride) throw new BadRequestException('Ride not found');

        if (status === 'reached_pickup') ride.reachedPickupAt = new Date();
        ride.status = status;
        await ride.save();

        this.socketService.emitToUser(ride.userId.toString(), 'ride_status_updated', { rideId, status });

        return ride;
    }

    async verifyPickupOtp(rideId: string, otp: string) {
        const ride = await this.rideRequestModel.findById(rideId);
        if (!ride) throw new BadRequestException('Ride not found');
        if (ride.pickupOtp !== otp) throw new BadRequestException('Invalid Pickup OTP');

        ride.status = 'started';
        await ride.save();

        this.socketService.emitToUser(ride.userId.toString(), 'ride_started', ride);

        return { success: true, status: ride.status };
    }

    async verifyDropOffOtp(rideId: string, otp: string) {
        const ride = await this.rideRequestModel.findById(rideId);
        if (!ride) throw new BadRequestException('Ride not found');
        if (ride.dropOffOtp !== otp) throw new BadRequestException('Invalid Drop-off OTP');

        ride.status = 'completed';
        await ride.save();

        this.socketService.emitToUser(ride.userId.toString(), 'ride_reached_destination', ride);

        return { success: true, status: ride.status };
    }

    async changeDestination(rideId: string, userId: string, newDestination: any) {
        const ride = await this.rideRequestModel.findById(rideId);
        if (!ride || ride.userId.toString() !== userId) throw new BadRequestException('Ride not found or unauthorized');

        ride.destinationHistory.push({
            address: ride.destination.address,
            location: ride.destination.location,
            changedAt: new Date()
        });

        ride.destination = {
            ...newDestination,
            location: { type: 'Point', coordinates: newDestination.location }
        };

        await ride.save();
        return ride;
    }

    async cancelRide(rideId: string, userId: string, reason: string) {
        const ride = await this.rideRequestModel.findById(rideId);
        if (!ride) throw new BadRequestException('Ride not found');

        if (ride.userId.toString() !== userId && ride.driverId?.toString() !== userId) {
            throw new BadRequestException('Unauthorized cancellation');
        }

        ride.status = 'cancelled';
        ride.cancellationReason = reason;
        await ride.save();

        const targetId = ride.userId.toString() === userId ? ride.driverId?.toString() : ride.userId.toString();
        if (targetId) {
            this.socketService.emitToUser(targetId, 'ride_cancelled', { rideId, reason });
        }

        return { success: true, ride };
    }

    async reportDispute(rideId: string, userId: string, reason: string, description: string) {
        const ride = await this.rideRequestModel.findById(rideId);
        if (!ride) throw new BadRequestException('Ride not found');

        ride.disputes.push({
            reporterId: new Types.ObjectId(userId),
            reason,
            description,
            status: 'open',
            createdAt: new Date()
        });

        await ride.save();
        return { success: true, message: 'Dispute reported' };
    }

    async submitReview(userId: string, dto: any) {
        const { rideId, driverId, rating, comment } = dto;

        const review = new this.reviewModel({
            rideRequestId: new Types.ObjectId(rideId),
            driverId: new Types.ObjectId(driverId),
            employeeId: new Types.ObjectId(userId),
            rating,
            comment
        });

        await review.save();

        const allReviews = await this.reviewModel.find({ driverId: new Types.ObjectId(driverId) });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await this.userModel.updateOne(
            { _id: new Types.ObjectId(driverId) },
            { $set: { rating: avgRating, totalReviews: allReviews.length } }
        );

        return review;
    }
}
