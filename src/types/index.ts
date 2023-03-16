import * as routerSchemas from './zod';
import { MongoServerError } from 'mongodb';

type MongoDuplicateKeyError = MongoServerError & {
    code: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keyValue?: { [key: string]: any };
};

type NodeENV = 'dev' | 'test' | 'prod';

type Email = string & { __brand: 'email' };

export { MongoDuplicateKeyError,  routerSchemas, NodeENV, Email };
