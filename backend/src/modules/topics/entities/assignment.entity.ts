import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { CourseTopic } from './course-topic.entity.js';

@Entity('assignments')
export class Assignment extends BaseEntity {
    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'timestamp with time zone' })
    dueDate: Date;

    @Column({ type: 'float', default: 10 })
    maxScore: number;

    @ManyToOne(() => CourseTopic, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'topic_id' })
    topic: CourseTopic;
}