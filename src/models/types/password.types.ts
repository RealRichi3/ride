import { Types, Document } from 'mongoose';
import { IUser } from './user.types';

interface IPassword extends Document {
    password: string;
    user: Types.ObjectId | IUser;
    createdAt?: Date;
    updatedAt?: Date;
}

export { IPassword };
