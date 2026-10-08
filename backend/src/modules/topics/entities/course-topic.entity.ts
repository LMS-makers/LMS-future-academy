import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { CourseEdition } from '../../courses/entities/course-edition.entity.js';

@Entity('course_topics')
export class CourseTopic extends BaseEntity {
    @Column()
    title: string; 
    
    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'int', default: 1 })
    orderIndex: number;

    @ManyToOne(() => CourseEdition, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'course_edition_id' })
    edition: CourseEdition;
}