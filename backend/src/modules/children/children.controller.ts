// src/modules/children/children.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { multerOptions } from '@/config/multer.config';

@ApiTags('children')
@Controller('children')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChildrenController {
    constructor(private readonly childrenService: ChildrenService) {}

    @Post('family/:familyId')
    @ApiOperation({ summary: 'Create a new child' })
    create(
        @Param('familyId') familyId: string,
        @Body() createChildDto: CreateChildDto,
        @CurrentUser() user: User,
    ) {
        return this.childrenService.create(createChildDto, user, familyId);
    }

    @Get('family/:familyId')
    @ApiOperation({ summary: 'Get all children in a family' })
    findAllByFamily(
        @Param('familyId') familyId: string,
        @CurrentUser() user: User,
    ) {
        return this.childrenService.findAllByFamily(familyId, user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get child by id' })
    findOne(@Param('id') id: string, @CurrentUser() user: User) {
        return this.childrenService.findOne(id, user);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update child' })
    update(
        @Param('id') id: string,
        @Body() updateChildDto: UpdateChildDto,
        @CurrentUser() user: User,
    ) {
        return this.childrenService.update(id, updateChildDto, user);
    }

    @Post(':id/avatar')
    @ApiOperation({ summary: 'Upload child avatar' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file', multerOptions('avatars')))
    uploadAvatar(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: User,
    ) {
        return this.childrenService.uploadAvatar(id, file, user);
    }

    @Get(':id/statistics')
    @ApiOperation({ summary: 'Get child statistics' })
    getChildStatistics(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        return this.childrenService.getChildStatistics(id, user);
    }
}