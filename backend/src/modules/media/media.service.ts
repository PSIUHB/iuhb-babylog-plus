import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as sharp from 'sharp';

@Injectable()
export class MediaService {
    private readonly uploadPath = './uploads';

    async processImage(file: Express.Multer.File, options?: {
        width?: number;
        height?: number;
        quality?: number;
    }): Promise<string> {
        try {
            const { width = 800, height = 800, quality = 90 } = options || {};

            // Validate input file
            if (!file || !file.path) {
                throw new Error('Invalid file provided for processing');
            }

            // Ensure the base upload directory exists
            if (!existsSync(this.uploadPath)) {
                console.log(`Creating base upload directory: ${this.uploadPath}`);
                try {
                    mkdirSync(this.uploadPath, { recursive: true });
                } catch (dirError) {
                    console.error(`Failed to create base upload directory: ${dirError.message}`);
                    throw new Error(`Failed to create upload directory: ${dirError.message}`);
                }
            }

            // Ensure the avatars directory exists
            const avatarsDir = join(this.uploadPath, 'avatars');
            if (!existsSync(avatarsDir)) {
                console.log(`Creating avatars directory: ${avatarsDir}`);
                try {
                    mkdirSync(avatarsDir, { recursive: true });
                } catch (dirError) {
                    console.error(`Failed to create avatars directory: ${dirError.message}`);
                    throw new Error(`Failed to create avatars directory: ${dirError.message}`);
                }
            }

            const processedFilename = `processed-${file.filename}`;
            const inputPath = file.path;
            const outputPath = join(this.uploadPath, 'avatars', processedFilename);

            console.log(`Processing image from ${inputPath} to ${outputPath}`);
            console.log(`Image options: width=${width}, height=${height}, quality=${quality}`);

            // Verify input file exists
            if (!existsSync(inputPath)) {
                throw new Error(`Input file does not exist at ${inputPath}`);
            }

            try {
                // Process the image
                await sharp(inputPath)
                    .resize(width, height, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .jpeg({ quality })
                    .toFile(outputPath);
                
                console.log(`Image processed successfully: ${outputPath}`);
            } catch (sharpError) {
                console.error('Error during image processing with Sharp:', sharpError);
                throw new Error(`Image processing failed: ${sharpError.message}`);
            }

            // Verify the processed file exists
            if (!existsSync(outputPath)) {
                throw new Error(`Processed file was not created at ${outputPath}`);
            }

            // Delete original file
            try {
                await this.deleteFile(inputPath);
                console.log(`Original file deleted: ${inputPath}`);
            } catch (deleteError) {
                console.warn(`Warning: Could not delete original file: ${deleteError.message}`);
                // Continue execution even if deletion fails
            }

            return `/uploads/avatars/${processedFilename}`;
        } catch (error) {
            console.error('Error processing image:', error);
            // Rethrow with more detailed message
            throw new Error(`Failed to process image: ${error.message}`);
        }
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            if (!filePath) {
                console.warn('No file path provided for deletion');
                return;
            }

            console.log(`Attempting to delete file: ${filePath}`);
            
            if (existsSync(filePath)) {
                await unlink(filePath);
                console.log(`File deleted successfully: ${filePath}`);
            } else {
                console.warn(`File not found for deletion: ${filePath}`);
            }
        } catch (error) {
            console.error(`Error deleting file ${filePath}:`, error);
            // We don't rethrow the error to prevent deletion failures from affecting other operations
        }
    }

    async deleteUploadedFile(url: string): Promise<void> {
        try {
            if (!url) {
                console.warn('No URL provided for file deletion');
                return;
            }

            if (!url.startsWith('/uploads/')) {
                console.warn(`Invalid URL format for deletion: ${url}`);
                return;
            }

            const filePath = join(this.uploadPath, url.replace('/uploads/', ''));
            console.log(`Deleting uploaded file: ${url} (path: ${filePath})`);
            
            await this.deleteFile(filePath);
        } catch (error) {
            console.error(`Error deleting uploaded file ${url}:`, error);
            // We don't rethrow the error to prevent deletion failures from affecting other operations
        }
    }

    getFileUrl(folder: string, filename: string): string {
        if (!folder || !filename) {
            console.warn(`Invalid parameters for getFileUrl: folder=${folder}, filename=${filename}`);
            return '';
        }
        
        // Sanitize folder and filename to prevent path traversal
        const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '');
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-_.]/g, '');
        
        if (sanitizedFolder !== folder || sanitizedFilename !== filename) {
            console.warn(`Parameters sanitized in getFileUrl: 
                original folder=${folder}, sanitized folder=${sanitizedFolder}
                original filename=${filename}, sanitized filename=${sanitizedFilename}`);
        }
        
        return `/uploads/${sanitizedFolder}/${sanitizedFilename}`;
    }

    validateFileSize(file: Express.Multer.File, maxSizeMB: number): boolean {
        if (!file) {
            console.warn('No file provided for size validation');
            return false;
        }
        
        if (maxSizeMB <= 0) {
            console.warn(`Invalid maxSizeMB parameter: ${maxSizeMB}`);
            return false;
        }
        
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const isValid = file.size <= maxSizeBytes;
        
        if (!isValid) {
            console.warn(`File size validation failed: ${file.size} bytes exceeds limit of ${maxSizeBytes} bytes (${maxSizeMB}MB)`);
        }
        
        return isValid;
    }

    getFileExtension(filename: string): string {
        if (!filename) {
            console.warn('No filename provided for extension extraction');
            return '';
        }
        
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        
        if (!extension) {
            console.warn(`No extension found in filename: ${filename}`);
        }
        
        return extension;
    }

    generateUniqueFilename(originalName: string): string {
        if (!originalName) {
            console.warn('No original name provided for unique filename generation');
            originalName = 'unknown.txt';
        }
        
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const extension = this.getFileExtension(originalName);
        
        const uniqueFilename = `${timestamp}-${random}.${extension}`;
        console.log(`Generated unique filename: ${uniqueFilename} from original: ${originalName}`);
        
        return uniqueFilename;
    }
}