import { Entity, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Submission } from './submission.entity.js';
import { Staff } from '../../staff/entities/staff.entity.js';

@Entity('evaluations')
export class Evaluation extends BaseEntity {
    @OneToOne(() => Submission, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'submission_id' })
    submission: Submission;

    @ManyToOne(() => Staff, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'graded_by' })
    gradedBy: Staff; 

    @Column({ type: 'float' })
    score: number;

    @Column({ type: 'text', nullable: true })
    feedback?: string;
}