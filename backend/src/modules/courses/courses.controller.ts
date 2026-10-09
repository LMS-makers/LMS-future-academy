import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums.js';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { QueryCourseDto } from './dto/query-course.dto.js';
import { Course } from './entities/course.entity.js';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new course in the catalog (Admin only)' })
    @ApiResponse({ status: 201, description: 'Course created successfully.', type: Course })
    @ApiResponse({ status: 409, description: 'A course with this code already exists.' })
    create(@Body() dto: CreateCourseDto): Promise<Course> {
        return this.coursesService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List courses, optionally filtered by department or code' })
    @ApiResponse({ status: 200, description: 'List of courses matching the filters.', type: [Course] })
    findAll(@Query() query: QueryCourseDto): Promise<Course[]> {
        return this.coursesService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single course by id' })
    @ApiParam({ name: 'id', description: 'Course id (UUID)' })
    @ApiResponse({ status: 200, description: 'The requested course.', type: Course })
    @ApiResponse({ status: 404, description: 'Course not found.' })
    findOne(@Param('id') id: string): Promise<Course> {
        return this.coursesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a course (Admin only)' })
    @ApiParam({ name: 'id', description: 'Course id (UUID)' })
    @ApiResponse({ status: 200, description: 'Course updated successfully.', type: Course })
    @ApiResponse({ status: 404, description: 'Course not found.' })
    @ApiResponse({ status: 409, description: 'A course with this code already exists.' })
    update(@Param('id') id: string, @Body() dto: UpdateCourseDto): Promise<Course> {
        return this.coursesService.update(id, dto);
    }

    @Patch(':id/archive')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Archive a course instead of deleting it (Admin only)' })
    @ApiParam({ name: 'id', description: 'Course id (UUID)' })
    @ApiResponse({ status: 200, description: 'Course archived.', type: Course })
    @ApiResponse({ status: 404, description: 'Course not found.' })
    archive(@Param('id') id: string): Promise<Course> {
        return this.coursesService.archive(id);
    }

    @Patch(':id/unarchive')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Restore a previously archived course (Admin only)' })
    @ApiParam({ name: 'id', description: 'Course id (UUID)' })
    @ApiResponse({ status: 200, description: 'Course unarchived.', type: Course })
    @ApiResponse({ status: 404, description: 'Course not found.' })
    unarchive(@Param('id') id: string): Promise<Course> {
        return this.coursesService.unarchive(id);
    }
}
