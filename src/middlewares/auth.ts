import { Request, Response, NextFunction } from 'express';
import { BadRequestError, ForbiddenError, UnauthenticatedError } from '../utils/errors';
import { getAuthTokens, getJWTConfigVariables } from '../services/auth.service';
import { AuthTokenType, IRequestWithUser, UserWithStatus } from '../types';
import * as config from '../config';
import * as jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model';
import { BlacklistedToken } from '../models/auth.model';

async function exchangeAuthTokens(req: IRequestWithUser, res: Response) {
    const { access_token, refresh_token } = await getAuthTokens(req.user as IUser, 'access')

    return res.status(200).send({
        status: 'success',
        message: 'Successfully exchanged auth tokens',
        data: {
            access_token,
            refresh_token
        }
    })
}

const basicAuth = function (token_type: AuthTokenType | undefined) {
    return async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        // Get authorization header
        const auth_header = req.headers.authorization;

        // Check if authorization header is present
        if (!auth_header?.startsWith('Bearer'))
            return next(new UnauthenticatedError('Invalid authorization header'));

        // Get JWT config variables
        const secret = token_type
            ? getJWTConfigVariables(token_type).secret
            : config.JWT_ACCESS_SECRET;

        const jwt_token = auth_header.split(' ')[1],
            payload = jwt.verify(jwt_token, secret) as string;

        req.user = payload ? JSON.parse(payload) as UserWithStatus : undefined
        const user = req.user

        // Check if access token has been blacklisted
        // TODO: Use redis for blacklisted tokens
        const tokenIsBlacklisted = await BlacklistedToken.findOne({ token: jwt_token })
        if (tokenIsBlacklisted) return new ForbiddenError('JWT token expired');

        // Check if user wants to exchange or get new auth tokens
        if (req.method == 'GET'
            && req.path == '/authtoken'
            && req.user) await exchangeAuthTokens(req, res);

        /** Check if users account has been activated
         * 
         *  Some Some requests do not require users account to be activated
         *  examples of these request are email verification, password reset
         *  */ 
        if (user?.status.isActive && !token_type) {
            return next(new ForbiddenError('Unauthorized access, users account is not active'))
        }
    };
}

export { basicAuth }
