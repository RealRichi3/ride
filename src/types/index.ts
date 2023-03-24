import { IStatus } from '../models/types/status.types';
import { IUser } from '../models/user.model';
import * as routerSchemas from './routerschemas';
import { MongoServerError } from 'mongodb';
import { Request } from 'express';
    

type MongoDuplicateKeyError = MongoServerError & {
    code: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keyValue?: { [key: string]: any };
};

// Add populated field to existing type
type WithPopulated<T, K extends string, P> =
    K extends keyof T ?
    Omit<T, K> & { [k in K]: P } :
    T & { [k in K]: P };

type UserWithStatus = WithPopulated<IUser, 'status', IStatus>;

type NodeENV = 'dev' | 'test' | 'prod';

type Email = string & { __brand: 'email' };

type TAuthCode = {
    password_reset: 'password_reset_code';
    verification: 'verification_code';
    activation: 'activation_code';
    deactivation: 'deactivation_code';
} 
type TAuthToken = 'access' | 'refresh' | keyof TAuthCode;

interface IRequestWithUser extends Request {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: UserWithStatus
}

export {
    MongoDuplicateKeyError,
    routerSchemas, NodeENV,
    Email, WithPopulated,
    UserWithStatus,
    TAuthCode, TAuthToken,
    IRequestWithUser,
};
