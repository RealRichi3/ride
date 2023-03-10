import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';
import { MongoError } from 'mongodb';
import { MongoDuplicateKeyError } from '../types';
import { BadRequestError, CustomAPIError, InternalServerError } from '../utils/errors';

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    // NODE_ENV != 'test' ? console.log(err) : null;

    let error: CustomAPIError;

    /** Handle Error based on it's type */
    if (err instanceof MongoError) {
        const mongo_error = err as MongoDuplicateKeyError;
        if (mongo_error.code == 11000) {
            /** Handles Duplicate key error */
            const error_key_value: string = mongo_error.keyValue?.email;
            const message = `${error_key_value || 'User'} already exists, please use another email`;

            error = new BadRequestError(message);
        } else {
            error = new InternalServerError('An error occurred');
        }
    } else if (err instanceof Error.ValidationError) {
        /** Handles Mongoose Schema Validation error */

        const error_messages = Object.values(err.errors);
        const message = error_messages.join(', ');

        error = new InternalServerError(message);
    } else if (err.name == 'TokenExpiredError') {
        /** Handles TokenExpiredError, occurs when JWT auth token has Expired  */

        error = new CustomAPIError('Token expired', 401);
    } else if (err.name == 'JsonWebTokenError' && err.message == 'jwt malformed') {
        /**
         *  Occurs when JWT was provided but token doesn't match Regex for JWT tokens
         *  It is most likely due to extra characters or missing in the token
         */

        error = new CustomAPIError('Invalid authentication token', 401);
    } else if (err instanceof CustomAPIError) {
        /** Handle other API errors */
        
        return res.status(err.statusCode).send({
            data: null,
            message: err.message,
        });
    }

    /**
     * If it passes as not being other errors, its an Internal server error
     */
    return res.status(500).send({ message: 'An error occured' });
}

export default errorHandler;
