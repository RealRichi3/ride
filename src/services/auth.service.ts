import { IUser, User } from '../models/user.model';
import { AuthCode } from '../models/auth.model';
import { NotFoundError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import * as config from '../config';
import { v4 } from 'uuid';

/**
 *
 * @param config_type  'access' or 'refresh'
 * @returns
 */
type ConfigType = 'access' | 'refresh' | 'password_reset' | 'verification';
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

        // if config_type is not 'access' or 'refresh', throw an error
        default:
            throw new Error(`Invalid config_type: ${config_type}`);
    }

    if (!secret || !expiry) throw new Error(`Invalid config_type: ${config_type}`);

    return { secret, expiry };
}
