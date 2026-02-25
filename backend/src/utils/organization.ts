import { isAfter } from 'date-fns';

export function hasActiveAccess(org: {
    trialExpiresAt: Date | null,
    plan: string,
    billingStatus: string
}) {
    if (org.plan === 'enterprise' || org.plan === 'admin') return true;

    if (org.trialExpiresAt) {
        const isTrialValid = isAfter(org.trialExpiresAt, new Date());
        if (isTrialValid) return true;
    }

    return org.billingStatus === 'active';
}