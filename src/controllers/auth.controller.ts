import { Request, Response, NextFunction } from 'express';
import { IUser, User } from '../models/user.model';
import { BadRequestError } from '../utils/errors';
import mongoose from 'mongoose';
import { Password } from '../models/password.model';

const userSignup = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstname, lastname, password, role } = req.body;
    const user_info = { email, firstname, lastname, password, role };

    // Check if user already exists
    const existing_user: IUser | null = await User.findOne({ email });
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
    res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: {
            user,
        },
    });
};

export { userSignup };
