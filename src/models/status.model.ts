import { Model, Schema, model } from 'mongoose';
import { IStatus } from './types/status.types';

const options = { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } };

const status_schema = new Schema<IStatus>(
    {
        user: { type: Schema.Types.ObjectId, required: true, unique: true },
        isActive: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
    },
    options
);

const Status: Model<IStatus> = model<IStatus>('Status', status_schema);

export { Status, status_schema };
