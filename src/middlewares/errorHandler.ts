import { Request, Response } from 'express';
import { Error } from 'mongoose';
import { MongoDuplicateKeyError } from '../types';
import { BadRequestError, CustomAPIError, InternalServerError } from '../utils/errors';

/**
 * This function is used to handle all errors that occur in the application.
 * It takes in an error object, and returns an appropriate error response to the client.
 *
 * @param {Error} err - the error object being handled.
 * @param {Request} req - the request object.
 * @param {Response} res - the response object.
 * @param {NextFunction} next - the next function in the middleware chain.
 *
 * @returns {Response} - a response object containing the error message and status code.
 */
function errorHandler(err: Error, req: Request, res: Response) {
    // log the error to the console, but only if the environment is not "test"
    process.env.NODE_ENV !== 'test' ? console.log(err) : null;

    // create a variable to hold the custom error object
    let error: CustomAPIError | undefined;

    // check the type of error and create a custom error object for it
    if (err.name === 'MongoServerError') {
        // handle duplicate key errors
        const mongo_error = err as MongoDuplicateKeyError;
        if (mongo_error.code === 11000) {
            // get the key value causing the duplicate key error
            const error_key_value: string = mongo_error.keyValue?.email;
            const message = `${error_key_value || 'User'} already exists, please use another email`;
            
            error = new BadRequestError(message);
        } else {
            // handle all other Mongo errors

            error = new InternalServerError('An error occurred');
        }
    } else if (err instanceof Error.ValidationError) {
        // handle validation errors from Mongoose
        const error_messages = Object.values(err.errors);
        const message = error_messages.join(', ');

        error = new InternalServerError(message);
    } else if (err.name === 'TokenExpiredError') {
        // handle expired JWT tokens

        error = new CustomAPIError('Token expired', 401);
    } else if (err.name === 'JsonWebTokenError' && err.message === 'jwt malformed') {
        // handle malformed JWT tokens

        error = new CustomAPIError('Invalid authentication token', 401);
    } else if (err instanceof CustomAPIError) {
        // handle all other custom API errors

        return res.status(err.statusCode).send({
            data: null,
            message: err.message,
        });
    }

    // if there is a custom error object, return it to the client
    if (error) {
        return res.status(error.statusCode).send({
            data: null,
            message: error.message,
        });
    }

    // if the error is not one of the specific types above, return a generic internal server error
    return res.status(500).send({ message: 'An error occurred' });
}

export default errorHandler;
