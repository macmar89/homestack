import { type NextFunction, type Request, type Response } from "express";
import { hasActiveAccess } from "../utils/organization.js";
import { ERR } from "../utils/errorMessages.js";
import { HttpStatus } from "../utils/httpStatusCodes.js";

export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
    // req.org is already handled by the previous middleware (scopedOrg)
    if (!hasActiveAccess(req.org)) {
        return res.status(HttpStatus.PAYMENT_REQUIRED).json({
            error: "Subscription required",
            message: ERR.AUTH.SUBSCRIPTION_REQUIRED
        });
    }
    next();
};