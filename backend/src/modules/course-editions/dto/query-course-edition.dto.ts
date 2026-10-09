import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AcademicYear, Semester } from '../../../common/enums.js';

export class QueryCourseEditionDto {
    @ApiPropertyOptional({ description: 'Filter by course id', format: 'uuid' })
    @IsOptional()
    @IsUUID()
    courseId?: string;

    @ApiPropertyOptional({ description: 'Filter by academic year', enum: AcademicYear })
    @IsOptional()
    @IsEnum(AcademicYear)
    academicYear?: AcademicYear;

    @ApiPropertyOptional({ description: 'Filter by semester', enum: Semester })
    @IsOptional()
    @IsEnum(Semester)
    semester?: Semester;

    @ApiPropertyOptional({ description: 'Include archived (closed) editions in the results', example: false, default: false })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    includeArchived?: boolean;
}
