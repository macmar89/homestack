import { users } from '../db/schema/users';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                householdId: string;
            };
        }
    }
}