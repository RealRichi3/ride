import { Types, Document } from 'mongoose';
import { IUser } from './user.types';

interface IStatus extends Document {
    user: Types.ObjectId | IUser;
    isActive: boolean;
    isVerified: boolean;
}

export { IStatus };
