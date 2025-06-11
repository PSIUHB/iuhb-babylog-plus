import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
    ) {}

    async checkDatabaseConnection(): Promise<boolean> {
        try {
            await this.dataSource.query('SELECT 1');
            return true;
        } catch (error) {
            return false;
        }
    }

    async getSystemInfo() {
        return {
            nodeVersion: process.version,
            platform: process.platform,
            cpuUsage: process.cpuUsage(),
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
        };
    }

    async getApplicationInfo() {
        const dbConnected = await this.checkDatabaseConnection();

        return {
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV,
            database: {
                connected: dbConnected,
                type: this.dataSource.options.type,
            },
        };
    }
}