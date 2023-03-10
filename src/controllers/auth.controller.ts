import { Request, Response, NextFunction } from 'express';
import { IUser, User } from '../models/user.model';

const userSignup = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);

    const user: IUser = await User.create(req.body);
    console.log(user);

    return res.status(200).send({
        success: true,
        data: {
            user,
        },
    });
};

export {
    userSignup
}