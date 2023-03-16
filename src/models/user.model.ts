import mongoose, { Schema, Model } from 'mongoose';
import { Status } from './status.model';
import { IUser } from './types/user.types';
import { NODE_ENV } from '../config';
import { AuthCode } from './auth.model';

const options = { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } };

const user_schema = new Schema<IUser>(
    {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['EndUser', 'Admin', 'SuperAdmin'],
            default: 'EndUser',
        },
        googleId: { type: String, select: false },
        githubId: { type: String, select: false },
    },
    options
);

// Get users password from Password collection
user_schema.virtual('password', {
    ref: 'Password',
    localField: '_id',
    foreignField: 'user',
    justOne: true,
});

// Get authentication codes from AuthCode collection
user_schema.virtual('auth_codes', {
    ref: 'AuthCode',
    localField: '_id',
    foreignField: 'user',
    justOne: true,
});

// Get user users account status from Status collection
user_schema.virtual('status', {
    ref: 'Status',
    localField: '_id',
    foreignField: 'user',
    justOne: true,
});

user_schema.pre('validate', async function (next) {
    if (this.isNew) {
        const status = new Status({ user: this._id });

        // Activate user if role is EndUser
        status.isActive = this.role === 'EndUser' ? true : false;

        // Activate and verify user if in development mode
        // if (NODE_ENV == 'dev') [status.isActive, status.isVerified] = [true, true];

        await status.save()
        console.log(status)
        await AuthCode.create({ user: this._id });
    }

    next();
});

const User: Model<IUser> = mongoose.model<IUser>('User', user_schema);

export { User, IUser };
