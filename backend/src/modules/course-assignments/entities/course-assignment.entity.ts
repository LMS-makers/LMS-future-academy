import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { CourseRole } from '../../../common/enums.js';
import { Staff } from '../../staff/entities/staff.entity.js';
import { CourseEdition } from '../../course-editions/entities/course-edition.entity.js';

// Note: a staff member's login role is UserRole.DOCTOR for both lecturers and
// teaching assistants. Whether they act as LECTURER or ASSISTANT on a given
// edition comes from this entity's `role`, not from UserRole.
@Entity('course_assignments')
@Unique(['courseEdition', 'staff'])
export class CourseAssignment extends BaseEntity {
    @ManyToOne(() => CourseEdition, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'course_edition_id' })
    courseEdition: CourseEdition;

    @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'staff_id' })
    staff: Staff;

    @ApiProperty({ description: 'Role this staff member has on the edition', enum: CourseRole, example: CourseRole.LECTURER })
    @Column({ type: 'enum', enum: CourseRole, default: CourseRole.LECTURER })
    role: CourseRole;

    @ApiProperty({
        description: 'Sections this assistant is responsible for. Null/empty for a LECTURER (sees all sections).',
        type: [String],
        example: ['Section 1', 'Section 3'],
        required: false,
    })
    @Column({ type: 'text', array: true, nullable: true })
    assignedSections: string[] | null;
}