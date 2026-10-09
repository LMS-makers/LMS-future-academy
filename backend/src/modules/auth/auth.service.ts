import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ConflictException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { AccountStatus } from '../../common/enums.js';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { ActivateAccountDto } from './dto/activate-account.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserRole } from '../../common/enums.js';
import { CompleteProfileDto } from './dto/complete-profile.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async verifyNationalId(nationalId: string) {
        const user = await this.usersService.findByNationalId(nationalId);

        if (!user) {
            throw new NotFoundException('National ID is not registered in the system.');
        }

        let message = '';
        switch (user.accountStatus) {
            case AccountStatus.PENDING_ACTIVATION:
                message = 'Please set a password to activate your account.';
                break;
            case AccountStatus.INCOMPLETE_PROFILE:
                message = 'Please complete your profile to continue.';
                break;
            case AccountStatus.ACTIVE:
                message = 'Please enter your password to login.';
                break;
        }

        return {
            status: user.accountStatus,
            message
        };
    }

    async activateAccount(dto: ActivateAccountDto) {
        const user = await this.usersService.findByNationalId(dto.nationalId);

        if (!user) {
            throw new NotFoundException('National ID is not registered in the system.');
        }

        if (user.accountStatus !== AccountStatus.PENDING_ACTIVATION) {
            throw new BadRequestException('This account is already activated. Please login instead.');
        }

        const hashedPassword = await this.hashPassword(dto.password);

        await this.usersService.update(user.id, {
            password: hashedPassword,
            accountStatus: AccountStatus.INCOMPLETE_PROFILE,
        });

        return this.generateAuthResponse(user.id, user.role, AccountStatus.INCOMPLETE_PROFILE);
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByNationalId(dto.nationalId);

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        if (user.accountStatus === AccountStatus.PENDING_ACTIVATION) {
            throw new UnauthorizedException('Please activate your account first.');
        }

        const isPasswordValid = await this.comparePasswords(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        return this.generateAuthResponse(user.id, user.role, user.accountStatus);
    }

    async completeProfile(userId: string, dto: CompleteProfileDto) {
        const user = await this.usersService.findById(userId);

        if (user.accountStatus === AccountStatus.ACTIVE) {
            throw new BadRequestException('Profile is already complete.');
        }

        // Check if Email is already taken by another user
        const existingEmailUser = await this.usersService.findByEmail(dto.email);
        if (existingEmailUser && existingEmailUser.id !== userId) {
            throw new ConflictException('This email is already in use by another account.');
        }

        // Check if Phone is already taken by another user
        const existingPhoneUser = await this.usersService.findByPhone(dto.phone);
        if (existingPhoneUser && existingPhoneUser.id !== userId) {
            throw new ConflictException('This phone number is already in use by another account.');
        }

        // Update user data and transition state to ACTIVE
        await this.usersService.update(userId, {
            email: dto.email,
            phone: dto.phone,
            accountStatus: AccountStatus.ACTIVE,
        });

        // Generate a fresh JWT with the updated ACTIVE status
        return this.generateAuthResponse(userId, user.role, AccountStatus.ACTIVE);
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findById(userId);
        return user;
    }

    // --- Private Encapsulated Helpers ---

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    private async comparePasswords(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }

    // Generate JWT and response based on user role and account status
    private generateAuthResponse(userId: string, role: UserRole, status: AccountStatus) {
        const payload: JwtPayload = { sub: userId, role: role, accountStatus: status }; // Cast role properly based on your enum

        let message = 'Login successful.';
        if (status === AccountStatus.INCOMPLETE_PROFILE) {
            message = 'Login successful. Please complete your profile data.';
        }

        return {
            accessToken: this.jwtService.sign(payload),
            status,
            message,
        };
    }
}