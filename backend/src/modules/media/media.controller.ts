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
    Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { multerOptions } from '@/config/multer.config';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
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
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Param('type') type: string,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: User,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Validate file type
        const allowedTypes = ['avatars', 'documents', 'events'];
        if (!allowedTypes.includes(type)) {
            throw new BadRequestException('Invalid upload type');
        }

        let fileUrl: string;

        if (type === 'avatars') {
            // Process avatar images
            fileUrl = await this.mediaService.processImage(file, {
                width: 400,
                height: 400,
                quality: 85,
            });
        } else {
            fileUrl = this.mediaService.getFileUrl(type, file.filename);
        }

        return {
            url: fileUrl,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
        };
    }

    @Post('upload-multiple/:type')
    @ApiOperation({ summary: 'Upload multiple files' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultipleFiles(
        @Param('type') type: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: User,
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                const fileUrl = this.mediaService.getFileUrl(type, file.filename);
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
    }

    @Delete(':type/:filename')
    @ApiOperation({ summary: 'Delete a file' })
    async deleteFile(
        @Param('type') type: string,
        @Param('filename') filename: string,
        @CurrentUser() user: User,
    ) {
        const fileUrl = `/uploads/${type}/${filename}`;
        await this.mediaService.deleteUploadedFile(fileUrl);

        return { message: 'File deleted successfully' };
    }
}