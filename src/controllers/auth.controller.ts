import { Request, Response, NextFunction } from 'express';
import { IUser, User } from '../models/user.model';
import { BadRequestError } from '../utils/errors';
import mongoose from 'mongoose';
import { Password } from '../models/password.model';
import { IStatus } from '../models/types/status.types';

function handleUnverifiedUser(unverified_user: IUser & { status: IStatus }) {
    return async function (req: Request, res: Response, next: NextFunction) {
        // Handle unverified user
        // Get verificateion code
        // Send verification email
        // Get access token
    };
}

function handleExistingUser(existing_user: IUser & { status: IStatus }) {
    return async function (req: Request, res: Response, next: NextFunction) {
        // Handle existing user

        if (!existing_user.status.isVerified) {
            // Handle unverified user
            const { access_token } = await handleUnverifiedUser(existing_user)(req, res, next);

            res.status(200).json({
                status: 'success',
                message: 'User created successfully',
                data: {
                    user: existing_user,
                    access_token,
                },
            });
        } else next(new BadRequestError('User already exists'));
    };
}

const userSignup = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstname, lastname, password, role } = req.body;
    const user_info = { email, firstname, lastname, password, role };

    // Check if user already exists
    const existing_user: IUser | null = await User.findOne({ email }).populate('status');
    if (existing_user) {
        // Handle existing user
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

    // Send response
    res.status(200).json({
        status: 'success',
        message: 'User created successfully',
        data: {
            user,
        },
    });
};

export { userSignup };
