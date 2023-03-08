import { HttpStatusCode } from 'axios';

export class CustomAPIError extends Error {
    statusCode: HttpStatusCode;

    constructor(message: string, statusCode: HttpStatusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class BadRequestError extends CustomAPIError {
    constructor(message: string, statusCode: HttpStatusCode) {
        super(message, statusCode)
        this.statusCode = 400
    }
}

export class UnauthorizedError extends CustomAPIError {
    constructor(message: string, statusCode: HttpStatusCode){
        super(message, statusCode)
        this.statusCode = 401
    }
}

export class ForbiddenError extends CustomAPIError {
    constructor(message: string, statusCode: HttpStatusCode){
        super(message, statusCode)
        this.statusCode = 403
    }
}

export class NotFoundError extends CustomAPIError {
    constructor(message: string, statusCode: HttpStatusCode){
        super(message, statusCode)
        this.statusCode = 404
    }
}

export class InternalServerError extends CustomAPIError {
    constructor(message: string, statusCode: HttpStatusCode){
        super(message, statusCode)
        this.statusCode = 500
    }
}
