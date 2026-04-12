/**
 * Maps any role input (number or string) to the numeric role stored in DB.
 * Schema: role is number — 1=user, 2=provider, 3=merchant, 4=driver
 */
export function mapRoleNumber(role: any): number {
    const n = Number(role);
    if ([1, 2, 3, 4].includes(n)) return n;
    // string role name → number
    switch (String(role).toLowerCase()) {
        case 'user':     return 1;
        case 'provider': return 2;
        case 'merchant': return 3;
        case 'driver':   return 4;
        default:         return 1;
    }
}

/**
 * Maps any role input (number or string) to the human-readable roleName string.
 * Schema: roleName is string — 'user', 'provider', 'merchant', 'driver', 'vendor'
 */
export function mapRoleName(role: any): string {
    switch (Number(role)) {
        case 1: return 'user';
        case 2: return 'provider';
        case 3: return 'merchant';
        case 4: return 'driver';
        default:
            // already a valid string
            const s = String(role).toLowerCase();
            if (['user', 'provider', 'merchant', 'driver', 'vendor'].includes(s)) return s;
            return 'user';
    }
}

/**
 * Strips sensitive fields from a user document before sending to client.
 * Works with both Mongoose documents (toJSON) and plain objects.
 */
export function sanitizeUser(user: any): Record<string, any> {
    const u = user.toJSON ? user.toJSON() : user;
    const { password, emailOtp, emailToken, otp, __v, ...safe } = u;
    return safe;
}
