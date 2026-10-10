import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/enums.js';
import { CourseTopicsService } from './course-topics.service.js';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { CreateCourseTopicDto } from './dto/create-course-topic.dto.js';
import { UpdateCourseTopicDto } from './dto/update-course-topic.dto.js';
import { CourseTopic } from './entities/course-topic.entity.js';

@ApiTags('Course Topics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STUDENT)
@Controller('course-editions/:editionId/topics')
export class CourseTopicsController {
    constructor(private readonly courseTopicsService: CourseTopicsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a topic under a course edition (assigned lecturer/assistant, or Admin)' })
    @ApiParam({ name: 'editionId', description: 'Course edition id (UUID)' })
    @ApiResponse({ status: 201, description: 'Topic created.', type: CourseTopic })
    @ApiResponse({ status: 403, description: 'Not assigned to this course edition.' })
    @ApiResponse({ status: 404, description: 'Course edition not found.' })
    create(
        @Param('editionId') editionId: string,
        @Body() dto: CreateCourseTopicDto,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<CourseTopic> {
        return this.courseTopicsService.create(editionId, dto, user);
    }

    @Get()
    @ApiOperation({ summary: 'List topics for a course edition, ordered by orderIndex (enrolled student or assigned staff)' })
    @ApiParam({ name: 'editionId', description: 'Course edition id (UUID)' })
    @ApiResponse({ status: 200, description: 'Topics for this edition.', type: [CourseTopic] })
    @ApiResponse({ status: 403, description: 'Not enrolled in / not assigned to this course edition.' })
    findAll(
        @Param('editionId') editionId: string,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<CourseTopic[]> {
        return this.courseTopicsService.findAllForEdition(editionId, user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single topic (enrolled student or assigned staff)' })
    @ApiParam({ name: 'editionId', description: 'Course edition id (UUID)' })
    @ApiParam({ name: 'id', description: 'Topic id (UUID)' })
    @ApiResponse({ status: 200, description: 'The requested topic.', type: CourseTopic })
    @ApiResponse({ status: 403, description: 'Not enrolled in / not assigned to this course edition.' })
    @ApiResponse({ status: 404, description: 'Topic not found on this edition.' })
    findOne(
        @Param('editionId') editionId: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<CourseTopic> {
        return this.courseTopicsService.findOne(editionId, id, user);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a topic (assigned lecturer/assistant, or Admin)' })
    @ApiParam({ name: 'editionId', description: 'Course edition id (UUID)' })
    @ApiParam({ name: 'id', description: 'Topic id (UUID)' })
    @ApiResponse({ status: 200, description: 'Topic updated.', type: CourseTopic })
    @ApiResponse({ status: 403, description: 'Not assigned to this course edition.' })
    @ApiResponse({ status: 404, description: 'Topic not found on this edition.' })
    update(
        @Param('editionId') editionId: string,
        @Param('id') id: string,
        @Body() dto: UpdateCourseTopicDto,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<CourseTopic> {
        return this.courseTopicsService.update(editionId, id, dto, user);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a topic, cascading to its materials and attachments (assigned lecturer/assistant, or Admin)' })
    @ApiParam({ name: 'editionId', description: 'Course edition id (UUID)' })
    @ApiParam({ name: 'id', description: 'Topic id (UUID)' })
    @ApiResponse({ status: 204, description: 'Topic deleted.' })
    @ApiResponse({ status: 403, description: 'Not assigned to this course edition.' })
    @ApiResponse({ status: 404, description: 'Topic not found on this edition.' })
    remove(
        @Param('editionId') editionId: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<void> {
        return this.courseTopicsService.remove(editionId, id, user);
    }
}
