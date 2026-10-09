import { Controller, Post, Body, HttpCode, HttpStatus, Patch, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { VerifyNationalIdDto } from './dto/verify-national-id.dto.js';
import { ActivateAccountDto } from './dto/activate-account.dto.js';
import { CompleteProfileDto } from './dto/complete-profile.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify National ID and return account onboarding status' })
    @ApiResponse({ status: 200, description: 'Returns the current AccountStatus' })
    @ApiResponse({ status: 404, description: 'National ID not found' })
    async verify(@Body() verifyDto: VerifyNationalIdDto) {
        return this.authService.verifyNationalId(verifyDto.nationalId);
    }

    @Post('activate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Activate account by setting the initial password' })
    @ApiResponse({ status: 200, description: 'Account activated, returns JWT' })
    @ApiResponse({ status: 400, description: 'Account already activated' })
    async activate(@Body() activateDto: ActivateAccountDto) {
        return this.authService.activateAccount(activateDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch('complete-profile')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Complete user profile (Email & Phone) and return updated JWT' })
    @ApiResponse({ status: 200, description: 'Profile updated, returns new JWT with ACTIVE status' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async completeProfile(
        @CurrentUser('userId') userId: string,
        @Body() completeProfileDto: CompleteProfileDto
    ) {
        return this.authService.completeProfile(userId, completeProfileDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with National ID and Password' })
    @ApiResponse({ status: 200, description: 'Login successful, returns JWT' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get the profile of the currently authenticated user' })
    @ApiResponse({ status: 200, description: 'Returns the user profile' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@CurrentUser('userId') userId: string) {
        return this.authService.getProfile(userId);
    }
}