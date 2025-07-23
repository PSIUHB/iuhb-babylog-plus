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

        // Start the interval system after initialization
        this.waitForAdapterAndStartInterval();
    }

    /**
     * Waits for the Socket.IO adapter to be fully initialized and then starts the interval
     */
    private async waitForAdapterAndStartInterval() {
        console.log('Starting connected caregivers event interval with simplified approach');

        // Start the interval for sending connected caregivers events every 10 seconds
        setInterval(() => {
            this.sendActiveCaregivers();
        }, 10000);

        // Send initial event after a short delay
        setTimeout(() => {
            this.sendActiveCaregivers();
        }, 2000);
    }

    /**
     * Sends active caregivers information to each family room
     * This method gets all families from DB and sends connected users info to their rooms
     */
    private async sendActiveCaregivers() {
        try {
            console.log('Checking active caregivers for all family rooms');

            // Check if server is available
            if (!this.server) {
                console.log('Server not available');
                return;
            }

            console.log(`Processing ${this.socketUsers.size} connected sockets from socketUsers map`);

            // Get all families from database
            const families = await this.familiesService.getAllFamilies();
            console.log(`Found ${families.length} families in database`);

            // For each family, check which users are connected and send event
            for (const family of families) {
                const familyId = family.id;
                const connectedUserIds = new Set<string>();

                // Check all connected sockets to see if any belong to this family's members
                for (const [socketId, userId] of this.socketUsers.entries()) {
                    // Check if this user is a member of this family
                    try {
                        const userFamily = await this.familiesService.getUserFamilyRole(userId, familyId);
                        if (userFamily) {
                            connectedUserIds.add(userId);
                            console.log(`User ${userId} is connected and member of family ${familyId}`);
                        }
                    } catch (error) {
                        // User is not a member of this family, skip
                        continue;
                    }
                }

                // Send event to family room with connected users (even if empty)
                const userIdsArray = Array.from(connectedUserIds);
                const eventData = {
                    type: 'family.connected.caregivers',
                    familyId: familyId,
                    connectedUserIds: userIdsArray,
                    timestamp: new Date().toISOString()
                };

                console.log(`Sending connected caregivers to family ${familyId}:`, userIdsArray);
                this.sendEventToFamily(familyId, 'family.connected.caregivers', eventData);
            }

            console.log(`Sent connected caregivers events to ${families.length} families`);

        } catch (error) {
            console.error('Error sending active caregivers:', error);
        }
    }
    
    onModuleInit() {
        console.log('WebSocket Gateway module initialized');
    }
    
    /**
     * Sends connected caregivers information to each family room
     * This allows the frontend to know which caregivers are actually connected
     * to the family socket and display them as online
     */
    private async sendConnectedCaregiversEvent() {
        try {
            // First check if server is available
            if (!this.server) {
                console.log('Server not available, skipping connected caregivers event');
                return;
            }

            // Get all rooms from the adapter
            const rooms = this.server.sockets?.adapter?.rooms;

            // If rooms is undefined or adapter not ready, use fallback method
            if (!rooms) {
                console.log('Socket.IO adapter rooms not available, using fallback method');
                this.sendConnectedCaregiversEventFallback();
                return;
            }
            
            console.log(`Processing ${rooms.size} total rooms for connected caregivers`);
            let familyRoomsProcessed = 0;

            // Process each family room (rooms that start with "family:")
            for (const [roomName, socketSet] of rooms.entries()) {
                if (roomName.startsWith('family:')) {
                    const familyId = roomName.replace('family:', '');
                    
                    // Get connected user IDs for this family room
                    const connectedUserIds = new Set<string>();
                    
                    // Convert Set to Array for iteration
                    const socketIds = Array.from(socketSet || []);
                    
                    // Map socket IDs to user IDs
                    for (const socketId of socketIds) {
                        const userId = this.socketUsers.get(socketId);
                        if (userId) {
                            connectedUserIds.add(userId);
                        }
                    }
                    
                    // Only send event if there are connected users
                    if (connectedUserIds.size > 0) {
                        // Send the connected caregivers event to this family room
                        this.sendEventToFamily(familyId, 'family.connected.caregivers', {
                            type: 'family.connected.caregivers',
                            familyId: familyId,
                            connectedUserIds: Array.from(connectedUserIds),
                            timestamp: new Date().toISOString()
                        });

                        familyRoomsProcessed++;
                    }
                }
            }

            console.log(`Sent connected caregivers events to ${familyRoomsProcessed} family rooms`);
        } catch (error) {
            console.error('Error sending connected caregivers event:', error);
            // Use fallback method in case of error
            this.sendConnectedCaregiversEventFallback();
        }
    }
    
    /**
     * Fallback method for sending connected caregivers information
     * This is used when the Socket.IO adapter rooms property is not available
     */
    private sendConnectedCaregiversEventFallback() {
        try {
            console.log(this.server);
        } catch (error) {
            console.error('Error in fallback method for connected caregivers event:', error);
        }
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

            // Send initial connected caregivers update for all families the user belongs to
            setTimeout(async () => {
                try {
                    const userFamilies = await this.familiesService.getUserFamilies(userId);
                    for (const userFamily of userFamilies) {
                        await this.sendConnectedCaregiversForFamily(userFamily.familyId);
                    }
                } catch (error) {
                    console.error('Error sending initial connected caregivers:', error);
                }
            }, 1000); // Short delay to ensure client is fully ready

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

    /**
     * Sends connected caregivers information for a specific family
     * This is used for initial connection to immediately show online status
     */
    private async sendConnectedCaregiversForFamily(familyId: string) {
        try {
            console.log(`Sending connected caregivers for family ${familyId}`);

            const connectedUserIds = new Set<string>();

            // Check all connected sockets to see if any belong to this family's members
            for (const [socketId, userId] of this.socketUsers.entries()) {
                try {
                    const userFamily = await this.familiesService.getUserFamilyRole(userId, familyId);
                    if (userFamily) {
                        connectedUserIds.add(userId);
                        console.log(`User ${userId} is connected and member of family ${familyId}`);
                    }
                } catch (error) {
                    // User is not a member of this family, skip
                    continue;
                }
            }

            // Send event to family room with connected users
            const userIdsArray = Array.from(connectedUserIds);
            const eventData = {
                type: 'family.connected.caregivers',
                familyId: familyId,
                connectedUserIds: userIdsArray,
                timestamp: new Date().toISOString()
            };

            console.log(`Sending connected caregivers to family ${familyId}:`, userIdsArray);
            this.sendEventToFamily(familyId, 'family.connected.caregivers', eventData);

        } catch (error) {
            console.error(`Error sending connected caregivers for family ${familyId}:`, error);
        }
    }

    @SubscribeMessage('request-connected-caregivers')
    async handleRequestConnectedCaregivers(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { familyId?: string }
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

            // If familyId is provided, send for that specific family
            if (data?.familyId) {
                // Verify that the user has access to this family
                try {
                    const userFamily = await this.familiesService.getUserFamilyRole(userId, data.familyId);
                    if (!userFamily) {
                        client.emit('error', {
                            code: 6,
                            message: 'You do not have access to this family',
                            type: 'ACCESS_DENIED'
                        });
                        return;
                    }

                    await this.sendConnectedCaregiversForFamily(data.familyId);
                } catch (error) {
                    console.error('Error requesting connected caregivers for specific family:', error);
                }
            } else {
                // Send for all families the user belongs to
                try {
                    const userFamilies = await this.familiesService.getUserFamilies(userId);
                    for (const userFamily of userFamilies) {
                        await this.sendConnectedCaregiversForFamily(userFamily.familyId);
                    }
                } catch (error) {
                    console.error('Error requesting connected caregivers for all families:', error);
                }
            }
        } catch (error) {
            console.error('Error handling request for connected caregivers:', error);
            client.emit('error', {
                code: 8,
                message: 'Failed to request connected caregivers',
                type: 'REQUEST_CAREGIVERS_ERROR',
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
