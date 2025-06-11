import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@/modules/users/entities/user.entity';
import { Invitation } from '@/modules/families/entities/invitation.entity';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendWelcomeEmail(user: User) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Willkommen bei BabyLog+',
            template: './welcome',
            context: {
                name: user.firstName,
                appUrl: process.env.APP_URL,
            },
        });
    }

    async sendInvitationEmail(invitation: Invitation) {
        const inviteUrl = `${process.env.APP_URL}/invite/${invitation.token}`;

        await this.mailerService.sendMail({
            to: invitation.email,
            subject: 'Einladung zu BabyLog+ Familie',
            template: './invitation',
            context: {
                inviteUrl,
                familyName: invitation.family.name,
                inviterName: invitation.invitedBy?.firstName,
                expiresAt: invitation.expiresAt.toLocaleDateString('de-DE'),
            },
        });
    }

    async sendPasswordResetEmail(user: User, token: string) {
        const resetUrl = `${process.env.APP_URL}/reset-password/${token}`;

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Passwort zurücksetzen - BabyLog+',
            template: './password-reset',
            context: {
                name: user.firstName,
                resetUrl,
            },
        });
    }

    async sendNotificationEmail(user: User, notification: any) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Neue Benachrichtigung - BabyLog+',
            template: './notification',
            context: {
                name: user.firstName,
                notification,
                appUrl: process.env.APP_URL,
            },
        });
    }

    async sendDailyDigest(user: User, data: any) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Tägliche Zusammenfassung - BabyLog+',
            template: './daily-digest',
            context: {
                name: user.firstName,
                date: new Date().toLocaleDateString('de-DE'),
                ...data,
            },
        });
    }
}