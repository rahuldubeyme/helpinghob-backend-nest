import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { RideService } from '../../../src/modules/pick-n-drop/ride/ride.service';
import { DriverService } from '../../../src/modules/pick-n-drop/driver/driver.service';
import { LocationThrottlingService } from '@shared/location/location-throttling.service';
import { CreateRideDto, BookRideDto, RideActionDto } from '../../../src/modules/pick-n-drop/ride/dto/ride.dto';
import {
    SocketAcceptRideDto,
    SocketUpdateLocationDto,
    SocketRideStatusUpdateDto,
    SocketCancelRideDto
} from './dto/pick-n-drop.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class PickNDropSocket {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly rideService: RideService,
        private readonly driverService: DriverService,
        private readonly throttlingService: LocationThrottlingService,
    ) { }

    // this will used by driver when real time any user raise request for ride
    @SubscribeMessage('incomming_ride_request')
    @UsePipes(new ValidationPipe())
    async handleIncommingRequestRide(
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;
        if (!user) return { success: false, message: 'Unauthorized' };

        const rideRequest = await this.rideService.find({
            driverId: new Types.ObjectId(user.id),
            status: 'pending'
        });

        this.server.to(user.id).emit('incomming_ride', rideRequest);

        return { success: true, data: rideRequest };
    }

    // this will used by user when real time any driver accept/reject ride request
    @SubscribeMessage('ride_request_status')
    async handleRideRequestStatus(
        @MessageBody() data: RideActionDto,
        @ConnectedSocket() client: Socket,
    ) {
        const driver = client.data.user;
        if (!driver) return { success: false, message: 'Unauthorized' };

        const result = await this.rideService.handleRideRequest(driver.id, data);
        if (result?.result?.userId) {
            this.server.to(result.result.userId.toString()).emit('ride_request_status', result.result);
        }

        return result;
    }

    // this will used by driver when real time any user update location
    @SubscribeMessage('update_location')
    async handleUpdateLocation(
        @MessageBody() data: SocketUpdateLocationDto,
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;
        if (!user) return;

        // Apply spatial and temporal throttling
        if (!this.throttlingService.shouldUpdateLocation(user.id, data.lat, data.lng)) {
            return;
        }

        await this.driverService.updateLocation(user.id, data.lat, data.lng);

        if (data.rideId) {
            const ride = await this.rideService.getRide(data.rideId);
            if (ride?.userId) {
                this.server.to(ride.userId.toString()).emit('driver_location', {
                    lat: data.lat,
                    lng: data.lng,
                    rideId: data.rideId,
                });
            }
        }
    }

    // this will used by user when real time any driver update status
    @SubscribeMessage('ride_status_update')
    async handleStatusUpdate(
        @MessageBody() data: SocketRideStatusUpdateDto,
        @ConnectedSocket() client: Socket,
    ) {
        const driver = client.data.user;
        if (!driver) return { success: false, message: 'Unauthorized' };

        const ride = await this.rideService.getRide(data.rideId);
        if (!ride) return { success: false, message: 'Ride not found' };

        this.server.to(ride.userId.toString()).emit('ride_status_changed', ride);

        return { success: true };
    }

    // this will used by user when real time any driver cancel ride request
    @SubscribeMessage('cancel_ride')
    async handleCancelRide(
        @MessageBody() data: SocketCancelRideDto,
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;
        if (!user) return { success: false, message: 'Unauthorized' };

        const result = await this.rideService.handleRideAction(user, {
            rideId: data.rideId,
            status: 'cancelled',
            cancellationReason: data.reason
        });

        if (result?.userId) {
            this.server.to(result.userId.toString()).emit('ride_request_status', result);
        }
        if (result?.driverId) {
            this.server.to(result.driverId.toString()).emit('ride_request_status', result);
        }

        return { success: true, data: result };
    }
}
