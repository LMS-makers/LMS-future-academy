import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { CourseAssignmentsService } from './course-assignments.service.js';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto.js';
import { CourseAssignment } from './entities/course-assignment.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums.js';

@ApiTags('Course Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('course-editions/:id/assignments')
export class CourseAssignmentsController {
    constructor(
        private readonly courseAssignmentsService: CourseAssignmentsService,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Assign a lecturer or assistant to a course edition (Admin only)',
    })
    @ApiParam({
        name: 'id',
        description: 'Course edition ID (UUID)',
    })
    @ApiResponse({
        status: 201,
        description: 'Staff member assigned successfully.',
        type: CourseAssignment,
    })
    @ApiResponse({
        status: 404,
        description: 'Course edition or staff member not found.',
    })
    @ApiResponse({
        status: 409,
        description: 'Duplicate assignment or assignment limit exceeded.',
    })
    create(
        @Param('id') editionId: string,
        @Body() dto: CreateCourseAssignmentDto,
    ): Promise<CourseAssignment> {
        return this.courseAssignmentsService.create(editionId, dto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'List staff assignments for a course edition (Admin only)',
    })
    @ApiParam({
        name: 'id',
        description: 'Course edition ID (UUID)',
    })
    @ApiResponse({
        status: 200,
        description: 'Assignments for the requested course edition.',
        type: [CourseAssignment],
    })
    @ApiResponse({
        status: 404,
        description: 'Course edition not found.',
    })
    findAll(
        @Param('id') editionId: string,
    ): Promise<CourseAssignment[]> {
        return this.courseAssignmentsService.findAll(editionId);
    }

    @Delete(':assignmentId')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remove a staff assignment from a course edition (Admin only)',
    })
    @ApiParam({
        name: 'id',
        description: 'Course edition ID (UUID)',
    })
    @ApiParam({
        name: 'assignmentId',
        description: 'Course assignment ID (UUID)',
    })
    @ApiResponse({
        status: 204,
        description: 'Assignment removed successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Assignment not found in this course edition.',
    })
    async remove(
        @Param('id') editionId: string,
        @Param('assignmentId') assignmentId: string,
    ): Promise<void> {
        await this.courseAssignmentsService.remove(
            editionId,
            assignmentId,
        );
    }
}
