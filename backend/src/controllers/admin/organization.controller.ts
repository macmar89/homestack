import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { HttpStatus } from "../../utils/httpStatusCodes.js";
import { OwnerRegisterSchema } from "../../shared/constants/schema/auth.schema.js";
import { registerNewOrgAndOwner } from "../../services/admin/organization.service.js";

export const registerNewOrganizationOwner = catchAsync(async (req: Request, res: Response) => {
    const validatedData = OwnerRegisterSchema.parse(req.body);

    await registerNewOrgAndOwner(validatedData);

    res.status(HttpStatus.CREATED).json({
        status: 'success',
    });
});