import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from './notifications.service';
import { UsersService } from "@/modules/users/users.service";
import { MailService } from '@/modules/mail/mail.service';
import { NotFoundException } from "@nestjs/common";

@Processor('notifications')
export class NotificationsProcessor {
    constructor(
        private notificationsService: NotificationsService,
        private mailService: MailService,
        private userService: UsersService
    ) {}

    @Process('send-email')
    async handleSendEmail(job: Job) {
        const { notificationId } = job.data;

        // Get notification details
        const notification = await this.notificationsService.findOne(notificationId);

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        // Determine if email should be sent based on user preferences
        const user = await this.userService.findOne(
            notification.user.id
        );

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.notifications) {
            await this.mailService.sendNotificationEmail(user, notification);
        }
    }

    @Process('reminder')
    async handleReminder(job: Job) {
        const { userId, childId, type, data } = job.data;

        await this.notificationsService.create({
            message: "TEST MESSAGE",
            userId,
            type: 'reminder',
            data: {
                childId,
                reminderType: type,
                ...data,
            }
        });
    }
}