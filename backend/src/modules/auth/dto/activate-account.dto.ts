import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateAccountDto {
    @ApiProperty({ example: '29912345678901', description: 'User National ID (14 digits)' })
    @IsNotEmpty({ message: 'National ID is required.' })
    @IsString()
    @Length(14, 14, { message: 'National ID must be exactly 14 characters long.' })
    nationalId: string;

    @ApiProperty({ example: 'StrongP@ssw0rd!', description: 'New password to activate the account' })
    @IsNotEmpty({ message: 'Password is required.' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    password: string;
}