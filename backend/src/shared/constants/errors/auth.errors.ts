export const AuthErrors = {
    MISSING_REFRESH_TOKEN: 'missing_refresh_token',

    USERNAME_ALREADY_EXISTS: 'username_already_exists',
    INVALID_CREDENTIALS: 'invalid_username_or_password',
    TOKEN_EXPIRED: 'token_expired',
    UNAUTHORIZED: 'unauthorized',
    SESSION_FAILED: 'session_failed',
    ORGANIZATION_CREATION_FAILED: 'organization_creation_failed',
    USER_CREATION_FAILED: 'user_creation_failed',
    USER_NOT_FOUND: 'user_not_found',
    INVALID_REFRESH_TOKEN: 'invalid_refresh_token',

    VALIDATION: {
        INVALID_EMAIL: 'invalid_email',
        PHONE_NUMBER_TOO_SHORT: 'phone_number_too_short',
        PASSWORD_TOO_SHORT: 'password_too_short',
        USERNAME_TOO_SHORT: 'username_too_short',
        ORGANIZATION_NAME_TOO_SHORT: 'organization_name_too_short',
        ORGANIZATION_SLUG_TOO_SHORT: 'organization_slug_too_short',
        PHONE_NUMBER_TOO_LONG: 'phone_number_too_long',
        INVALID_PHONE_NUMBER: 'invalid_phone_number',
    },

    FORBIDDEN_SUPERADMIN: 'forbidden_superadmin',
    FORBIDDEN_ORGANIZATION: 'forbidden_organization',
    CONTEXT_ERROR: 'context_error',
    SUBSCRIPTION_REQUIRED: 'subscription_required',
} as const;