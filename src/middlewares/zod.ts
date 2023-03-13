import * as z from 'zod';
import { Request, Response, NextFunction } from 'express';

const userSignupSchema = z.object({
    email: z.string().email(),
    firstname: z.string(),
    lastname: z.string(),
    password: z.string(),
    role: z.enum(['EndUser', 'Admin', 'SuperAdmin']),
});

interface ValidationSchemas {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: z.ZodObject<any>;
}

const validation_schemas: ValidationSchemas = {
    '/signup/enduser': userSignupSchema,
};

function zodValidator(req: Request, res: Response, next: NextFunction) {
    const path = req.path;
    const validation_schema = validation_schemas[req.path];

    if (!validation_schema) {
        throw new Error(`Validation schema for ${path} not defined`);
    }

    validation_schema.parse(req.body);

    next();
}

export default zodValidator;
