import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { CourseRole } from '../../../common/enums.js';
import { Staff } from '../../staff/entities/staff.entity.js';
import { CourseEdition } from './course-edition.entity.js';

@Entity('course_assignments')
@Unique(['courseEdition', 'staff'])
export class CourseAssignment extends BaseEntity {
    @ManyToOne(() => CourseEdition, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'course_edition_id' })
    courseEdition: CourseEdition;

    @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'staff_id' })
    staff: Staff;

    @Column({ type: 'enum', enum: CourseRole, default: CourseRole.LECTURER })
    role: CourseRole;

    @Column({ type: 'text', array: true, nullable: true })
    assignedSections?: string[];
}