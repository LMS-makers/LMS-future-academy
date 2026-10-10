import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCourseTopicDto {
    @ApiProperty({ description: 'Topic title', example: 'Week 1 — Introduction to Limits' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ description: 'Optional longer description of the topic', example: 'Covers limits, continuity and basic derivatives.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Display order within the edition (lower shows first)', example: 1, default: 1 })
    @IsInt()
    @Min(1)
    orderIndex: number;
}
