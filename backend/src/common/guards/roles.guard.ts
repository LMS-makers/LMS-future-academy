import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { UserRole } from '../enums.js';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Read the required roles from the route handler (or the class controller)
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no roles are specified on the route, allow access by default
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user; // Injected by JwtStrategy

        if (!user) {
            return false; // Deny if no user object exists
        }

        // Check if the user's role exists in the array of required roles
        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException('You do not have the required permissions to perform this action.');
        }

        return true;
    }
}