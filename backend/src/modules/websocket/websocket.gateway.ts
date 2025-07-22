import {
    WebSocketGateway as WSGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FamiliesService } from '@/modules/families/families.service';

@WSGateway({
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    },
})
export class WebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets: Map<string, string[]> = new Map();

    constructor(
        private jwtService: JwtService,
        @Inject(forwardRef(() => FamiliesService))
        private familiesService: FamiliesService,
    ) {}

    afterInit(server: Server) {
        console.log('WebSocket Gateway initialized');
    }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            const payload = this.jwtService.verify(token);
            const userId = payload.sub;

            // Store user-socket mapping
            const sockets = this.userSockets.get(userId) || [];
            sockets.push(client.id);
            this.userSockets.set(userId, sockets);

            // Join user to their family rooms
            const families = await this.familiesService.getUserFamilies(userId);
            for (const family of families) {
                client.join(`family:${family.id}`);
            }

            client.data.userId = userId;
            console.log(`User ${userId} connected`);
        } catch (error) {
            console.error('WebSocket connection error:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            const sockets = this.userSockets.get(userId) || [];
            const index = sockets.indexOf(client.id);
            if (index > -1) {
                sockets.splice(index, 1);
            }

            if (sockets.length === 0) {
                this.userSockets.delete(userId);
            } else {
                this.userSockets.set(userId, sockets);
            }

            console.log(`User ${userId} disconnected`);
        }
    }

    @SubscribeMessage('join-family')
    async handleJoinFamily(
        @MessageBody() data: { familyId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const userId = client.data.userId;

        // Verify user belongs to family
        const userFamily = await this.familiesService.getUserFamilyRole(userId, data.familyId);
        if (userFamily) {
            client.join(`family:${data.familyId}`);
            return { success: true };
        }

        return { success: false, error: 'Access denied' };
    }

    // Send event to all users in a family
    sendEventToFamily(familyId: string, event: string, data: any) {
        this.server.to(`family:${familyId}`).emit(event, data);
    }

    // Send event to specific user
    sendEventToUser(userId: string, event: string, data: any) {
        const sockets = this.userSockets.get(userId) || [];
        for (const socketId of sockets) {
            this.server.to(socketId).emit(event, data);
        }
    }
}