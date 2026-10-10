import { AccountStatus, UserRole } from "../enums.js";

export interface AuthenticatedUser {
    userId: string;
    role: UserRole;
    accountStatus: AccountStatus;
}