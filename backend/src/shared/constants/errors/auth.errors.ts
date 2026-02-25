export const AuthErrors = {
    MISSING_REFRESH_TOKEN: 'Missing refresh token',

    USERNAME_ALREADY_EXISTS: 'User with this username already exists',
    INVALID_CREDENTIALS: 'Invalid username or password',
    TOKEN_EXPIRED: 'Your session has expired. Please refresh your token or log in again.',
    UNAUTHORIZED: 'You are not authorized to access this resource. Please log in.',
    SESSION_FAILED: 'Failed to create session',
    ORGANIZATION_CREATION_FAILED: 'Failed to create organization',
    USER_CREATION_FAILED: 'Failed to create user',
    USER_NOT_FOUND: 'User not found',
    INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',

    VALIDATION: {
        INVALID_EMAIL: 'Invalid email format',
        PHONE_NUMBER_TOO_SHORT: 'Phone number must be at least 10 characters long',
        PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
        USERNAME_TOO_SHORT: 'Username must be at least 2 characters long',
        ORGANIZATION_NAME_TOO_SHORT: 'Organization name must be at least 2 characters long',
        ORGANIZATION_SLUG_TOO_SHORT: 'Organization slug must be at least 2 characters long',
        PHONE_NUMBER_TOO_LONG: 'Phone number must be at most 15 characters long',
        INVALID_PHONE_NUMBER: 'Phone number must contain only numbers, spaces and + sign',
    },

    FORBIDDEN_SUPERADMIN: 'Access denied. System administrator privileges are required.',
    FORBIDDEN_ORGANIZATION: 'Access denied. You do not have access to this organization.',
    CONTEXT_ERROR: 'Error verifying organization context',
    SUBSCRIPTION_REQUIRED: 'Your trial has expired. Please activate a subscription to continue.',
} as const;