import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity.js';
import { Evaluation } from './entities/evaluation.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Submission, Evaluation])],
    exports: [TypeOrmModule],
})
export class SubmissionsModule { }