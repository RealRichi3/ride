import { NodeENV } from '../types';

export const MONGO_URI: string = process.env.MONGO_URI as string,
    MONGO_URI_TEST: string = process.env.MONGO_URI_TEST as string,
    MONGO_URI_DEV: string = process.env.MONGO_URI_DEV as string,
    MONGO_URI_PROD: string = process.env.MONGO_URI_PROD as string;

export const PORT: number = (process.env.PORT as unknown as number) || 5555;

/* JWT TOKENS */
export const JWT_SECRET: string = process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET as string,
    JWT_SECRET_EXP: string = process.env.JWT_ACCESS_EXP as string,
    JWT_ACCESS_EXP: string = process.env.JWT_ACCESS_EXP as string,
    JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXP: string = process.env.JWT_REFRESH_EXP as string,
    JWT_PASSWORDRESET_SECRET: string = process.env.JWT_PASSWORDRESET_SECRET as string,
    JWT_PASSWORDRESET_EXP: string = process.env.JWT_PASSWORDRESET_EXP as string,
    JWT_EMAILVERIFICATION_SECRET: string = process.env.JWT_EMAILVERIFICATION_SECRET as string,
    JWT_EMAILVERIFICATION_EXP: string = process.env.JWT_EMAILVERIFICATION_EXP as string,
    JWT_SUPERADMINACTIVATION_SECRET: string = process.env.JWT_SUPERADMINACTIVATION_SECRET as string,
    JWT_SUPERADMINACTIVATION_EXP: string = process.env.JWT_SUPERADMINACTIVATION_EXP as string;

/* EMAIL and OAUTH2*/
export const EMAIL_HOST = process.env.EMAIL_HOST,
    EMAIL_PORT = process.env.EMAIL_PORT,
    EMAIL_HOST_ADDRESS = process.env.EMAIL_HOST_ADDRESS,
    OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET,
    OAUTH_REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN,
    OAUTH_ACCESS_TOKEN = process.env.OAUTH_ACCESS_TOKEN,
    GOOGLE_SIGNIN_CLIENT_ID = process.env.GOOGLE_SIGNIN_CLIENT_ID,
    HOST_ADMIN_EMAIL1 = process.env.HOST_ADMIN_EMAIL1,
    HOST_ADMIN_EMAIL2 = process.env.HOST_ADMIN_EMAIL2;

/* Server */
export const SERVER_URL = process.env.SERVER_URL;

/* Github */
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

/* Node Environment */
export const NODE_ENV: NodeENV = process.env.NODE_ENV as NodeENV;
