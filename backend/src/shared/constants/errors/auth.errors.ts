export const AuthErrors = {
    MISSING_REFRESH_TOKEN: 'Missing refresh token',

    EMAIL_ALREADY_EXISTS: 'User with this email already exists',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Your session has expired, please log in again',
    UNAUTHORIZED: 'You must be logged in to access this resource',
    SESSION_FAILED: 'Failed to create session',
    HOUSEHOLD_CREATION_FAILED: 'Failed to create household',
    USER_CREATION_FAILED: 'Failed to create user',
    USER_NOT_FOUND: 'User not found',
    INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',

    VALIDATION: {
        INVALID_EMAIL: 'Invalid email format',
        PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
        NAME_TOO_SHORT: 'Name must be at least 2 characters long',
        HOUSEHOLD_NAME_TOO_SHORT: 'Household name must be at least 2 characters long',
    }
} as const;