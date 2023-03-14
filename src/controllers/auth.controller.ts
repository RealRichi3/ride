import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { IUser, User } from '../models/user.model';
import { BadRequestError } from '../utils/errors';
import { Password } from '../models/password.model';
import { IStatus } from '../models/types/status.types';
import { getAuthCodes, getAuthTokens } from '../services/auth.service';
import { sendEmail } from '../services/email.service';
import { Email } from '../types';

/**
 * Handle unverified user
 *
 * @description Sends verification email and returns access token
 *
 * @param unverified_user  User with unverified email address
 *
 * @returns { access_token: string}
 */
async function handleUnverifiedUser(unverified_user: IUser & { status: IStatus })
    : Promise<{ access_token: string; }> {
    // Get verificateion code
    const { verification_code }: { verification_code?: number }
        = await getAuthCodes(unverified_user, 'verification');

    // Send verification email
    sendEmail({
        to: 'molunorichie@gmail.com' as Email,
        subject: 'Verify your email address',
        text: `Your verification code is ${verification_code}`,
    });

    // Get access token
    const { access_token } = await getAuthTokens(unverified_user, 'access');

    return { access_token };
}

/**
 * Handle existing user
 *
 * @description Handles existing user
 *
 * @param existing_user  Existing user
 *
 * @returns {void}
 * */
function handleExistingUser(existing_user: IUser & { status: IStatus }) {
    return async function (req: Request, res: Response, next: NextFunction) {
        // Handle existing user

        if (!existing_user.status.isVerified) {
            // Handle unverified user
            const { access_token } = await handleUnverifiedUser(existing_user)

            res.status(200).json({
                status: 'success',
                message: 'User created successfully',
                data: {
                    user: existing_user,
                    access_token,
                },
            });
        } else next(new BadRequestError('User already exists, please verify your account'));
    };
}

const userSignup = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstname, lastname, password, role } = req.body;
    const user_info = { email, firstname, lastname, password, role };

    // Check if user already exists
    const existing_user: IUser | null = await User.findOne({ email }).populate('status');
    if (existing_user) {
        // Handle existing user
        await handleExistingUser(existing_user.toObject())(req, res, next);
        return
    }

    // Create new user in session
    let user: IUser | undefined;
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
        user = (await User.create([user_info], { session }))[0];

        await session.commitTransaction();
        session.endSession();
    });

    if (!user) throw new BadRequestError('An error occurred');

    await Password.create({ user: user._id, password });

    // Get access token
    const { access_token } = await handleUnverifiedUser(user.toObject());

    // Send response
    res.status(200).json({
        status: 'success',
        message: 'User created successfully',
        data: {
            user,
            access_token
        },
    });
};

export { userSignup };
