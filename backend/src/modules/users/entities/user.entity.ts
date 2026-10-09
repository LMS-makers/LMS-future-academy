import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { AccountStatus, UserRole } from '../../../common/enums.js';


@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    nationalId: string;

    @Column({ nullable: true })
    password?: string;

    @Column({ type: 'varchar', unique: true, nullable: true })
    email: string;

    @Column({ type: 'varchar', unique: true, nullable: true })
    phone: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;

    @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.PENDING_ACTIVATION })
    accountStatus: AccountStatus;

    @Column({ default: true })
    isActive: boolean;
}