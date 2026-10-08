import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { CourseTopic } from './course-topic.entity.js';

@Entity('materials')
export class Material extends BaseEntity {
    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @ManyToOne(() => CourseTopic, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'topic_id' })
    topic: CourseTopic;
}