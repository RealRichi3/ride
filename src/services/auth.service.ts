import { IUser, User } from '../models/user.model';
import { AuthCode } from '../models/auth.model';
import { NotFoundError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import * as config from '../config';
import { IAuthCode } from '../models/types/auth.types';
import { AuthTokenType, AuthCodeType } from '../types';
import mongoose from 'mongoose';



/**
 * Generate Required Config Variables
 *
 * @description Generates required config variables for JWT
 *
 * @param config_type  'access' or 'refresh'
 * @returns
 *
 * @throws {Error} if config_type is not 'access', 'refresh', 'password_reset' or 'verification'
 */
export function getJWTConfigVariables(config_type: AuthTokenType | AuthCodeType): {
    secret: string;
    expiry: string;
} {
    switch (config_type) {
        case 'access':
            return { secret: config.JWT_ACCESS_SECRET, expiry: config.JWT_ACCESS_EXP };

        case 'refresh':
            return { secret: config.JWT_REFRESH_SECRET, expiry: config.JWT_REFRESH_EXP };

        case 'password_reset':
            return {
                secret: config.JWT_PASSWORDRESET_SECRET,
                expiry: config.JWT_PASSWORDRESET_EXP,
            };

        case 'verification':
            return {
                secret: config.JWT_EMAILVERIFICATION_SECRET,
                expiry: config.JWT_EMAILVERIFICATION_EXP,
            };

        // if config_type is not 'access' or 'refresh', throw an error
        default:
            throw new Error(`Invalid config_type: ${config_type}`);
    }
}

/**
 * Get auth codes
 *
 * @description Get auth codes for a user
 *
 * @param {AuthTokenType} code_type
 * @param {MongooseDocument | mongoose.Types.ObjectId } user
 * @returns
 */
export async function getAuthCodes(
    user: IUser,
    code_type: AuthCodeType
): Promise<IAuthCode> {
    const random_number = Math.floor(100000 + Math.random() * 900000);
    let verification_code: number, password_reset_code: number;
    // activation_code: number,
    // deactivation_code: number;

    let users_auth_code: IAuthCode | null;

    switch (code_type) {
        case 'verification':
            verification_code = random_number;
            users_auth_code = await AuthCode.findOneAndUpdate(
                { user: user._id },
                { verification_code },
                { new: true }
            );
            break;

        case 'password_reset':
            password_reset_code = random_number;
            users_auth_code = await AuthCode.findOneAndUpdate(
                { user: user._id },
                { password_reset_code },
                { new: true }
            );
            break;

        // case 'activation':
        //     activation_code = random_number;
        //     users_auth_code = await AuthCode.findOneAndUpdate({ user: user._id }, { activation_code }, { new: true })
        //     break;

        // case 'deactivation':
        //     deactivation_code = random_number;
        //     users_auth_code = await AuthCode.findOneAndUpdate({ user: user._id }, { deactivation_code }, { new: true })
        //     break;

        default:
            throw new Error(`Invalid code_type: ${code_type}`);
    }

    if (!users_auth_code) throw new NotFoundError('User not found');

    console.log(users_auth_code)
    return users_auth_code;
}

/**
 * Get auth tokens
 *
 * @description Get auth tokens for a user i.e access token and refresh token
 *
 * @param {MongooseDocument | mongoose.Types.ObjectId } user
 * @param {AuthTokenType} token_type
 * @returns {Promise<{ access_token: string; refresh_token: string | undefined }>
 */
export async function getAuthTokens(
    user: IUser,
    token_type: AuthTokenType | AuthCodeType
): Promise<{ access_token: string; refresh_token: string | undefined }> {
    const { secret, expiry } = getJWTConfigVariables(token_type);

    console.log(secret)
    
    // Access token usecase may vary, so we can't use the same
    // secret for both access and refresh tokens
    user = Object(user.toObject())
    const access_token = jwt.sign(user, secret, { expiresIn: expiry });
    const refresh_token = jwt.sign(user, config.JWT_REFRESH_SECRET, {
        expiresIn: config.JWT_REFRESH_EXP,
    });

    console.log(access_token)

    return {
        access_token,
        // If the secret is the same as the access token secret,
        // i.e the token is meant for post authentication
        // then return the refresh token, else return undefined
        refresh_token: secret == config.JWT_ACCESS_SECRET ? refresh_token : undefined,
    };
}
