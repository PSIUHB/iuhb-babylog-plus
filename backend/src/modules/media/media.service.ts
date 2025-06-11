import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import sharp from 'sharp';

@Injectable()
export class MediaService {
    private readonly uploadPath = './uploads';

    async processImage(file: Express.Multer.File, options?: {
        width?: number;
        height?: number;
        quality?: number;
    }): Promise<string> {
        const { width = 800, height = 800, quality = 90 } = options || {};

        const processedFilename = `processed-${file.filename}`;
        const inputPath = file.path;
        const outputPath = join(this.uploadPath, 'avatars', processedFilename);

        await sharp(inputPath)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality })
            .toFile(outputPath);

        // Delete original file
        await this.deleteFile(inputPath);

        return `/uploads/avatars/${processedFilename}`;
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            if (existsSync(filePath)) {
                await unlink(filePath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    async deleteUploadedFile(url: string): Promise<void> {
        if (!url || !url.startsWith('/uploads/')) {
            return;
        }

        const filePath = join(this.uploadPath, url.replace('/uploads/', ''));
        await this.deleteFile(filePath);
    }

    getFileUrl(folder: string, filename: string): string {
        return `/uploads/${folder}/${filename}`;
    }

    validateFileSize(file: Express.Multer.File, maxSizeMB: number): boolean {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    }

    getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || '';
    }

    generateUniqueFilename(originalName: string): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const extension = this.getFileExtension(originalName);
        return `${timestamp}-${random}.${extension}`;
    }
}