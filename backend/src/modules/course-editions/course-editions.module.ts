import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEditionsService } from './course-editions.service.js';
import { CourseEditionsController } from './course-editions.controller.js';
import { CourseEdition } from './entities/course-edition.entity.js';
import { CoursesModule } from '../courses/courses.module.js';

@Module({
    imports: [TypeOrmModule.forFeature([CourseEdition]), CoursesModule],
    providers: [CourseEditionsService],
    controllers: [CourseEditionsController],
    exports: [CourseEditionsService],
})
export class CourseEditionsModule { }
