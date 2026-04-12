import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { RideService } from './ride/ride.service';
import { DriverService } from './driver/driver.service';
import { JwtUtility } from '@common/utils';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'pick-n-drop',
})
export class PickNDropGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly rideService: RideService,
        private readonly driverService: DriverService,
    ) { }

    handleConnection(client: Socket) {
        const token = client.handshake.auth?.token || client.handshake.query?.token;
        if (!token) return client.disconnect();

        const payload = JwtUtility.verifyToken(token as string);
        if (!payload) return client.disconnect();

        client.data.user = payload;
        client.join(payload.id);
        console.log(`[PickNDrop] Client connected: ${payload.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`[PickNDrop] Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('request_ride')
    @UsePipes(new ValidationPipe())
    async handleRequestRide(
        @MessageBody() dto: any,
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

        const result = await this.rideService.acceptRide(data.rideId, driver.id);
        if (result.success) {
            this.server.to(result.userId).emit('ride_accepted', result.ride);
        }

        return result;
    }

    @SubscribeMessage('update_location')
    async handleUpdateLocation(
        @MessageBody() data: { lat: number; lng: number; rideId?: string },
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

        const result = await this.rideService.cancelRide(data.rideId, user.id, data.reason);
        if (result.success) {
            const ride = result.ride;
            const otherPartyId =
                user.id === ride.userId.toString()
                    ? ride.driverId?.toString()
                    : ride.userId.toString();
            if (otherPartyId) {
                this.server.to(otherPartyId).emit('ride_cancelled', {
                    rideId: data.rideId,
                    reason: data.reason,
                    cancelledBy: user.id,
                });
            }
        }

        return result;
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
