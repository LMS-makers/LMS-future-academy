import {
    Controller,
    Get,
    Param,
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
import { Enrollment } from './entities/enrollment.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums.js';

@ApiTags('Course Edition Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('course-editions/:id/enrollments')
export class CourseEditionEnrollmentsController {
    constructor(
        private readonly enrollmentsService: EnrollmentsService,
    ) { }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Get the active student roster for a course edition (Admin only)',
    })
    @ApiParam({
        name: 'id',
        description: 'Course edition ID (UUID)',
    })
    @ApiResponse({
        status: 200,
        description: 'Active enrollments for the course edition.',
        type: [Enrollment],
    })
    @ApiResponse({
        status: 404,
        description: 'Course edition not found.',
    })
    findByEdition(
        @Param('id') editionId: string,
    ): Promise<Enrollment[]> {
        return this.enrollmentsService.findByEdition(editionId);
    }
}