import { Entity, ManyToOne, JoinColumn, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Assignment } from '../../topics/entities/assignment.entity.js';
import { Student } from '../../students/entities/student.entity.js';

@Entity('submissions')
@Unique(['student', 'assignment']) 
export class Submission extends BaseEntity {
    @ManyToOne(() => Assignment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assignment_id' })
    assignment: Assignment;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;
}