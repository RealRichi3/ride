import { UserWithStatus } from ".";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
    headers: {
        authorization: string
    },
    user: UserWithStatus
}

export interface AuthenticatedAsyncController {
    (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>
}