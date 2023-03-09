import { Mongoose, Schema, Document, Types, model } from 'mongoose';

const options = { toObject: { virtuals: true }, toJSON: { virtuals: true } };

interface IUser extends Document {
    firstname: string;
    lastname: string;
    email: string;
    user: Types.ObjectId;
    role: 'EndUser' | 'Admin' | 'SuperAdmin';
}

const user_schema = new Schema(
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
    { timestamp: true, ...options}
);

const User = model<IUser>('User', user_schema)

export default {
    User
}
