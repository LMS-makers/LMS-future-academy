import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Material } from '../../topics/entities/material.entity.js';
import { Assignment } from '../../topics/entities/assignment.entity.js';
import { Submission } from '../../submissions/entities/submission.entity.js';

@Entity('attachments')
export class Attachment extends BaseEntity {
    @Column()
    fileName: string;

    @Column()
    fileUrl: string; 

    @Column({ nullable: true })
    fileType?: string; 

    @Column({ type: 'int', nullable: true })
    fileSize?: number; 

    @ManyToOne(() => Material, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'material_id' })
    material?: Material;

    @ManyToOne(() => Assignment, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assignment_id' })
    assignment?: Assignment;

    @ManyToOne(() => Submission, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'submission_id' })
    submission?: Submission;
}