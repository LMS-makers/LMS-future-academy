import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRATION || '7d';

    if (!secret) {
        throw new Error('Fatal Error: JWT_SECRET environment variable is missing.');
    }

    return {
        secret,
        expiresIn,
    };
});