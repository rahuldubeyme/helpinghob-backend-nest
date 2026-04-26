import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RideRequest, RideRequestDocument, User, UserDocument, Transaction, TransactionDocument, AdminSetting, AdminSettingDocument } from '@mongodb/schemas';
import { SocketService } from '@socket/socket.service';

@Injectable()
export class PaymentService {
    constructor(
        @InjectModel(RideRequest.name) private rideRequestModel: Model<RideRequestDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(AdminSetting.name) private adminSettingModel: Model<AdminSettingDocument>,
        private readonly socketService: SocketService,
    ) { }

    async processPayment(dto: any) {
        const ride = await this.rideRequestModel.findById(dto.rideId);
        if (!ride) throw new BadRequestException('Ride not found');

        const transaction = new this.transactionModel({
            amount: ride.price?.totalFare || 0,
            type: 'credit',
            category: 'booking',
            status: 'success',
            referenceId: dto.rideId,
            description: `Payment for ride ${dto.rideId} via ${dto.method}`
        });

        await transaction.save();

        await this.rideRequestModel.updateOne(
            { _id: dto.rideId },
            { $set: { status: 'completed', paymentStatus: 'paid' } }
        );

        await this.userModel.updateOne(
            { _id: ride.driverId },
            { $inc: { 'earnings.total': ride.price?.totalFare || 0, 'earnings.today': ride.price?.totalFare || 0, dailyRideCount: 1 } }
        );

        // Incentive Logic
        const settings = await this.adminSettingModel.findOne({ isDeleted: false });
        const driver = await this.userModel.findById(ride.driverId);

        if (settings?.pickNDropIncentive && driver) {
            const { ridesThreshold, amount } = settings.pickNDropIncentive;
            if (driver?.dailyRideCount >= ridesThreshold) {
                // Reward Incentive
                await this.userModel.updateOne(
                    { _id: ride.driverId },
                    {
                        $inc: { 'earnings.total': amount, 'earnings.today': amount, totalIncentivesEarned: amount },
                        $set: { dailyRideCount: 0 }
                    }
                );

                const incentiveTx = new this.transactionModel({
                    amount,
                    type: 'credit',
                    category: 'incentive',
                    status: 'success',
                    referenceId: dto.rideId,
                    description: `Incentive for completing ${ridesThreshold} rides`
                });
                await incentiveTx.save();

                this.socketService.emitToUser(ride.driverId.toString(), 'incentive_earned', { amount, ridesThreshold });
            }
        }

        let qrCodeUrl: string | null = null;
        if (dto.method !== 'CASH') {
            qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=helpinghob@bank%26am=${ride.price?.totalFare}%26tn=RidePayment`;
        }

        const result = { transaction: transaction.toObject(), qrCodeUrl };

        this.socketService.emitToUser(ride.userId.toString(), 'payment_completed', result);
        this.socketService.emitToUser(ride.driverId.toString(), 'payment_completed', result);

        return result;
    }
}
