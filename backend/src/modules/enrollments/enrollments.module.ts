import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity.js';
import { EnrollmentsService } from './enrollments.service.js';
import { EnrollmentsController } from './enrollments.controller.js';
import { CourseEditionEnrollmentsController } from './course-edition-enrollments.controller.js';
import { CourseEditionsModule } from '../course-editions/course-editions.module.js';
import { StudentsModule } from '../students/students.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Enrollment]),
        CourseEditionsModule,
        StudentsModule,
    ],
    providers: [EnrollmentsService],
    controllers: [
        EnrollmentsController,
        CourseEditionEnrollmentsController,
    ],
    exports: [EnrollmentsService],
})
export class EnrollmentsModule { }