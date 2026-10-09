import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { StudentsService } from '../students/students.service.js';
import { CourseEditionsService } from '../course-editions/course-editions.service.js';

@Injectable()
export class EnrollmentsService {
    constructor(
        @InjectRepository(Enrollment)
        private readonly enrollmentsRepository: Repository<Enrollment>,
        private readonly studentsService: StudentsService,
        private readonly courseEditionsService: CourseEditionsService
    ) { }

    async create(dto: CreateEnrollmentDto): Promise<Enrollment> {
        const student = await this.studentsService.findById(dto.studentId);

        const courseEdition = await this.courseEditionsService.findOne(dto.courseEditionId);

        const existingEnrollment = await this.enrollmentsRepository.findOne({
            where: {
                student: { id: student.id },
                courseEdition: { id: courseEdition.id },
            },
        });

        if (existingEnrollment) {
            if (existingEnrollment.isEnrolled) {
                throw new ConflictException(
                    'This student is already enrolled in this course edition.',
                );
            }

            existingEnrollment.isEnrolled = true;

            return this.enrollmentsRepository.save(existingEnrollment);
        }

        const enrollment = this.enrollmentsRepository.create({
            student,
            courseEdition,
            isEnrolled: true,
        });

        return this.enrollmentsRepository.save(enrollment);
    }

    async unenroll(id: string): Promise<Enrollment> {
        const enrollment = await this.enrollmentsRepository.findOne({
            where: { id },
        });

        if (!enrollment) {
            throw new NotFoundException(
                `Enrollment with id "${id}" not found.`,
            );
        }

        enrollment.isEnrolled = false;

        return this.enrollmentsRepository.save(enrollment);
    }

    async findByEdition(editionId: string): Promise<Enrollment[]> {
        const courseEdition = await this.courseEditionsService.findOne(editionId);
        return this.enrollmentsRepository.find({
            where: {
                courseEdition: { id: courseEdition.id },
                isEnrolled: true,
            },
            relations: {
                student: true,
            },
        });
    }
}