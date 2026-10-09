import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user; // Populated by JwtStrategy validate()

        // If a specific property is requested (e.g., @CurrentUser('userId')), return it.
        // Otherwise, return the entire user object.
        return data ? user?.[data] : user;
    },
);