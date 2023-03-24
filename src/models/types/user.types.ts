import { Types, Document } from 'mongoose';
import { IPassword } from './password.types';
import { IStatus } from './status.types';
import { Email } from '../../types';

interface IUser extends Document {
    firstname: string;
    lastname: string;
    email: Email;
    role: 'EndUser' | 'Admin' | 'SuperAdmin';
    googleId?: string;
    githubId?: string;
    craetedAt: Date;
    updatedAt: Date;
}

interface IUserWithVirtuals extends IUser {
    status: Types.ObjectId | IStatus;
    password: Types.ObjectId | IPassword;
}

export { IUser, IUserWithVirtuals };
