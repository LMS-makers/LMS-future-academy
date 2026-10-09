import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: '29912345678901', description: 'User National ID' })
    @IsNotEmpty({ message: 'National ID is required.' })
    @IsString()
    @Length(14, 14, { message: 'National ID must be exactly 14 characters long.' })
    nationalId: string;

    @ApiProperty({ example: 'StrongP@ssw0rd!', description: 'User password' })
    @IsNotEmpty({ message: 'Password is required.' })
    @IsString()
    password: string;
}