import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface.js';

export const CurrentUser = createParamDecorator(
    (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext): AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] => {
        const request = ctx.switchToHttp().getRequest();
        const user: AuthenticatedUser = request.user; // Populated by JwtStrategy.validate()

        // If a specific property is requested (e.g., @CurrentUser('userId')), return it.
        // Otherwise, return the entire user object.
        return data ? user?.[data] : user;
    },
);
