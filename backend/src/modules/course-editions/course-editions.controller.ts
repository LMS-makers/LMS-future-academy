import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums.js';
import { CourseEditionsService } from './course-editions.service.js';
import { CreateCourseEditionDto } from './dto/create-course-edition.dto.js';
import { QueryCourseEditionDto } from './dto/query-course-edition.dto.js';
import { CourseEdition } from './entities/course-edition.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Course Editions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('course-editions')
export class CourseEditionsController {
    constructor(private readonly courseEditionsService: CourseEditionsService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Open an edition of a course for the current term (Admin only). Only the courses actually offered this term — not bulk.' })
    @ApiResponse({ status: 201, description: 'Edition created successfully.', type: CourseEdition })
    @ApiResponse({ status: 404, description: 'Course not found.' })
    @ApiResponse({ status: 409, description: 'An edition for this course/year/semester already exists.' })
    create(@Body() dto: CreateCourseEditionDto): Promise<CourseEdition> {
        return this.courseEditionsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List course editions, optionally filtered by course, academic year or semester' })
    @ApiResponse({ status: 200, description: 'List of course editions matching the filters.', type: [CourseEdition] })
    findAll(@Query() query: QueryCourseEditionDto): Promise<CourseEdition[]> {
        return this.courseEditionsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single course edition by id' })
    @ApiParam({ name: 'id', description: 'Course edition id (UUID)' })
    @ApiResponse({ status: 200, description: 'The requested course edition.', type: CourseEdition })
    @ApiResponse({ status: 404, description: 'Course edition not found.' })
    findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<CourseEdition> {
        return this.courseEditionsService.findOne(id);
    }

    @Patch(':id/archive')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Close out a course edition at the end of term (Admin only). Never deleted.' })
    @ApiParam({ name: 'id', description: 'Course edition id (UUID)' })
    @ApiResponse({ status: 200, description: 'Edition archived.', type: CourseEdition })
    @ApiResponse({ status: 404, description: 'Course edition not found.' })
    archive(@Param('id', new ParseUUIDPipe()) id: string): Promise<CourseEdition> {
        return this.courseEditionsService.archive(id);
    }

    @Patch(':id/unarchive')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Reopen a previously archived course edition (Admin only)' })
    @ApiParam({ name: 'id', description: 'Course edition id (UUID)' })
    @ApiResponse({ status: 200, description: 'Edition unarchived.', type: CourseEdition })
    @ApiResponse({ status: 404, description: 'Course edition not found.' })
    unarchive(@Param('id', new ParseUUIDPipe()) id: string): Promise<CourseEdition> {
        return this.courseEditionsService.unarchive(id);
    }
}
