import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../common/enums.js';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { CourseTopic } from './entities/course-topic.entity.js';
import { CourseEditionsService } from '../course-editions/course-editions.service.js';
import { CourseAssignmentsService } from '../course-assignments/course-assignments.service.js';
import { StaffService } from '../staff/staff.service.js';
import { StudentsService } from '../students/students.service.js';
import { EnrollmentsService } from '../enrollments/enrollments.service.js';
import { CreateCourseTopicDto } from './dto/create-course-topic.dto.js';
import { UpdateCourseTopicDto } from './dto/update-course-topic.dto.js';

@Injectable()
export class CourseTopicsService {
    constructor(
        @InjectRepository(CourseTopic)
        private readonly topicsRepository: Repository<CourseTopic>,
        private readonly courseEditionsService: CourseEditionsService,
        private readonly courseAssignmentsService: CourseAssignmentsService,
        private readonly staffService: StaffService,
        private readonly studentsService: StudentsService,
        private readonly enrollmentsService: EnrollmentsService,
    ) { }

    async create(editionId: string, dto: CreateCourseTopicDto, user: AuthenticatedUser): Promise<CourseTopic> {
        await this.ensureCanWrite(editionId, user);

        // Throws NotFoundException if the edition doesn't exist.
        const edition = await this.courseEditionsService.findOne(editionId);

        const topic = this.topicsRepository.create({ ...dto, edition });
        return this.topicsRepository.save(topic);
    }

    async findAllForEdition(editionId: string, user: AuthenticatedUser): Promise<CourseTopic[]> {
        await this.ensureCanRead(editionId, user);

        return this.topicsRepository.find({
            where: { edition: { id: editionId } },
            order: { orderIndex: 'ASC' },
        });
    }

    async findOne(editionId: string, id: string, user: AuthenticatedUser): Promise<CourseTopic> {
        await this.ensureCanRead(editionId, user);
        return this.findOneOrThrow(editionId, id);
    }

    async update(editionId: string, id: string, dto: UpdateCourseTopicDto, user: AuthenticatedUser): Promise<CourseTopic> {
        await this.ensureCanWrite(editionId, user);

        const topic = await this.findOneOrThrow(editionId, id);
        Object.assign(topic, dto);
        return this.topicsRepository.save(topic);
    }

    async remove(editionId: string, id: string, user: AuthenticatedUser): Promise<void> {
        await this.ensureCanWrite(editionId, user);

        const topic = await this.findOneOrThrow(editionId, id);
        // Cascades to this topic's Materials (and their Attachments) via onDelete: 'CASCADE'.
        await this.topicsRepository.remove(topic);
    }

    private async findOneOrThrow(editionId: string, id: string): Promise<CourseTopic> {
        const topic = await this.topicsRepository.findOne({
            where: { id, edition: { id: editionId } },
        });

        if (!topic) {
            throw new NotFoundException(`Topic with id "${id}" not found on this edition.`);
        }

        return topic;
    }

    // ADMIN can always write. A DOCTOR (lecturer or assistant) can write only
    // on editions they're actually assigned to — not just by having the role.
    private async ensureCanWrite(editionId: string, user: AuthenticatedUser): Promise<void> {
        if (user.role === UserRole.ADMIN) {
            return;
        }

        if (user.role !== UserRole.DOCTOR) {
            throw new ForbiddenException('Only an assigned lecturer or assistant can manage this edition\'s topics.');
        }

        const staff = await this.staffService.findByUserId(user.userId);
        const assigned = await this.courseAssignmentsService.isStaffAssignedToEdition(editionId, staff.id);

        if (!assigned) {
            throw new ForbiddenException('You are not assigned to this course edition.');
        }
    }

    // ADMIN can always read. A DOCTOR can read if assigned to the edition.
    // A STUDENT can read only if actively enrolled in the edition.
    private async ensureCanRead(editionId: string, user: AuthenticatedUser): Promise<void> {
        if (user.role === UserRole.ADMIN) {
            return;
        }

        if (user.role === UserRole.DOCTOR) {
            const staff = await this.staffService.findByUserId(user.userId);
            const assigned = await this.courseAssignmentsService.isStaffAssignedToEdition(editionId, staff.id);

            if (!assigned) {
                throw new ForbiddenException('You are not assigned to this course edition.');
            }
            return;
        }

        const student = await this.studentsService.findByUserId(user.userId);
        const enrolled = await this.enrollmentsService.isStudentEnrolled(student.id, editionId);

        if (!enrolled) {
            throw new ForbiddenException('You are not enrolled in this course edition.');
        }
    }
}
