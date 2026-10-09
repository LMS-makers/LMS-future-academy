import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { CreditHours, Department } from '../../../common/enums.js';
import { CourseEdition } from '../../course-editions/entities/course-edition.entity.js';

@Entity('courses')
export class Course extends BaseEntity {
    @ApiProperty({ description: 'Course name', example: 'Calculus' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Unique course code', example: 'BS101' })
    @Column({ unique: true })
    code: string;

    @ApiProperty({ description: 'Department the course belongs to', enum: Department, example: Department.GENERAL })
    @Column({ type: 'enum', enum: Department, default: Department.GENERAL })
    department: Department;

    @ApiProperty({ description: 'Credit hours for the course', enum: CreditHours, example: CreditHours.THREE })
    @Column({ name: 'credit_hours', type: 'enum', enum: CreditHours, default: CreditHours.THREE })
    creditHours: CreditHours;

    @ApiProperty({ description: 'Whether the course is active in the catalog. Archived courses are kept, never deleted.', example: true })
    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => CourseEdition, (edition) => edition.course)
    editions: CourseEdition[];
}