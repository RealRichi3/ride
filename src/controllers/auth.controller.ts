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
 * @param res  Response object
 * @param next  Next function
 *
 * @returns { access_token: string}
 */
async function handleUnverifiedUser(
    unverified_user: IUser & { status: IStatus }, res: Response)
    : Promise<Response> {

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

    return res.status(200).send({
        status: 'success',
        message: 'Verification code sent to user email',
        data: {
            user: unverified_user,
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
    existing_user: IUser & { status: IStatus }, res: Response, next: NextFunction)
    : Promise<Response | NextFunction> {

    const response =
        existing_user.status.isVerified
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
    const existing_user: IUser | null = await User.findOne({ email }).populate('status');
    if (existing_user) {
        // Handle existing user
        return await handleExistingUser(existing_user.toObject(), res, next);
    }

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
    return await handleUnverifiedUser(user.toObject(), res);
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
    const email = req.params.email as Email;

    // Get user
    const user: IUser & { status: IStatus } | null = await User.findOne({ email }).populate('status');

    // Check if user exists
    if (!user) return next(new BadRequestError('User does not exist'));

    // Check if user is unverified
    user.status.isVerified
        ? next(new BadRequestError("User's email already verified"))
        : await handleUnverifiedUser(user, res);
}

export { userSignup, resendVerificationEmail };
