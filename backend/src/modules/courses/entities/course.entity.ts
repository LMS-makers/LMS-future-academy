import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { AcademicYear, CreditHours, Department } from '../../../common/enums.js';
import { CourseEdition } from './course-edition.entity.js';

@Entity('courses')
export class Course extends BaseEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @Column({ type: 'enum', enum: Department, default: Department.GENERAL })
    department: Department;

    @Column({ type: 'enum', enum: CreditHours, default: CreditHours.THREE })
    credit_hours: CreditHours; // 2 | 3 | 4

    @OneToMany(() => CourseEdition, edition => edition.course)
    editions: CourseEdition[];
}