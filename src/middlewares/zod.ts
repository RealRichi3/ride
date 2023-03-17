import * as z from 'zod';
import { Request, Response, NextFunction } from 'express';
import { routerSchemas } from '../types';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TValidationSchemas = Map<string, z.ZodObject<any>>;

// Define the validation schemas for each route
const validation_schemas: TValidationSchemas = new Map([
    ['POST /auth/signup/enduser', routerSchemas.userSignup],
    ['GET /auth/verificationemail', routerSchemas.resendVerificationEmail],
]);

/**
 * This function is used to validate the request body against a zod schema.
 * 
 * @param {Request} req - the request object.
 * @param {Response} res - the response object.
 * @param {NextFunction} next - the next function.
 * 
 * @returns {void}
 * 
 * @throws {Error} - if the validation schema for the request path is not defined.
 */
function zodValidator(req: Request, res: Response, next: NextFunction): void {
    const path = `${req.method} ${req.path}`;
    const validation_schema = validation_schemas.get(path);

    if (!validation_schema) {
        throw new Error(`Validation schema for ${path} not defined`);
    }

    validation_schema.parse(req.body);

    next();
}

export default zodValidator;
