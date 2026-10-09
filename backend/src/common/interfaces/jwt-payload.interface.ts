import { UserRole, AccountStatus } from '../enums.js';

export interface JwtPayload {
    sub: string;
    role: UserRole;
    accountStatus: AccountStatus;
}