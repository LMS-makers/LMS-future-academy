import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity.js';
import { CourseEdition } from './entities/course-edition.entity.js';
import { CourseAssignment } from './entities/course-assignment.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Course, CourseEdition, CourseAssignment])],
    exports: [TypeOrmModule],
})
export class CoursesModule { }