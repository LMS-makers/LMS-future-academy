import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module.js';
import { StaffModule } from '../staff/staff.module.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';
import { MeService } from './me.service.js';
import { MeController } from './me.controller.js';
import { CourseAssignmentsModule } from '../course-assignments/course-assignments.module.js';

@Module({
    imports: [StudentsModule, StaffModule, EnrollmentsModule, CourseAssignmentsModule],
    providers: [MeService],
    controllers: [MeController],
})
export class MeModule { }
