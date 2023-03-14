import { IUser, User } from '../models/user.model';
import { AuthCode } from '../models/auth.model';
import { NotFoundError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import * as config from '../config';
import { v4 } from 'uuid';
import mongoose from 'mongoose';
import { IAuthCode } from '../models/types/auth.types';

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
type ConfigType =
    | 'access'
    | 'refresh'
    | 'password_reset'
    | 'verification'
    | 'activation'
    | 'deactivation';
function getRequiredConfigVars(config_type: ConfigType): { secret: string; expiry: string } {
    let secret: string | undefined;
    let expiry: string | undefined;

    switch (config_type) {
        case 'access':
            secret = config.JWT_ACCESS_SECRET;
            expiry = config.JWT_ACCESS_EXP;
            break;

        case 'refresh':
            secret = config.JWT_REFRESH_SECRET;
            expiry = config.JWT_REFRESH_EXP;
            break;

        case 'password_reset':
            secret = config.JWT_PASSWORDRESET_SECRET;
            expiry = config.JWT_PASSWORDRESET_EXP;
            break;

        case 'verification':
            secret = config.JWT_EMAILVERIFICATION_SECRET;
            expiry = config.JWT_EMAILVERIFICATION_EXP;
            break;

        // if config_type is not 'access' or 'refresh', throw an error
        default:
            throw new Error(`Invalid config_type: ${config_type}`);
    }

    if (!secret || !expiry) throw new Error(`Invalid config_type: ${config_type}`);

    return { secret, expiry };
}

async function getCodes(code_type: ConfigType, user: IUser | mongoose.Types.ObjectId): Promise<IAuthCode> {
    const random_number = Math.floor(100000 + Math.random() * 900000);
    let verification_code: number,
        password_reset_code: number;
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

    return users_auth_code;
}

async function getAuthTokens(
    user: IUser | mongoose.Types.ObjectId,
    token_type: ConfigType
): { access_token: string; refresh_token: string } {
    const { secret, expiry } = getRequiredConfigVars('access');
    const access_token = jwt.sign({ user: user._id }, secret, { expiresIn: expiry });

    const refresh_token = v4();

    await AuthCode.create({ user: user._id, code: refresh_token });

    return { access_token, refresh_token };
}
