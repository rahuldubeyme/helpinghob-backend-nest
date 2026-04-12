import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { JwtUtility } from '@common/utils';

@WebSocketGateway({
    cors: { origin: '*' },
    // Removed namespace to allow a single common connection
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly socketService: SocketService) { }

    afterInit(server: Server) {
        this.socketService.server = server;
        console.log('[SocketGateway] Initialized');
    }

    handleConnection(client: Socket) {
        const token = client.handshake.auth?.token || client.handshake.query?.token;
        if (!token) {
            console.log(`[SocketGateway] Connection rejected: No token (${client.id})`);
            return client.disconnect();
        }

        const payload = JwtUtility.verifyToken(token as string);
        if (!payload) {
            console.log(`[SocketGateway] Connection rejected: Invalid token (${client.id})`);
            return client.disconnect();
        }

        client.data.user = payload;
        client.join(payload.id); // Join private room for targeted events
        console.log(`[SocketGateway] User authenticated: ${payload.id} (${client.id})`);
    }

    handleDisconnect(client: Socket) {
        console.log(`[SocketGateway] Client disconnected: ${client.id}`);
    }

    // Generic event dispatcher if needed, but we'll use @SubscribeMessage in feature classes if possible.
    // However, NestJS requires @SubscribeMessage to be in a @WebSocketGateway class.
    // So we will either:
    // 1. Put all @SubscribeMessage here and delegate to feature services.
    // 2. Or, use multiple gateways that share the same port (sharing the same connection is tricky without namespaces).
    //
    // The user wants "one connection". In Socket.io, namespaces multiplex over one connection.
    // But they said "namespace: 'pick-n-drop'" before. 
    // If I use the default namespace '/', all features share it.
}
