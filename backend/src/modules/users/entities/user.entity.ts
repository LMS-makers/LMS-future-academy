import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { UserRole } from '../../../common/enums.js';


@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    nationalId: string;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;
}