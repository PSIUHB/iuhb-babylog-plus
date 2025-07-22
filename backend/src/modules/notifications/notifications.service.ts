import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { WebSocketGateway } from '@/modules/websocket/websocket.gateway';
import { MailService } from '@/modules/mail/mail.service';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectQueue('notifications')
        private notificationQueue: Queue,
        private wsGateway: WebSocketGateway,
        private mailService: MailService,
    ) {}

    async create(data: {
        message: string;
        userId: string;
        type: string;
        data?: any;
        isRead?: boolean;
    }): Promise<Notification> {
        const notification = this.notificationRepository.create({
            user: { id: data.userId },
            type: data.type,
            message: data.message,
            isRead: data.isRead ?? false,
        });
        const saved = await this.notificationRepository.save(notification);

        // Send real-time notification
        this.wsGateway.sendEventToUser(data.userId, 'notification', saved);

        // Queue email notification if needed
        await this.notificationQueue.add('send-email', {
            notificationId: saved.id,
        });

        return saved;
    }

    async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
        const where: any = { user: { id: userId } };
        if (unreadOnly) {
            where.isRead = false;
        }
        return this.notificationRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(id: string, userId: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id, user: { id: userId } },
            relations: ['user'],
        });
        if (!notification) {
            throw new NotFoundException('Notification not found');
        }
        notification.isRead = true;
        notification.readAt = new Date();
        return this.notificationRepository.save(notification);
    }

    async markAllAsRead(userId: string): Promise<void> {
        const notifications = await this.notificationRepository.find({
            where: { user: { id: userId }, isRead: false },
            relations: ['user'],
        });
        for (const notification of notifications) {
            notification.isRead = true;
            notification.readAt = new Date();
            await this.notificationRepository.save(notification);
        }
    }

    async findOne(id: string): Promise<Notification | null> {
        return this.notificationRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }
}
