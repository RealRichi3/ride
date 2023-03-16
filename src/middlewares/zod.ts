import * as z from 'zod';
import { Request, Response, NextFunction } from 'express';
import { routerSchemas } from '../types';

interface ValidationSchemas {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: z.ZodObject<any>;
}

// Define the validation schemas for each route
const validation_schemas: ValidationSchemas = {
    '/auth/signup/enduser': routerSchemas.userSignup,
};

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
    const path = req.path;
    console.log(path)
    const validation_schema = validation_schemas[req.path];

    if (!validation_schema) {
        throw new Error(`Validation schema for ${path} not defined`);
    }

    validation_schema.parse(req.body);

    next();
}

export default zodValidator;
