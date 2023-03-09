import { MongoError } from 'mongodb';

export type MongoDuplicateKeyError = MongoError & {
    code: number;
    keyValue?: { [key: string]: any };
};

export type NodeENV = 'dev' | 'test' | 'prod';
