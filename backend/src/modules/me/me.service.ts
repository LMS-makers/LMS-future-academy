import { Injectable } from '@nestjs/common';
import { UserRole } from '../../common/enums.js';
import { StudentsService } from '../students/students.service.js';
import { StaffService } from '../staff/staff.service.js';
import { EnrollmentsService } from '../enrollments/enrollments.service.js';
import { MyCourseDto } from './dto/my-course.dto.js';
import { CourseAssignmentsService } from '../course-assignments/course-assignments.service.js';

// Shape of what @CurrentUser() returns — set by JwtStrategy.validate(),
// which maps JwtPayload.sub to `userId` (not `sub`).
interface CurrentUserPayload {
    userId: string;
    role: UserRole;
}

@Injectable()
export class MeService {
    constructor(
        private readonly studentsService: StudentsService,
        private readonly staffService: StaffService,
        private readonly enrollmentsService: EnrollmentsService,
        private readonly courseAssignmentsService: CourseAssignmentsService,
    ) { }

    async getMyCourses(user: CurrentUserPayload): Promise<MyCourseDto[]> {
        if (user.role === UserRole.STUDENT) {
            const student = await this.studentsService.findByUserId(user.userId);
            const enrollments = await this.enrollmentsService.findActiveByStudent(student.id);

            return enrollments.map((enrollment) => ({
                courseEditionId: enrollment.courseEdition.id,
                course: enrollment.courseEdition.course,
                academicYear: enrollment.courseEdition.academicYear,
                year: enrollment.courseEdition.year,
                semester: enrollment.courseEdition.semester,
            }));
        }

        // Every other allowed role (UserRole.DOCTOR) covers both lecturers and
        // teaching assistants — the actual role on an edition comes from
        // CourseAssignment.role, not from UserRole.
        const staff = await this.staffService.findByUserId(user.userId);
        const assignments = await this.courseAssignmentsService.findByStaff(staff.id);

        return assignments.map((assignment) => ({
            courseEditionId: assignment.courseEdition.id,
            course: assignment.courseEdition.course,
            academicYear: assignment.courseEdition.academicYear,
            year: assignment.courseEdition.year,
            semester: assignment.courseEdition.semester,
            role: assignment.role,
            assignedSections: assignment.assignedSections ?? undefined,
        }));
    }
}