import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseTopic } from './entities/course-topic.entity.js';
import { Material } from './entities/material.entity.js';
import { Assignment } from './entities/assignment.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([CourseTopic, Material, Assignment])],
    exports: [TypeOrmModule],
})
export class TopicsModule { }