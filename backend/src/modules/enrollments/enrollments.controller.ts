import {
    Body,
    Controller,
    Delete,
    Param,
    ParseUUIDPipe,
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

import { EnrollmentsService } from './enrollments.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { Enrollment } from './entities/enrollment.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums.js';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
    constructor(
        private readonly enrollmentsService: EnrollmentsService,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Manually enroll a student in a course edition (Admin only)',
    })
    @ApiResponse({
        status: 201,
        description: 'Student enrolled successfully.',
        type: Enrollment,
    })
    @ApiResponse({
        status: 404,
        description: 'Student or course edition not found.',
    })
    @ApiResponse({
        status: 409,
        description: 'Student is already enrolled.',
    })
    create(
        @Body() dto: CreateEnrollmentDto,
    ): Promise<Enrollment> {
        return this.enrollmentsService.create(dto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Unenroll a student without deleting the enrollment record (Admin only)',
    })
    @ApiParam({
        name: 'id',
        description: 'Enrollment ID (UUID)',
    })
    @ApiResponse({
        status: 200,
        description: 'Enrollment marked as inactive.',
        type: Enrollment,
    })
    @ApiResponse({
        status: 404,
        description: 'Enrollment not found.',
    })
    unenroll(
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<Enrollment> {
        return this.enrollmentsService.unenroll(id);
    }
}