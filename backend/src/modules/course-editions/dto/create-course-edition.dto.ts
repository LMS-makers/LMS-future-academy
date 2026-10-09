import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { AcademicYear, Semester } from '../../../common/enums.js';

export class CreateCourseEditionDto {
    @ApiProperty({ description: 'Id of the course (catalog blueprint) this edition is opened for', format: 'uuid' })
    @IsUUID()
    courseId: string;

    @ApiProperty({ description: 'Academic year this edition is offered to', enum: AcademicYear, example: AcademicYear.YEAR_1 })
    @IsEnum(AcademicYear)
    academicYear: AcademicYear;

    @ApiProperty({ description: 'The year this edition belongs to, as a label', example: '2026' })
    @IsString()
    @IsNotEmpty()
    year: string;

    @ApiProperty({ description: 'Semester this edition runs in', enum: Semester, example: Semester.FIRST })
    @IsEnum(Semester)
    semester: Semester;
}
