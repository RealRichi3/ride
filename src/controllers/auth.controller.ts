import mongoose, { Model } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { IUser, User } from '../models/user.model';
import { BadRequestError, InternalServerError } from '../utils/errors';
import { IPassword, Password, PasswordModel } from '../models/password.model';
import { IStatus } from '../models/types/status.types';
import { getAuthCodes, getAuthTokens } from '../services/auth.service';
import { sendEmail } from '../services/email.service';
import { Email, WithPopulated, UserWithStatus } from '../types';
import { AuthenticatedRequest } from '../types/global';
import { AuthCode, BlacklistedToken } from '../models/auth.model';
import { IAuthCode } from '../models/types/auth.types';
import { Status } from '../models/status.model';
import logger from '../middlewares/winston';

/**
 * Handle unverified user
 *
 * @description Sends verification email and returns access token
 *
 * @param unverified_user  User with unverified email address
 * @param res  Response object
 * @param next  Next function
 *
 * @returns { access_token: string}
 */
async function handleUnverifiedUser(
    unverified_user: UserWithStatus, res: Response)
    : Promise<Response> {

    console.log(unverified_user)

    // Get verificateion code
    const { verification_code }: { verification_code: number }
        = await getAuthCodes<'verification'>(unverified_user, 'verification');

    // Send verification email
    sendEmail({
        to: 'molunorichie@gmail.com' as Email,
        subject: 'Verify your email address',
        text: `Your verification code is ${verification_code}`,
    });

    // Get access token
    const { access_token } = await getAuthTokens(unverified_user, 'verification');

    const user = Object.assign(unverified_user, { status: undefined });

    return res.status(200).send({
        status: 'success',
        message: 'Verification code sent to user email',
        data: {
            user,
            access_token,
        },
    });
}

/**
 * Handle existing user
 *
 * @description Handles existing user
 *
 * @param existing_user  Existing user
 * @param res  Response object
 *
 * @returns {Response}
 * */
async function handleExistingUser(
    existing_user: UserWithStatus, res: Response, next: NextFunction)
    : Promise<Response | NextFunction> {

    const response =
        existing_user.status?.isVerified
            ? next(new BadRequestError('Email belongs to an existing user'))
            : await handleUnverifiedUser(existing_user, res);

    return response as Response | NextFunction;
}

/**
 * User signup
 * 
 * @description Creates a new user
 * 
 * @param { email: string, firstname: string, 
 *          lastname: string, password: string, 
 *          role: 'EndUser', 'Admin', 'SuperAdmin'} | Users details
 *  
 * @throws { BadRequestError } If user already exists
 * @throws { BadRequestError } If user is not created
 * @throws { BadRequestError } If user is not verified
 * 
 * @returns { user: IUser, access_token: string }
 * 
 * //TODO: Test admin and super admin signup
 * */
const userSignup = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstname, lastname, password, role } = req.body;
    const user_info = { email, firstname, lastname, password, role };

    // Check if user already exists
    type UserWithStatus = WithPopulated<IUser, 'status', IStatus>;
    const existing_user_d = await User.findOne({ email }).populate<IStatus>('status');
    const existing_user = existing_user_d?.toObject() as UserWithStatus | null;

    if (existing_user) return await handleExistingUser(existing_user, res, next);

    // Create new user in session
    let user: IUser | undefined;
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
        user = (await User.create([user_info], { session }))[0];

        await session.commitTransaction();
        session.endSession();
    });

    // If user is not created throw error
    if (!user) throw new BadRequestError('An error occurred');

    // Create password
    await Password.create({ user: user._id, password });

    // Get access token
    const populated_user: UserWithStatus = await user.populate('status')
    return await handleUnverifiedUser(populated_user.toObject(), res);
};

/**
 * Resend verification email
 * 
 * @description Resends verification email to user
 * 
 * @param { email: string } | User email
 * 
 * @throws { BadRequestError } If user does not exist
 * @throws { BadRequestError } If user's email is already verified
 * 
 * @returns { user: IUser, access_token: string }
 */
const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
    const email: Email = req.body.email;

    // Get user
    const user: IUser & { status: IStatus } | null
        = await User.findOne({ email }).populate('status');

    // Check if user exists
    if (!user) return next(new BadRequestError('User does not exist'));

    // Check if user is unverified
    user.status?.isVerified
        ? next(new BadRequestError("User's email already verified"))
        : await handleUnverifiedUser(user.toObject(), res);
}

const verifyUserEmail = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const verification_code: number = req.body.verification_code;

    // Get user
    const user = req.user

    if (user.status.isVerified) return next(new BadRequestError('User already verified'));

    // Check if verification code is correct
    const auth_code = await AuthCode.findOne({ user: user._id, });

    if (auth_code?.verification_code !== verification_code) {
        return next(new BadRequestError('Invalid verification code'))
    }

    // Verify user
    await Status.findOneAndUpdate({ user: user._id }, { isVerified: true });

    await auth_code.updateOne({ verification_code: undefined })

    // Blacklist access token
    await BlacklistedToken.create({ token: req.headers.authorization.split(' ')[1] })

    res.status(200).send({
        status: 'success',
        message: 'User verified',
        data: {
            user: { ...user, status: undefined },
        },
    });
}

/**
 * Forgot password
 * 
 * @description Sends password reset code to user
 * 
 * @param { email: string } | User email
 * 
 * @throws { BadRequestError } If user does not exist
 * 
 * @returns { user: IUser, access_token: string }
 */
const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const email: Email = req.body.email;

    // Get user
    const user: UserWithStatus | null = await User.findOne({ email }).populate('status');

    // Check if user exists
    if (!user) return next(new BadRequestError('User does not exist'));

    // Get password reset code
    const { password_reset_code }: { password_reset_code: number } =
        await getAuthCodes<'password_reset'>(user, 'password_reset');

    console.log(password_reset_code)
    // Send password reset email
    sendEmail({
        to: email,
        subject: 'Reset your password',
        text: `Your password reset code is ${password_reset_code}`,
    });

    // Get access token
    const { access_token }: { access_token: string } = await getAuthTokens(user.toObject(), 'password_reset');

    return res.status(200).send({
        status: 'success',
        message: 'Password reset code sent to user email',
        data: {
            user: { ...user.toObject(), status: undefined },
            access_token,
        },
    });
}

/**
 * Reset password
 * 
 * @description Resets user password
 * 
 * @param { password_reset_code: number, new_password: string } | Password reset code and new password
 * 
 * @throws { BadRequestError } If password reset code is incorrect
 * @throws { InternalServerError } If password is not updated
 * 
 * @returns { user: IUser, access_token: string }
 */
const resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { password_reset_code, new_password } = req.body;

    // Check if password reset code is correct
    const auth_code = await AuthCode.findOne({ user: req.user._id, password_reset_code });

    if (!auth_code) return next(new BadRequestError('Invalid password reset code'));

    // Update password
    const password = await Password.findOne({ user: req.user._id });

    password
        ? await password.updatePassword(new_password)
        : next(new InternalServerError('An error occurred'));

    // Blacklist access token
    await BlacklistedToken.create({ token: req.headers.authorization.split(' ')[1] });

    res.status(200).send({
        status: 'success',
        message: 'Password reset successful',
        data: {
            user: { ...req.user, status: undefined },
        },
    });
}


export {
    userSignup,
    resendVerificationEmail,
    verifyUserEmail,
    forgotPassword,
    resetPassword
};
