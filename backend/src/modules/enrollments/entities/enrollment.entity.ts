import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Student } from '../../students/entities/student.entity.js';
import { CourseEdition } from '../../course-editions/entities/course-edition.entity.js';

@Entity('enrollments')
@Unique(['student', 'courseEdition'])
export class Enrollment extends BaseEntity {
    @ApiProperty({
        description: 'Student associated with this enrollment',
    })
    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @ApiProperty({
        description: 'Course edition the student is enrolled in',
    })
    @ManyToOne(() => CourseEdition, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'course_edition_id' })
    courseEdition: CourseEdition;

    @ApiProperty({
        description: 'Whether the student is currently enrolled',
        example: true,
    })
    @Column({ type: 'boolean', default: true })
    isEnrolled: boolean;
}