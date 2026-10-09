import { ApiProperty } from '@nestjs/swagger';
import { AcademicYear, CourseRole, Semester } from '../../../common/enums.js';
import { Course } from '../../courses/entities/course.entity.js';

export class MyCourseDto {
    @ApiProperty({ description: 'Course edition id', format: 'uuid' })
    courseEditionId: string;

    @ApiProperty({ description: 'The course (catalog entry) this edition belongs to', type: Course })
    course: Course;

    @ApiProperty({ description: 'Academic year this edition is offered to', enum: AcademicYear })
    academicYear: AcademicYear;

    @ApiProperty({ description: 'The year this edition belongs to, as a label', example: '2026' })
    year: string;

    @ApiProperty({ description: 'Semester this edition runs in', enum: Semester })
    semester: Semester;

    @ApiProperty({
        description: 'Role on this edition. Present for a doctor/assistant only, absent for a student.',
        enum: CourseRole,
        required: false,
    })
    role?: CourseRole;

    @ApiProperty({
        description: 'Sections this assistant is responsible for. Present for an ASSISTANT only.',
        type: [String],
        required: false,
    })
    assignedSections?: string[];
}
