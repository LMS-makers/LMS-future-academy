import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteProfileDto {
    @ApiProperty({ example: 'student@example.com', description: 'User email address' })
    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail({}, { message: 'Invalid email format.' })
    email: string;

    @ApiProperty({ example: '01012345678', description: 'User phone number' })
    @IsNotEmpty({ message: 'Phone number is required.' })
    @IsString({ message: 'Phone number must be a string.' })
    phone: string;
}