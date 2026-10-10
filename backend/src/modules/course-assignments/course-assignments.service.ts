import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEditionsService } from '../course-editions/course-editions.service.js';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto.js';
import { StaffService } from '../staff/staff.service.js';
import { CourseAssignment } from './entities/course-assignment.entity.js';
import { CourseRole } from '../../common/enums.js';

const MAX_ASSISTANTS_PER_EDITION = 3;

@Injectable()
export class CourseAssignmentsService {
    constructor(
        @InjectRepository(CourseAssignment)
        private readonly assignmentsRepository: Repository<CourseAssignment>,
        private readonly courseEditionsService: CourseEditionsService,
        private readonly staffService: StaffService
    ) { }

    async create(editionId: string, dto: CreateCourseAssignmentDto): Promise<CourseAssignment> {
        // Throws NotFoundException if the edition doesn't exist.
        const edition = await this.courseEditionsService.findOne(editionId);

        const staff = await this.staffService.findOne(dto.staffId)

        const existing = await this.assignmentsRepository.find({
            where: { courseEdition: { id: edition.id } },
            relations: {
                staff: true
            },
        });

        if (existing.some((a) => a.staff.id === staff.id)) {
            throw new ConflictException('This staff member is already assigned to this edition.');
        }

        if (dto.role === CourseRole.LECTURER) {
            const hasLecturer = existing.some((a) => a.role === CourseRole.LECTURER);
            if (hasLecturer) {
                throw new ConflictException('This edition already has a lecturer assigned.');
            }
        } else {
            const assistantCount = existing.filter((a) => a.role === CourseRole.ASSISTANT).length;
            if (assistantCount >= MAX_ASSISTANTS_PER_EDITION) {
                throw new BadRequestException(`An edition can have at most ${MAX_ASSISTANTS_PER_EDITION} assistants.`);
            }

            const takenSections = new Set(
                existing.filter((a) => a.role === CourseRole.ASSISTANT).flatMap((a) => a.assignedSections ?? []),
            );
            const overlap = (dto.assignedSections ?? []).filter((section) => takenSections.has(section));
            if (overlap.length > 0) {
                throw new ConflictException(
                    `Section(s) already assigned to another assistant on this edition: ${overlap.join(', ')}.`,
                );
            }
        }

        const assignment = this.assignmentsRepository.create({
            courseEdition: edition,
            staff,
            role: dto.role,
            assignedSections: dto.role === CourseRole.ASSISTANT ? dto.assignedSections : undefined,
        });

        return this.assignmentsRepository.save(assignment);
    }

    async findAllForEdition(editionId: string): Promise<CourseAssignment[]> {
        // Throws NotFoundException if the edition doesn't exist.
        await this.courseEditionsService.findOne(editionId);

        return this.assignmentsRepository.find({
            where: { courseEdition: { id: editionId } },
            relations: {
                staff: true
            }
        });
    }

    // All assignments for a staff member across every edition (any role).
    // Used by "/me/courses" to list what a doctor/assistant is teaching.
    async findByStaff(staffId: string): Promise<CourseAssignment[]> {
        return this.assignmentsRepository.find({
            where: { staff: { id: staffId } },
            relations: { courseEdition: { course: true } },
        });
    }

    // Used by write-access guards: is this staff member assigned (any role) to this edition?
    async isStaffAssignedToEdition(editionId: string, staffId: string): Promise<boolean> {
        const count = await this.assignmentsRepository.count({
            where: { courseEdition: { id: editionId }, staff: { id: staffId } },
        });
        return count > 0;
    }

    async remove(editionId: string, assignmentId: string): Promise<void> {
        const assignment = await this.assignmentsRepository.findOne({
            where: { id: assignmentId, courseEdition: { id: editionId } },
        });

        if (!assignment) {
            throw new NotFoundException(`Assignment with id "${assignmentId}" not found on this edition.`);
        }

        await this.assignmentsRepository.remove(assignment);
    }
}
