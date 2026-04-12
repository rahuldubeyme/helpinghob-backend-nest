import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
    public server: Server | null = null;

    emitToUser(userId: string, event: string, data: any) {
        if (this.server) {
            this.server.to(userId).emit(event, data);
        }
    }

    emitToRoom(roomId: string, event: string, data: any) {
        if (this.server) {
            this.server.to(roomId).emit(event, data);
        }
    }

    broadcast(event: string, data: any) {
        if (this.server) {
            this.server.emit(event, data);
        }
    }
}
