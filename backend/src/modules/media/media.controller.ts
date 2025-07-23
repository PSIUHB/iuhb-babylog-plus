import {
    Controller,
    Post,
    Delete,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    BadRequestException,
    InternalServerErrorException,
    Logger,
    Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { multerOptions } from '@/config/multer.config';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
    private readonly logger = new Logger(MediaController.name);
    
    constructor(private readonly mediaService: MediaService) {}

    @Post('upload/:type')
    @ApiOperation({ summary: 'Upload a single file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file', multerOptions('avatars')))
    async uploadFile(
        @Param('type') type: string,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: User,
    ) {
        try {
            if (!file) {
                throw new BadRequestException('No file uploaded');
            }

            // Validate file type
            const allowedTypes = ['avatars', 'documents', 'events'];
            if (!allowedTypes.includes(type)) {
                throw new BadRequestException('Invalid upload type');
            }

            this.logger.log(`Processing ${type} upload: ${file.originalname} (${file.size} bytes)`);
            
            // Ensure upload directories exist
            const uploadPath = './uploads';
            const typeDir = join(uploadPath, type);
            
            if (!existsSync(uploadPath)) {
                this.logger.log(`Creating base upload directory: ${uploadPath}`);
                try {
                    mkdirSync(uploadPath, { recursive: true });
                } catch (dirError) {
                    this.logger.error(`Failed to create upload directory: ${dirError.message}`);
                    throw new InternalServerErrorException(
                        'Failed to create upload directory. Please try again later.',
                        { cause: dirError }
                    );
                }
            }
            
            if (!existsSync(typeDir)) {
                this.logger.log(`Creating ${type} directory: ${typeDir}`);
                try {
                    mkdirSync(typeDir, { recursive: true });
                } catch (dirError) {
                    this.logger.error(`Failed to create ${type} directory: ${dirError.message}`);
                    throw new InternalServerErrorException(
                        `Failed to create ${type} directory. Please try again later.`,
                        { cause: dirError }
                    );
                }
            }
            
            let fileUrl: string;

            if (type === 'avatars') {
                try {
                    // Process avatar images
                    fileUrl = await this.mediaService.processImage(file, {
                        width: 400,
                        height: 400,
                        quality: 85,
                    });
                    this.logger.log(`Avatar processed successfully: ${fileUrl}`);
                } catch (processError) {
                    this.logger.error(`Error processing avatar image: ${processError.message}`, processError.stack);
                    throw new InternalServerErrorException(
                        'Failed to process the avatar image. Please try again later.',
                        { cause: processError }
                    );
                }
            } else {
                fileUrl = this.mediaService.getFileUrl(type, file.filename);
                this.logger.log(`File uploaded successfully: ${fileUrl}`);
            }

            return {
                url: fileUrl,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
            };
        } catch (error) {
            this.logger.error(`Error uploading file: ${error.message}`, error.stack);
            
            if (error instanceof BadRequestException) {
                throw error; // Re-throw client errors
            }
            
            if (error instanceof InternalServerErrorException) {
                throw error; // Re-throw already formatted server errors
            }
            
            throw new InternalServerErrorException(
                'Failed to process the uploaded file. Please try again later.',
                { cause: error }
            );
        }
    }

    @Post('upload-multiple/:type')
    @ApiOperation({ summary: 'Upload multiple files' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 10, multerOptions('documents')))
    async uploadMultipleFiles(
        @Param('type') type: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: User,
    ) {
        try {
            if (!files || files.length === 0) {
                throw new BadRequestException('No files uploaded');
            }

            // Validate file type
            const allowedTypes = ['avatars', 'documents', 'events'];
            if (!allowedTypes.includes(type)) {
                throw new BadRequestException('Invalid upload type');
            }

            this.logger.log(`Processing multiple ${type} uploads: ${files.length} files`);

            const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    const fileUrl = this.mediaService.getFileUrl(type, file.filename);
                    this.logger.log(`File uploaded successfully: ${fileUrl}`);
                    return {
                        url: fileUrl,
                        filename: file.filename,
                        originalName: file.originalname,
                        size: file.size,
                        mimeType: file.mimetype,
                    };
                }),
            );

            return { files: uploadedFiles };
        } catch (error) {
            this.logger.error(`Error uploading multiple files: ${error.message}`, error.stack);
            
            if (error instanceof BadRequestException) {
                throw error; // Re-throw client errors
            }
            
            throw new InternalServerErrorException(
                'Failed to process the uploaded files. Please try again later.',
                { cause: error }
            );
        }
    }

    @Delete(':type/:filename')
    @ApiOperation({ summary: 'Delete a file' })
    async deleteFile(
        @Param('type') type: string,
        @Param('filename') filename: string,
        @CurrentUser() user: User,
    ) {
        try {
            // Validate file type
            const allowedTypes = ['avatars', 'documents', 'events'];
            if (!allowedTypes.includes(type)) {
                throw new BadRequestException('Invalid file type');
            }

            const fileUrl = `/uploads/${type}/${filename}`;
            this.logger.log(`Deleting file: ${fileUrl}`);
            
            await this.mediaService.deleteUploadedFile(fileUrl);
            
            this.logger.log(`File deleted successfully: ${fileUrl}`);
            return { message: 'File deleted successfully' };
        } catch (error) {
            this.logger.error(`Error deleting file: ${error.message}`, error.stack);
            
            if (error instanceof BadRequestException) {
                throw error; // Re-throw client errors
            }
            
            throw new InternalServerErrorException(
                'Failed to delete the file. Please try again later.',
                { cause: error }
            );
        }
    }
}