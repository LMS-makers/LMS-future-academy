import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayUnique,
    IsArray,
    IsEnum,
    IsString,
    IsUUID,
    ValidateIf,
} from 'class-validator';
import { CourseRole } from '../../../common/enums.js';

export class CreateCourseAssignmentDto {
    @ApiProperty({
        description: 'ID of the staff member to assign to the course edition',
        format: 'uuid',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    staffId: string;

    @ApiProperty({
        description: 'Role this staff member will perform on the course edition',
        enum: CourseRole,
        example: CourseRole.ASSISTANT,
    })
    @IsEnum(CourseRole)
    role: CourseRole;

    @ApiPropertyOptional({
        description: 'Sections assigned to the staff member. Required for assistants; ignored for lecturers.',
        type: [String],
        example: ['Section 1', 'Section 3'],
    })
    @ValidateIf((dto: CreateCourseAssignmentDto) =>
        dto.role === CourseRole.ASSISTANT,
    )
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    assignedSections?: string[];
}
