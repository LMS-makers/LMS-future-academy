import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { QueryCourseDto } from './dto/query-course.dto.js';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course)
        private readonly coursesRepository: Repository<Course>,
    ) { }

    async create(dto: CreateCourseDto): Promise<Course> {
        await this.ensureCodeIsFree(dto.code);

        const course = this.coursesRepository.create(dto);
        return this.coursesRepository.save(course);
    }

    async findAll(query: QueryCourseDto): Promise<Course[]> {
        const qb = this.coursesRepository.createQueryBuilder('course');

        if (query.department) {
            qb.andWhere('course.department = :department', { department: query.department });
        }

        if (query.code) {
            qb.andWhere('course.code ILIKE :code', { code: `%${query.code}%` });
        }

        if (!query.includeArchived) {
            qb.andWhere('course.isActive = true');
        }

        return qb.orderBy('course.code', 'ASC').getMany();
    }

    async findOne(id: string): Promise<Course> {
        const course = await this.coursesRepository.findOne({ where: { id } });

        if (!course) {
            throw new NotFoundException(`Course with id "${id}" not found.`);
        }

        return course;
    }

    async update(id: string, dto: UpdateCourseDto): Promise<Course> {
        const course = await this.findOne(id);

        if (dto.code && dto.code !== course.code) {
            await this.ensureCodeIsFree(dto.code);
        }

        Object.assign(course, dto);
        return this.coursesRepository.save(course);
    }

    async archive(id: string): Promise<Course> {
        const course = await this.findOne(id);
        course.isActive = false;
        return this.coursesRepository.save(course);
    }

    async unarchive(id: string): Promise<Course> {
        const course = await this.findOne(id);
        course.isActive = true;
        return this.coursesRepository.save(course);
    }

    private async ensureCodeIsFree(code: string): Promise<void> {
        const existing = await this.coursesRepository.findOne({ where: { code } });

        if (existing) {
            throw new ConflictException(`A course with code "${code}" already exists.`);
        }
    }
}
