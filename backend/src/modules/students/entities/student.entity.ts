import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { AcademicYear, Department } from '../../../common/enums.js';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';


@Entity('students')
export class Student extends BaseEntity {
    @OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column()
    fullName: string;

    @Column({ unique: true })
    studentCode: string;

    @Column({ type: 'enum', enum: AcademicYear })
    academicYear: AcademicYear;

    @Column({ type: 'enum', enum: Department, default: Department.GENERAL })
    department: Department;

    @Column({ nullable: true })
    section?: string;

    @Column({ type: 'float', nullable: true })
    gpa?: number;

    @Column({ type: 'float', nullable: true })
    cgpa?: number;
}