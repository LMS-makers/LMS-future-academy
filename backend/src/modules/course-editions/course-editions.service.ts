import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEdition } from './entities/course-edition.entity.js';
import { CoursesService } from '../courses/courses.service.js';
import { CreateCourseEditionDto } from './dto/create-course-edition.dto.js';
import { QueryCourseEditionDto } from './dto/query-course-edition.dto.js';

@Injectable()
export class CourseEditionsService {
    constructor(
        @InjectRepository(CourseEdition)
        private readonly editionsRepository: Repository<CourseEdition>,
        private readonly coursesService: CoursesService,
    ) { }

    async create(dto: CreateCourseEditionDto): Promise<CourseEdition> {
        // Throws NotFoundException if the course doesn't exist.
        const course = await this.coursesService.findOne(dto.courseId);

        const duplicate = await this.editionsRepository.findOne({
            where: {
                course: { id: course.id },
                academicYear: dto.academicYear,
                year: dto.year,
                semester: dto.semester,
            },
        });

        if (duplicate) {
            throw new ConflictException(
                `An edition of "${course.code}" already exists for ${dto.academicYear} / ${dto.year} / ${dto.semester}.`,
            );
        }

        const edition = this.editionsRepository.create({
            course,
            academicYear: dto.academicYear,
            year: dto.year,
            semester: dto.semester,
        });

        return this.editionsRepository.save(edition);
    }

    async findAll(query: QueryCourseEditionDto): Promise<CourseEdition[]> {
        const qb = this.editionsRepository.createQueryBuilder('edition').leftJoinAndSelect('edition.course', 'course');

        if (query.courseId) {
            qb.andWhere('course.id = :courseId', { courseId: query.courseId });
        }

        if (query.academicYear) {
            qb.andWhere('edition.academicYear = :academicYear', { academicYear: query.academicYear });
        }

        if (query.semester) {
            qb.andWhere('edition.semester = :semester', { semester: query.semester });
        }

        if (!query.includeArchived) {
            qb.andWhere('edition.isActive = true');
        }

        return qb.orderBy('course.code', 'ASC').getMany();
    }

    async findOne(id: string): Promise<CourseEdition> {
        const edition = await this.editionsRepository.findOne({
             where: { id }, 
             relations: {
                course: true,
             }
         });

        if (!edition) {
            throw new NotFoundException(`Course edition with id "${id}" not found.`);
        }

        return edition;
    }

    async archive(id: string): Promise<CourseEdition> {
        const edition = await this.findOne(id);
        edition.isActive = false;
        return this.editionsRepository.save(edition);
    }

    async unarchive(id: string): Promise<CourseEdition> {
        const edition = await this.findOne(id);
        edition.isActive = true;
        return this.editionsRepository.save(edition);
    }
}
