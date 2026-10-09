import { IsNotEmpty, IsString, Length, IsOptional, IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountStatus, UserRole } from '../../../common/enums.js';

export class CreateUserDto {
    @ApiProperty({ example: '29912345678901', description: 'National ID (14 digits)' })
    @IsNotEmpty({ message: 'National ID is required' })
    @IsString()
    @Length(14, 14, { message: 'National ID must be 14 digits' })
    nationalId: string;

    @ApiPropertyOptional({ description: 'Password for the user' })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiPropertyOptional({ example: 'student@example.com' })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @ApiPropertyOptional({ example: '01012345678' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ enum: UserRole, default: UserRole.STUDENT })
    @IsOptional()
    @IsEnum(UserRole, { message: 'Invalid user role' })
    role?: UserRole;

    @ApiPropertyOptional({ enum: AccountStatus, default: AccountStatus.PENDING_ACTIVATION })
    @IsOptional()
    @IsEnum(AccountStatus, { message: 'Invalid account status provided.' })
    accountStatus?: AccountStatus;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}