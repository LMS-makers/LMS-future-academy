import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Department } from '../../../common/enums.js';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('staff')
export class Staff extends BaseEntity {
    @OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column()
    fullName: string;

    @Column()
    title: string; 

    @Column({ type: 'enum', enum: Department, nullable: true })
    department?: Department;
}