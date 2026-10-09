import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums.js';

export const ROLES_KEY = 'roles';

// This allows us to pass multiple roles like: @Roles(UserRole.ADMIN, UserRole.STAFF)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);