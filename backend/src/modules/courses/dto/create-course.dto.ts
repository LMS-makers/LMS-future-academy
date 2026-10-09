import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CreditHours, Department } from '../../../common/enums.js';

export class CreateCourseDto {
    @ApiProperty({ description: 'Course name', example: 'Calculus' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Unique course code, used as the catalog identifier', example: 'BS101' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ description: 'Department the course belongs to', enum: Department, example: Department.GENERAL })
    @IsEnum(Department)
    department: Department;

    @ApiProperty({ description: 'Credit hours for the course', enum: CreditHours, example: CreditHours.THREE })
    @IsEnum(CreditHours)
    creditHours: CreditHours;
}
