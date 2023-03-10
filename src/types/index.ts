import { MongoServerError } from 'mongodb';

export type MongoDuplicateKeyError = MongoServerError & {
    code: number;
    keyValue?: { [key: string]: any };
};

export type NodeENV = 'dev' | 'test' | 'prod';
