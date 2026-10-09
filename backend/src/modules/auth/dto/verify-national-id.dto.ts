import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyNationalIdDto {
    @ApiProperty({ example: '29912345678901', description: 'National ID (14 digits)' })
    @IsNotEmpty({ message: 'National ID is required' })
    @IsString()
    @Length(14, 14, { message: 'National ID must be exactly 14 characters long' })
    nationalId: string;
}