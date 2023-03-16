import { IStatus } from '../models/types/status.types';
import { IUser } from '../models/user.model';
import * as routerSchemas from './zod';
import { MongoServerError } from 'mongodb';

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

export { MongoDuplicateKeyError, routerSchemas, NodeENV, Email, WithPopulated, UserWithStatus };
