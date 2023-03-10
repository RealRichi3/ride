import { Model, Schema, model } from 'mongoose';
import { IPassword } from './types/password.types';

const options = { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } };

const password_schema = new Schema<IPassword>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        password: { type: String, required: true },
    },
    options
);

const Password: Model<IPassword> = model<IPassword>('Password', password_schema);

export { Password, IPassword };
