import { Model, Schema, model } from 'mongoose';
import { IPassword } from './types/password.types';
import bcrypt from 'bcrypt';

const options = { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } };

interface IPasswordMethods {
    updatePassword(new_password: string): Promise<void>;
}
type PasswordModel = Model<IPassword, object, IPasswordMethods>

const password_schema = new Schema<IPassword, PasswordModel, IPasswordMethods>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        password: { type: String, required: true },
    },
    options
);

password_schema.method('updatePassword', async function updatePassword(new_password: string) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(new_password, salt);
    await this.save();
})

const Password = model<IPassword, PasswordModel>('Password', password_schema);

export { Password, IPassword, PasswordModel };
