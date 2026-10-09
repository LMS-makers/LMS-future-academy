import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/enums.js';
import { MeService } from './me.service.js';
import { MyCourseDto } from './dto/my-course.dto.js';

@ApiTags('Me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('me')
export class MeController {
    constructor(private readonly meService: MeService) { }

    @Get('courses')
    @Roles(UserRole.STUDENT, UserRole.DOCTOR)
    @ApiOperation({
        summary:
            'List the current user\'s courses — active enrollments for a student, or assigned editions for a doctor/assistant',
    })
    @ApiResponse({ status: 200, description: "The current user's courses.", type: [MyCourseDto] })
    getMyCourses(@CurrentUser() user: { userId: string; role: UserRole }): Promise<MyCourseDto[]> {
        return this.meService.getMyCourses(user);
    }
}
