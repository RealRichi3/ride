import * as zCustomSchemas from './zod'
import { MongoServerError } from 'mongodb';

type MongoDuplicateKeyError = MongoServerError & {
    code: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keyValue?: { [key: string]: any };
};

type NodeENV = 'dev' | 'test' | 'prod';

export {
    MongoDuplicateKeyError,
    zCustomSchemas,
    NodeENV
}