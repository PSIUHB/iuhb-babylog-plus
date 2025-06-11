import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs';

// Ensure upload directories exist
const uploadPath = './uploads';
const folders = ['avatars', 'documents', 'events'];

folders.forEach(folder => {
    const path = join(uploadPath, folder);
    if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
    }
});

export const multerOptions = (folder: string) => ({
    storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, callback: Function) => {
            const path = join(uploadPath, folder);
            callback(null, path);
        },
        filename: (req: Request, file: Express.Multer.File, callback: Function) => {
            const name = uuidv4();
            const extension = extname(file.originalname);
            const filename = `${name}${extension}`;
            callback(null, filename);
        },
    }),
    fileFilter: (req: Request, file: Express.Multer.File, callback: Function) => {
        // Define allowed file types per folder
        const allowedTypes: Record<string, RegExp> = {
            avatars: /\.(jpg|jpeg|png|gif|webp)$/,
            documents: /\.(jpg|jpeg|png|gif|pdf|doc|docx)$/,
            events: /\.(jpg|jpeg|png|gif|webp|mp4|mov)$/,
        };

        const pattern = allowedTypes[folder] || allowedTypes.events;

        if (!file.originalname.match(pattern)) {
            return callback(
                new BadRequestException(`Invalid file type for ${folder}. Allowed types: ${pattern}`),
                false,
            );
        }
        callback(null, true);
    },
    limits: {
        fileSize: folder === 'avatars' ? 5 * 1024 * 1024 : 10 * 1024 * 1024, // 5MB for avatars, 10MB for others
    },
});

export const imageFileFilter = (req: Request, file: Express.Multer.File, callback: Function) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
    }
    callback(null, true);
};

export const documentFileFilter = (req: Request, file: Express.Multer.File, callback: Function) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/)) {
        return callback(new BadRequestException('Invalid document format!'), false);
    }
    callback(null, true);
};