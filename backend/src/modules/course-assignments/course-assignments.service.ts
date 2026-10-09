import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseAssignment } from './entities/course-assignment.entity.js';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto.js';
import { CourseRole } from '../../common/enums.js';
import { CourseEditionsService } from '../course-editions/course-editions.service.js';
import { StaffService } from '../staff/staff.service.js';

@Injectable()
export class CourseAssignmentsService {
    constructor(
        @InjectRepository(CourseAssignment)
        private readonly assignmentsRepository: Repository<CourseAssignment>,
        private readonly courseEditionsService: CourseEditionsService,
        private readonly staffService: StaffService,
    ) { }

    async create(
        editionId: string,
        dto: CreateCourseAssignmentDto,
    ): Promise<CourseAssignment> {
        const edition = await this.courseEditionsService.findOne(editionId);

        if (!edition) {
            throw new NotFoundException(
                `Course edition with id "${editionId}" not found.`,
            );
        }

        const staff = await this.staffService.findOne(dto.staffId);

        const duplicate = await this.assignmentsRepository.findOne({
            where: {
                courseEdition: { id: editionId },
                staff: { id: dto.staffId },
            },
        });

        if (duplicate) {
            throw new ConflictException(
                'This staff member is already assigned to this course edition.',
            );
        }

        if (dto.role === CourseRole.LECTURER) {
            const existingLecturer =
                await this.assignmentsRepository.findOne({
                    where: {
                        courseEdition: { id: editionId },
                        role: CourseRole.LECTURER,
                    },
                });

            if (existingLecturer) {
                throw new ConflictException(
                    'This course edition already has a lecturer.',
                );
            }
        }

        if (dto.role === CourseRole.ASSISTANT) {
            const assistantCount =
                await this.assignmentsRepository.count({
                    where: {
                        courseEdition: { id: editionId },
                        role: CourseRole.ASSISTANT,
                    },
                });

            if (assistantCount >= 3) {
                throw new ConflictException(
                    'A course edition cannot have more than 3 assistants.',
                );
            }
        }

        const assignment = this.assignmentsRepository.create({
            courseEdition: edition,
            staff,
            role: dto.role,
            assignedSections:
                dto.role === CourseRole.ASSISTANT
                    ? dto.assignedSections!
                    : null,
        });

        return this.assignmentsRepository.save(assignment);
    }

    async findAll(editionId: string): Promise<CourseAssignment[]> {
        const editionExists = await this.courseEditionsService.findOne(editionId);

        if (!editionExists) {
            throw new NotFoundException(
                `Course edition with id "${editionId}" not found.`,
            );
        }

        return this.assignmentsRepository.find({
            where: {
                courseEdition: { id: editionId },
            },
            relations: {
                staff: true,
            },
            order: {
                createdAt: 'ASC',
            },
        });
    }

    async remove(
        editionId: string,
        assignmentId: string,
    ): Promise<void> {
        const assignment = await this.assignmentsRepository.findOne({
            where: {
                id: assignmentId,
                courseEdition: { id: editionId },
            },
        });

        if (!assignment) {
            throw new NotFoundException(
                `Assignment with id "${assignmentId}" was not found in course edition "${editionId}".`,
            );
        }

        await this.assignmentsRepository.remove(assignment);
    }
}
