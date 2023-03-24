import { Model, Schema, model } from 'mongoose';
import { IPassword } from './types/password.types';
import bcrypt from 'bcrypt';

const options = { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } };

interface IPasswordMethods {
    updatePassword(new_password: string): Promise<void>;
    comparePassword(password: string): Promise<boolean>;
}
type PasswordModel = Model<IPassword> & IPasswordMethods;

const password_schema = new Schema(
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
password_schema.method('comparePassword', async function comparePassword(password: string) {
    return await bcrypt.compare(password, this.password);
})

const Password: PasswordModel = model<IPassword, PasswordModel>('Password', password_schema);

export { Password, IPassword, PasswordModel, password_schema };
