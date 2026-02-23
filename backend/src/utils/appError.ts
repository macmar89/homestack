import { HttpStatus } from "./httpStatusCodes.js";

export class AppError extends Error {
    public readonly statusCode: HttpStatus;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Object.setPrototypeOf(this, new.target.prototype);

        Error.captureStackTrace(this, this.constructor);
    }
}