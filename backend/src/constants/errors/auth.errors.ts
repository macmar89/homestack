export const AuthErrors = {
    EMAIL_ALREADY_EXISTS: 'User with this email already exists',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Your session has expired, please log in again',
    UNAUTHORIZED: 'You must be logged in to access this resource',
} as const;