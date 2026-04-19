import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RideRequest, RideRequestDocument, User, UserDocument, Review, ReviewDocument, Vehicle, VehicleDocument } from '@mongodb/schemas';
import { SocketService } from '@socket/socket.service';
import { MapsService } from '@shared/maps/maps.service';
import { CreateRideDto, RideActionDto, SubmitReviewDto, BookRideDto } from './dto/ride.dto';
import { PaginationDto } from '@dtos/pagination.dto';

@Injectable()
export class RideService {
    constructor(
        @InjectModel(RideRequest.name) private rideRequestModel: Model<RideRequestDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
        private readonly socketService: SocketService,
        private readonly mapsService: MapsService,
    ) { }

    async getHomeScreen(user: any) {

        const driverObjectId = new Types.ObjectId(user?.id);

        const [allRides, earningResult] = await Promise.all([
            this.rideRequestModel
                .find({
                    driverId: driverObjectId,
                    status: 'pending',
                    paymentStatus: 'pending',
                })
                .select('-__v')
                .lean()
                .limit(5)
                .exec(),

            this.rideRequestModel
                .aggregate<{ totalEarning: number }>([
                    {
                        $match: {
                            driverId: driverObjectId,
                            status: 'completed',
                            paymentStatus: 'paid',
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalEarning: { $sum: '$price.totalFare' },
                        },
                    },
                ])
                .exec(),
        ]);

        return {
            allRides,
            todayEarning: earningResult[0]?.totalEarning ?? 0,
            totalRides: allRides.length,
            currentLocation: user.location,
        };
    }

    async createRideRequest(userId: string, dto: BookRideDto) {
        const { source, destination, vehicleId, totalFare, driverId } = dto;
        const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();

        // Fetch real distance/duration
        let metrics = { distance: 10000, duration: 900 }; // Fallback
        try {
            const org = { lat: source.lat, lng: source.lng };
            const dest = { lat: destination.lat, lng: destination.lng };
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
                    coordinates: [source.lng, source.lat]
                }
            },
            destination: {
                ...destination,
                location: {
                    type: 'Point',
                    coordinates: [destination.lng, destination.lat]
                }
            },
            price: {
                baseFare: 0, // Should probably come from calculation or DTO
                distanceFare: dto.totalFare,
                totalFare: dto.totalFare,
                currency: 'INR'
            },
            estimatedDistance: metrics.distance,
            estimatedDuration: metrics.duration,
            status: 'pending',
            pickupOtp,
            paymentStatus: 'pending'
        });

        const savedRequest = await rideRequest.save();
        const result = savedRequest.toObject();

        if (driverId) {
            this.socketService.emitToUser(driverId, 'incomming_request', result);
        } else {
            this.socketService.broadcast('ride_available', result);
        }

        return result;
    }

    async getRide(rideId: string) {
        return await this.rideRequestModel.findById(rideId).populate('userId driverId vehicleId').lean();
    }

    async getRideHistory(user: any, query: PaginationDto) {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        let defaultQuery: any = { userId: new Types.ObjectId(user.id) }

        if (user?.role === 'provider') {
            defaultQuery = { driverId: new Types.ObjectId(user.id) }
        }

        const [history, total] = await Promise.all([
            this.rideRequestModel.find(defaultQuery)
                .populate('vehicleId driverId')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            this.rideRequestModel.countDocuments(defaultQuery)
        ]);

        return { history, total, page, limit };
    }

    async find(query: any) {
        return await this.rideRequestModel.find(query).populate('userId vehicleId').lean();
    }

    async handleRideRequest(driverId: string, dto: RideActionDto) {
        const ride = await this.rideRequestModel.findById(dto.rideId);
        if (!ride) throw new BadRequestException('Ride not found');
        if (ride.requestStatus !== 'pending') throw new BadRequestException('Ride already processed');

        if (dto.action === 'accept') {
            ride.requestStatus = 'accepted';
            ride.status = 'on_the_way';
            ride.driverId = new Types.ObjectId(driverId);
        } else {
            ride.requestStatus = 'rejected';
            ride.status = 'cancelled';
            ride.cancelledBy = 'driver';
            ride.cancellationReason = 'Driver rejected the ride request',
                ride.cancelledRideAt = new Date();
        }

        await ride.save();
        const result = ride.toObject();

        const event = dto?.action === 'accept' ? 'ride_accepted' : 'ride_rejected';
        this.socketService.emitToUser(ride.userId.toString(), event, result);

        return { result, message: `Ride ${dto?.action}ed successfully` };
    }

    async handleRideAction(user: any, dto: any) {
        const filter: any = { _id: dto.rideId };
        // Check if user is provider (driver) or user (rider)
        if (user.role === 2 || user.role === 'provider') {
            filter.driverId = user.id;
        } else if (user.role === 1 || user.role === 'user') {
            filter.userId = user.id;
        }

        const ride = await this.rideRequestModel.findOne(filter);
        if (!ride) throw new BadRequestException('Ride not found or unauthorized');

        if (dto.status === 'reached') ride.reachedPickupAt = new Date();
        ride.status = dto.status;

        if (dto.status === 'cancelled') {
            ride.cancelledBy = (user.role === 2 || user.role === 'provider') ? 'driver' : 'user';
            ride.cancellationReason = dto.cancellationReason;
            ride.cancelledRideAt = new Date();
        }

        await ride.save();
        const result = ride.toObject();

        // Notify the relevant party
        const targetId = (user.id === ride.userId.toString())
            ? ride.driverId?.toString()
            : ride.userId.toString();

        if (targetId) {
            const event = dto.status === 'cancelled' ? 'ride_cancelled' : 'ride_request_status';
            this.socketService.emitToUser(targetId, event, {
                rideId: dto.rideId,
                status: dto.status,
                cancellationReason: dto.cancellationReason,
                cancelledBy: ride.cancelledBy
            });
        }

        // Also notify the caller if they are listening on a generic event
        this.socketService.emitToUser(user.id, 'ride_request_status', { rideId: dto.rideId, status: dto.status });

        return result;
    }

    async verifyPickupOtp(dto: any) {
        const ride = await this.rideRequestModel.findById(dto.rideId);
        if (!ride) throw new BadRequestException('Ride not found');
        if (ride.pickupOtp !== dto.otp) throw new BadRequestException('Invalid Pickup OTP');

        ride.status = 'started';
        await ride.save();

        this.socketService.emitToUser(ride.userId.toString(), 'ride_started', ride);

        return { status: ride.status };
    }

    async verifyDropOffOtp(rideId: string, otp: string) {
        const ride = await this.rideRequestModel.findById(rideId);
        if (!ride) throw new BadRequestException('Ride not found');

        ride.status = 'completed';
        await ride.save();

        this.socketService.emitToUser(ride.userId.toString(), 'ride_reached_destination', ride);

        return { status: ride.status };
    }

    async changeDestination(user: any, dto: any) {
        const ride = await this.rideRequestModel.findById(dto.rideId);
        if (!ride || ride.userId.toString() !== user.id) throw new BadRequestException('Ride not found or unauthorized');

        // Recalculate price if ride is in progress or accepted
        let currentLocation: { lat: number; lng: number } | null = null;
        if (ride.locationUpdates && ride.locationUpdates.length > 0) {
            const lastUpdate = ride.locationUpdates[ride.locationUpdates.length - 1];
            currentLocation = { lat: lastUpdate.lat, lng: lastUpdate.lng };
        } else if (ride.driverId) {
            const driver: any = await this.userModel.findById(ride.driverId).lean();
            if (driver?.location?.coordinates) {
                currentLocation = {
                    lng: driver.location.coordinates[0],
                    lat: driver.location.coordinates[1]
                };
            }
        }

        // Fallback to source if no current location found
        if (!currentLocation) {
            const sourceLoc = ride.source.location as any;
            currentLocation = {
                lat: sourceLoc.coordinates[1],
                lng: sourceLoc.coordinates[0]
            };
        }

        // Calculate distance to new destination
        const metrics = await this.mapsService.getDistanceAndDuration(
            { lat: currentLocation.lat, lng: currentLocation.lng },
            { lat: dto.destination.lat, lng: dto.destination.lng }
        );
        const additionalDistanceKm = metrics.distance / 1000;

        // Get pricing info
        const vehicle = await this.vehicleModel.findById(ride.vehicleId).lean();
        const perKmRate = (vehicle as any)?.perKmRate || 0;
        const additionalFare = Math.round(additionalDistanceKm * perKmRate);

        // Update price
        ride.price.distanceFare = (ride.price.distanceFare || 0) + additionalFare;
        ride.price.totalFare = (ride.price.totalFare || 0) + additionalFare;

        ride.destinationHistory.push({
            address: ride.destination.address,
            location: ride.destination.location,
            changedAt: new Date()
        });

        ride.destination = {
            status: 'destination-changed',
            ...dto.destination,
            location: { type: 'Point', coordinates: [dto.destination.lng, dto.destination.lat] }
        };

        await ride.save();
        return ride.toObject();
    }

    async reportDispute(userId: string, dto: any) {
        const ride = await this.rideRequestModel.findById(dto.rideId);
        if (!ride) throw new BadRequestException('Ride not found');

        ride.isDisputed = true;
        ride.status = 'cancelled';
        ride.cancelledBy = 'user';
        ride.cancellationReason = dto.reason;
        ride.cancelledRideAt = new Date();
        ride.disputes.push({
            reporterId: new Types.ObjectId(userId),
            reason: dto.reason,
            status: 'open',
            createdAt: new Date()
        });

        await ride.save();
        return { message: 'Dispute reported' };
    }

    async submitReview(userId: string, dto: SubmitReviewDto) {
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

        return review.toObject();
    }
}
