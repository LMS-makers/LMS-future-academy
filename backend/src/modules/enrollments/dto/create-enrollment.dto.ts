import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
    @ApiProperty({
        description: 'ID of the student to enroll',
        format: 'uuid',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    studentId: string;

    @ApiProperty({
        description: 'ID of the course edition to enroll the student in',
        format: 'uuid',
        example: '660e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    courseEditionId: string;
}