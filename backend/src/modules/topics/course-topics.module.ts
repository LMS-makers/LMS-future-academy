import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseTopic } from './entities/course-topic.entity.js';
import { CourseEditionsModule } from '../course-editions/course-editions.module.js';
import { CourseAssignmentsModule } from '../course-assignments/course-assignments.module.js';
import { StaffModule } from '../staff/staff.module.js';
import { StudentsModule } from '../students/students.module.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';
import { CourseTopicsService } from './course-topics.service.js';
import { CourseTopicsController } from './course-topics.controller.js';
import { Material } from './entities/material.entity.js';
import { Assignment } from './entities/assignment.entity.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([CourseTopic, Material, Assignment]),
        CourseEditionsModule,
        CourseAssignmentsModule,
        StaffModule,
        StudentsModule,
        EnrollmentsModule,
    ],
    providers: [CourseTopicsService],
    controllers: [CourseTopicsController],
    exports: [CourseTopicsService],
})
export class CourseTopicsModule { }
