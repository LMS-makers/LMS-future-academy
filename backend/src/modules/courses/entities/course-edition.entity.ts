import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { AcademicYear, Semester } from '../../../common/enums.js';
import { Course } from './course.entity.js';

@Entity('course_editions')
export class CourseEdition extends BaseEntity {
    @ManyToOne(() => Course, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'course_id' })
    course: Course;

    @Column({ type: 'enum', enum: AcademicYear })
    academicYear: AcademicYear;

    @Column()
    year: string;

    @Column({ type: 'enum', enum: Semester })
    semester: Semester;

    @Column({ default: true })
    isActive: boolean;
}