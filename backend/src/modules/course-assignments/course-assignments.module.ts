import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseAssignmentsService } from './course-assignments.service.js';
import { CourseAssignmentsController } from './course-assignments.controller.js';
import { CourseAssignment } from './entities/course-assignment.entity.js';
import { CourseEditionsModule } from '../course-editions/course-editions.module.js';
import { StaffModule } from '../staff/staff.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([CourseAssignment]),
        StaffModule,
        CourseEditionsModule,
    ],
    providers: [CourseAssignmentsService],
    controllers: [CourseAssignmentsController],
    exports: [CourseAssignmentsService],
})
export class CourseAssignmentsModule { }