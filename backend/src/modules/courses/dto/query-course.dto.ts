import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Department } from '../../../common/enums.js';

export class QueryCourseDto {
    @ApiPropertyOptional({ description: 'Filter by department', enum: Department, example: Department.CS })
    @IsOptional()
    @IsEnum(Department)
    department?: Department;

    @ApiPropertyOptional({ description: 'Filter by course code (partial, case-insensitive match)', example: 'BS1' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({ description: 'Include archived courses in the results', example: false, default: false })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    includeArchived?: boolean;
}
