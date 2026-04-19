import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { RideService } from '../../../src/modules/pick-n-drop/ride/ride.service';
import { DriverService } from '../../../src/modules/pick-n-drop/driver/driver.service';
import { CreateRideDto } from '../../../src/modules/pick-n-drop/ride/dto/ride.dto';
import { UpdateDriverLocationDto } from '../../../src/modules/pick-n-drop/driver/dto/driver.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class PickNDropSocket {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly rideService: RideService,
        private readonly driverService: DriverService,
    ) { }

    @SubscribeMessage('incomming_ride_request')
    @UsePipes(new ValidationPipe())
    async handleIncommingRequestRide(
        @MessageBody() dto: CreateRideDto,
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;
        if (!user) return { success: false, message: 'Unauthorized' };

        const rideRequest = await this.rideService.createRideRequest(user.id, dto);
        this.server.to('drivers').emit('incomming_ride', rideRequest);

        return { success: true, data: rideRequest };
    }

    @SubscribeMessage('request_ride')
    @UsePipes(new ValidationPipe())
    async handleRequestRide(
        @MessageBody() dto: CreateRideDto,
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;
        if (!user) return { success: false, message: 'Unauthorized' };

        const rideRequest = await this.rideService.createRideRequest(user.id, dto);
        this.server.to('drivers').emit('new_ride_request', rideRequest);

        return { success: true, data: rideRequest };
    }

    @SubscribeMessage('accept_ride')
    async handleAcceptRide(
        @MessageBody() data: { rideId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const driver = client.data.user;
        if (!driver) return { success: false, message: 'Unauthorized' };

        const result = await this.rideService.handleRideAction(driver.id, {
            rideId: data.rideId,
            action: 'accept'
        });
        if (result?.userId) {
            this.server.to(result.userId.toString()).emit('ride_accepted', result);
        }

        return result;
    }

    @SubscribeMessage('update_location')
    async handleUpdateLocation(
        @MessageBody() data: UpdateDriverLocationDto,
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;
        if (!user) return;

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

    @SubscribeMessage('ride_status_update')
    async handleStatusUpdate(
        @MessageBody() data: { rideId: string; status: string },
        @ConnectedSocket() client: Socket,
    ) {
        const driver = client.data.user;
        if (!driver) return { success: false, message: 'Unauthorized' };

        const ride = await this.rideService.getRide(data.rideId);
        if (!ride) return { success: false, message: 'Ride not found' };

        this.server.to(ride.userId.toString()).emit('ride_status_changed', {
            rideId: data.rideId,
            status: data.status,
        });

        return { success: true };
    }

    @SubscribeMessage('cancel_ride')
    async handleCancelRide(
        @MessageBody() data: { rideId: string; reason: string },
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;
        if (!user) return { success: false, message: 'Unauthorized' };

        const result = await this.rideService.handleRideAction(user, {
            rideId: data.rideId,
            status: 'cancelled',
            cancellationReason: data.reason
        });

        return { success: true, data: result };
    }

    @SubscribeMessage('join_driver_pool')
    async handleJoinDriverPool(@ConnectedSocket() client: Socket) {
        const user = client.data.user;
        if (user?.role === 'driver') {
            client.join('drivers');
            return { success: true, message: 'Joined driver pool' };
        }
        return { success: false, message: 'Only drivers can join' };
    }
}
