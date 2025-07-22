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
import { UseGuards, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FamiliesService } from '@/modules/families/families.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@WSGateway({
    namespace: '/events',
    path: '/socket.io',
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    },
})
export class WebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer()
    server: Server;

    private userSockets: Map<string, string[]> = new Map();
    private socketUsers: Map<string, string> = new Map(); // socket.id -> userId mapping

    constructor(
        private jwtService: JwtService,
        @Inject(forwardRef(() => FamiliesService))
        private familiesService: FamiliesService,
        private eventEmitter: EventEmitter2,
    ) {}

    afterInit(server: Server) {
        console.log('WebSocket Gateway initialized');
    }
    
    onModuleInit() {
        console.log('WebSocket Gateway module initialized');
        
        // Set up interval for sending debugging events every 5 seconds
        setInterval(() => {
            this.sendDebugEvent();
        }, 5000);
    }
    
    /**
     * Sends a debugging event to all connected clients
     * This helps monitor the WebSocket connection and provides
     * real-time statistics about the server
     */
    private sendDebugEvent() {
        // Get connected clients count safely
        let connectedClients = 0;
        try {
            // Try different methods to get the connected clients count
            if (this.server.engine && typeof this.server.engine.clientsCount === 'number') {
                // Method 1: Using engine.clientsCount
                connectedClients = this.server.engine.clientsCount;
            } else if (this.server.sockets && this.server.sockets.sockets && typeof this.server.sockets.sockets.size === 'number') {
                // Method 2: Using sockets.sockets.size (original method)
                connectedClients = this.server.sockets.sockets.size;
            } else if (this.server.sockets && this.server.sockets.adapter && this.server.sockets.adapter.sids) {
                // Method 3: Using adapter.sids size
                connectedClients = this.server.sockets.adapter.sids.size;
            } else {
                // Fallback: Use our own tracking
                connectedClients = this.socketUsers.size;
                console.warn('Could not determine connected clients count from Socket.IO, using fallback method');
            }
        } catch (error) {
            console.error('Error getting connected clients count:', error);
            // Fallback to our own tracking
            connectedClients = this.socketUsers.size;
        }

        const userCount = this.userSockets.size;
        
        const debugData = {
            type: 'debug.ping',
            timestamp: new Date().toISOString(),
            serverTime: new Date().toLocaleTimeString(),
            stats: {
                connectedClients,
                userCount,
                socketToUserMappings: this.socketUsers.size
            }
        };
        
        console.log('Sending debug event to all clients:', debugData);
        this.server.emit('debug.ping', debugData);
    }
    
    @OnEvent('family.created')
    handleFamilyCreated(family: any) {
        console.log('Family created event received:', family.id);
        // No need to broadcast to anyone yet as the creator will refresh their data
    }
    
    @OnEvent('family.updated')
    handleFamilyUpdated(family: any) {
        console.log('Family updated event received:', family.id);
        this.sendEventToFamily(family.id, 'family.updated', {
            type: 'family.updated',
            familyId: family.id
        });
    }
    
    @OnEvent('family.member.joined')
    handleFamilyMemberJoined(payload: { familyId: string, userId: string, userFamily: any }) {
        console.log('Family member joined event received:', payload.familyId, payload.userId);
        this.sendEventToFamily(payload.familyId, 'family.member.joined', {
            type: 'family.member.joined',
            familyId: payload.familyId,
            userId: payload.userId
        });
    }
    
    @OnEvent('family.member.left')
    handleFamilyMemberLeft(payload: { familyId: string, userId: string, userFamily: any }) {
        console.log('Family member left event received:', payload.familyId, payload.userId);
        this.sendEventToFamily(payload.familyId, 'family.member.left', {
            type: 'family.member.left',
            familyId: payload.familyId,
            userId: payload.userId
        });
    }
    
    @OnEvent('family.member.updated')
    handleFamilyMemberUpdated(payload: { familyId: string, userId: string, userFamily: any }) {
        console.log('Family member updated event received:', payload.familyId, payload.userId);
        this.sendEventToFamily(payload.familyId, 'family.member.updated', {
            type: 'family.member.updated',
            familyId: payload.familyId,
            userId: payload.userId,
            role: payload.userFamily.role
        });
    }
    
    @OnEvent('family.member.removed')
    handleFamilyMemberRemoved(payload: { familyId: string, userId: string, userFamily: any }) {
        console.log('Family member removed event received:', payload.familyId, payload.userId);
        this.sendEventToFamily(payload.familyId, 'family.member.removed', {
            type: 'family.member.removed',
            familyId: payload.familyId,
            userId: payload.userId
        });
    }
    
    @OnEvent('child.created')
    handleChildCreated(payload: { child: any, familyId: string, userId: string }) {
        console.log('Child created event received:', payload.child.id);
        this.sendEventToFamily(payload.familyId, 'child.created', {
            type: 'child.created',
            familyId: payload.familyId,
            childId: payload.child.id,
            child: payload.child
        });
    }
    
    @OnEvent('child.updated')
    handleChildUpdated(payload: { child: any, familyId: string, userId: string }) {
        console.log('Child updated event received:', payload.child.id);
        this.sendEventToFamily(payload.familyId, 'child.updated', {
            type: 'child.updated',
            familyId: payload.familyId,
            childId: payload.child.id,
            child: payload.child
        });
    }
    
    @OnEvent('trackable.created')
    handleTrackableCreated(payload: { trackable: any, userId: string, familyId: string }) {
        console.log('Trackable created event received:', payload.trackable.id);
        
        // Use the family ID directly from the payload
        if (payload.familyId) {
            this.sendEventToFamily(payload.familyId, 'trackable.created', {
                type: 'trackable.created',
                trackableId: payload.trackable.id,
                childId: payload.trackable.childId,
                trackable: payload.trackable,
                familyId: payload.familyId
            });
        } else {
            console.error('Missing family ID in trackable.created event payload');
        }
    }
    
    @OnEvent('trackable.updated')
    handleTrackableUpdated(payload: { trackable: any, userId: string, familyId: string }) {
        console.log('Trackable updated event received:', payload.trackable.id);
        
        // Use the family ID directly from the payload
        if (payload.familyId) {
            this.sendEventToFamily(payload.familyId, 'trackable.updated', {
                type: 'trackable.updated',
                trackableId: payload.trackable.id,
                childId: payload.trackable.childId,
                trackable: payload.trackable,
                familyId: payload.familyId
            });
        } else {
            console.error('Missing family ID in trackable.updated event payload');
        }
    }
    
    @OnEvent('trackable.deleted')
    handleTrackableDeleted(payload: { trackableId: string, childId: string, userId: string, familyId: string }) {
        console.log('Trackable deleted event received:', payload.trackableId);
        
        // Use the family ID directly from the payload
        if (payload.familyId) {
            this.sendEventToFamily(payload.familyId, 'trackable.deleted', {
                type: 'trackable.deleted',
                trackableId: payload.trackableId,
                childId: payload.childId,
                familyId: payload.familyId
            });
        } else {
            console.error('Missing family ID in trackable.deleted event payload');
        }
    }

    // Event handlers for direct event service emissions
    @OnEvent('event.created')
    handleEventCreated(payload: { event: any, child: any, user: any }) {
        console.log('Event created event received:', payload.event.id);

        if (payload.child?.familyId) {
            this.sendEventToFamily(payload.child.familyId, 'event.created', {
                type: 'event.created',
                eventId: payload.event.id,
                childId: payload.event.childId,
                event: payload.event,
                child: payload.child,
                user: payload.user,
                familyId: payload.child.familyId
            });
        } else {
            console.error('Missing family ID in event.created event payload');
        }
    }

    @OnEvent('event.updated')
    handleEventUpdated(payload: { event: any, child: any, user: any }) {
        console.log('Event updated event received:', payload.event.id);

        if (payload.child?.familyId) {
            this.sendEventToFamily(payload.child.familyId, 'event.updated', {
                type: 'event.updated',
                eventId: payload.event.id,
                childId: payload.event.childId,
                event: payload.event,
                child: payload.child,
                user: payload.user,
                familyId: payload.child.familyId
            });
        } else {
            console.error('Missing family ID in event.updated event payload');
        }
    }

    @OnEvent('event.deleted')
    handleEventDeleted(payload: { eventId: string, childId: string, child: any, user: any }) {
        console.log('Event deleted event received:', payload.eventId);

        if (payload.child?.familyId) {
            this.sendEventToFamily(payload.child.familyId, 'event.deleted', {
                type: 'event.deleted',
                eventId: payload.eventId,
                childId: payload.childId,
                child: payload.child,
                user: payload.user,
                familyId: payload.child.familyId
            });
        } else {
            console.error('Missing family ID in event.deleted event payload');
        }
    }

    @OnEvent('event.milestone.created')
    handleEventMilestoneCreated(payload: { event: any, child: any, user: any, milestone: any }) {
        console.log('Event milestone created event received:', payload.event.id);

        if (payload.child?.familyId) {
            this.sendEventToFamily(payload.child.familyId, 'event.milestone.created', {
                type: 'event.milestone.created',
                eventId: payload.event.id,
                childId: payload.event.childId,
                event: payload.event,
                child: payload.child,
                user: payload.user,
                milestone: payload.milestone,
                familyId: payload.child.familyId
            });
        } else {
            console.error('Missing family ID in event.milestone.created event payload');
        }
    }

    @OnEvent('event.milestone.deleted')
    handleEventMilestoneDeleted(payload: { eventId: string, childId: string, child: any, user: any, milestone: any }) {
        console.log('Event milestone deleted event received:', payload.eventId);

        if (payload.child?.familyId) {
            this.sendEventToFamily(payload.child.familyId, 'event.milestone.deleted', {
                type: 'event.milestone.deleted',
                eventId: payload.eventId,
                childId: payload.childId,
                child: payload.child,
                user: payload.user,
                milestone: payload.milestone,
                familyId: payload.child.familyId
            });
        } else {
            console.error('Missing family ID in event.milestone.deleted event payload');
        }
    }

    async handleConnection(client: Socket) {
        try {
            console.log(`New connection attempt: ${client.id}`);

            // Get token from auth or query
            const token = client.handshake.auth?.token || client.handshake.query?.token;

            if (!token) {
                console.log('No token provided for connection');
                client.emit('error', {
                    code: 1,
                    message: 'Authentication token required',
                    type: 'AUTH_REQUIRED'
                });
                client.disconnect();
                return;
            }

            // Verify token
            let payload;
            try {
                payload = this.jwtService.verify(token);
            } catch (jwtError) {
                console.log('Invalid token provided:', jwtError.message);
                client.emit('error', {
                    code: 1,
                    message: 'Invalid or expired token',
                    type: 'AUTH_INVALID'
                });
                client.disconnect();
                return;
            }

            const userId = payload.sub;

            // Store user-socket mapping
            const sockets = this.userSockets.get(userId) || [];
            sockets.push(client.id);
            this.userSockets.set(userId, sockets);
            this.socketUsers.set(client.id, userId);

            // Automatically join user to their family rooms
            try {
                const families = await this.familiesService.getUserFamilies(userId);
                console.log(`Found ${families.length} families for user ${userId}:`, 
                    families.map(f => ({ 
                        familyId: f.familyId, 
                        role: f.role, 
                        isPrimary: f.isPrimary,
                        joinedAt: f.joinedAt
                    }))
                );
                
                // If user has multiple families, find the primary one
                let primaryFamily = families.find(f => f.isPrimary);
                
                // If no primary family is set but user has families, use the first one
                if (!primaryFamily && families.length > 0) {
                    primaryFamily = families[0];
                    console.log(`No primary family set for user ${userId}, using first family: ${primaryFamily.familyId}`);
                }
                
                // Join all family rooms, but mark the primary one
                for (const family of families) {
                    const roomName = `family:${family.familyId}`;
                    client.join(roomName);
                    
                    if (family === primaryFamily) {
                        console.log(`User ${userId} joined PRIMARY family room: ${family.familyId}`);
                    } else {
                        console.log(`User ${userId} joined additional family room: ${family.familyId}`);
                    }
                }
                
                // If user has a primary family, emit an event to confirm
                if (primaryFamily) {
                    client.emit('primary-family', {
                        familyId: primaryFamily.familyId,
                        userId: userId,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (familyError) {
                console.error('Error fetching user families:', familyError);
                client.emit('error', {
                    code: 2,
                    message: 'Failed to join family rooms',
                    type: 'FAMILY_ERROR'
                });
            }

            client.data.userId = userId;

            // Send successful connection confirmation
            client.emit('connected', {
                userId: userId,
                socketId: client.id,
                timestamp: new Date().toISOString()
            });

            console.log(`User ${userId} successfully connected with socket ${client.id}`);
        } catch (error) {
            console.error('WebSocket connection error:', error);
            client.emit('error', {
                code: 3,
                message: 'Connection failed',
                type: 'CONNECTION_ERROR',
                details: error.message
            });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = this.socketUsers.get(client.id);
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

            this.socketUsers.delete(client.id);
            console.log(`User ${userId} disconnected (socket: ${client.id})`);
        } else {
            console.log(`Unknown socket disconnected: ${client.id}`);
        }
    }

    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() client: Socket) {
        client.emit('pong', { timestamp: Date.now() });
    }

    @SubscribeMessage('join-family')
    async handleJoinFamily(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { familyId: string }
    ) {
        try {
            const userId = this.socketUsers.get(client.id);
            if (!userId) {
                client.emit('error', {
                    code: 4,
                    message: 'User not authenticated',
                    type: 'AUTH_REQUIRED'
                });
                return;
            }

            const { familyId } = data;
            if (!familyId) {
                client.emit('error', {
                    code: 5,
                    message: 'Family ID is required',
                    type: 'INVALID_REQUEST'
                });
                return;
            }

            // Verify that the user has access to this family
            const userFamily = await this.familiesService.getUserFamilyRole(userId, familyId);
            if (!userFamily) {
                client.emit('error', {
                    code: 6,
                    message: 'You do not have access to this family',
                    type: 'ACCESS_DENIED'
                });
                return;
            }

            // Join the family room
            client.join(`family:${familyId}`);
            console.log(`User ${userId} manually joined family room: ${familyId}`);
            
            client.emit('family-joined', {
                familyId,
                userId,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error joining family room:', error);
            client.emit('error', {
                code: 7,
                message: 'Failed to join family room',
                type: 'JOIN_FAMILY_ERROR',
                details: error.message
            });
        }
    }

    // Send event to all users in a family
    sendEventToFamily(familyId: string, event: string, data: any) {
        console.log(`Broadcasting ${event} to family:${familyId}`, data);
        this.server.to(`family:${familyId}`).emit(event, data);
    }

    // Send event to specific user
    sendEventToUser(userId: string, event: string, data: any) {
        const sockets = this.userSockets.get(userId) || [];
        console.log(`Sending ${event} to user ${userId} (${sockets.length} sockets)`);
        for (const socketId of sockets) {
            this.server.to(socketId).emit(event, data);
        }
    }
}