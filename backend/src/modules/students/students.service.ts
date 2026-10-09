import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity.js';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student)
        private readonly studentsRepository: Repository<Student>,
    ) { }

    async findById(id: string): Promise<Student> {
        const student = await this.studentsRepository.findOne({
            where: { id },
        });
        if (!student) {
            throw new NotFoundException(`Student with id "${id}" not found.`);
        }
        return student;
    }
}