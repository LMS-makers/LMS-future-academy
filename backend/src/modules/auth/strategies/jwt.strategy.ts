import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../../../config/jwt.config.js';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface.js';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(jwtConfig.KEY)
        private readonly config: ConfigType<typeof jwtConfig>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.secret,
        });
    }

    /**
     * Passport automatically calls this method if the token signature is valid.
     * Whatever we return here will be injected into the Request object as `req.user`.
     * Return type is AuthenticatedUser (not JwtPayload) — `sub` is mapped to
     * `userId` here, so everything downstream (@CurrentUser()) sees `userId`.
     */
    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        return {
            userId: payload.sub,
            role: payload.role,
            accountStatus: payload.accountStatus,
        };
    }
}
