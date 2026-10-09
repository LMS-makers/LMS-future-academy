import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseAssignmentsService } from './course-assignments.service.js';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UserRole } from '../../common/enums.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CourseAssignment } from './entities/course-assignment.entity.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@ApiTags('Course Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('course-editions/:editionId/assignments')
export class CourseAssignmentsController {
    constructor(private readonly courseAssignmentsService: CourseAssignmentsService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Assign a staff member (lecturer or assistant) to a course edition (Admin only)' })
    @ApiParam({ name: 'editionId', description: 'Course edition id (UUID)' })
    @ApiResponse({ status: 201, description: 'Assignment created.', type: CourseAssignment })
    @ApiResponse({ status: 404, description: 'Edition or staff member not found.' })
    @ApiResponse({ status: 409, description: 'Duplicate assignment, lecturer already set, or a section overlap.' })
    create(
        @Param('editionId', new ParseUUIDPipe()) editionId: string,
        @Body() dto: CreateCourseAssignmentDto,
    ): Promise<CourseAssignment> {
        return this.courseAssignmentsService.create(editionId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List the staff assigned to a course edition' })
    @ApiParam({ name: 'editionId', description: 'Course edition id (UUID)' })
    @ApiResponse({ status: 200, description: 'Assignments for this edition.', type: [CourseAssignment] })
    @ApiResponse({ status: 404, description: 'Edition not found.' })
    findAll(@Param('editionId', new ParseUUIDPipe()) editionId: string,): Promise<CourseAssignment[]> {
        return this.courseAssignmentsService.findAllForEdition(editionId);
    }

    @Delete(':assignmentId')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove a staff assignment from a course edition (Admin only)' })
    @ApiParam({ name: 'editionId', description: 'Course edition id (UUID)' })
    @ApiParam({ name: 'assignmentId', description: 'Assignment id (UUID)' })
    @ApiResponse({ status: 204, description: 'Assignment removed.' })
    @ApiResponse({ status: 404, description: 'Assignment not found on this edition.' })
    remove(
        @Param('editionId', new ParseUUIDPipe()) editionId: string,
        @Param('assignmentId', new ParseUUIDPipe()) assignmentId: string,
    ): Promise<void> {
        return this.courseAssignmentsService.remove(editionId, assignmentId);
    }
}
