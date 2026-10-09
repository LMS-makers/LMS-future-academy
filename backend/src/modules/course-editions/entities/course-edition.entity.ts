import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { AcademicYear, Semester } from '../../../common/enums.js';
import { Course } from '../../courses/entities/course.entity.js';

// No back-relation to CourseAssignment here on purpose: importing it would
// create a circular import with course-assignment.entity.ts, which crashes
// at runtime under ESM + emitDecoratorMetadata (TDZ ReferenceError). Query
// the CourseAssignment repository by courseEdition.id instead.

@Entity('course_editions')
export class CourseEdition extends BaseEntity {
    @ManyToOne(() => Course, (course) => course.editions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'course_id' })
    course: Course;

    @ApiProperty({ description: 'Academic year this edition is offered to', enum: AcademicYear, example: AcademicYear.YEAR_1 })
    @Column({ type: 'enum', enum: AcademicYear })
    academicYear: AcademicYear;

    @ApiProperty({ description: 'The year this edition belongs to, as a label', example: '2026' })
    @Column()
    year: string;

    @ApiProperty({ description: 'Semester this edition runs in', enum: Semester, example: Semester.FIRST })
    @Column({ type: 'enum', enum: Semester })
    semester: Semester;

    @ApiProperty({ description: 'Whether the edition is open for the current term. Closed editions are archived, never deleted.', example: true })
    @Column({ default: true })
    isActive: boolean;
}