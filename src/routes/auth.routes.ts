import { Router } from 'express';
import {
    resendVerificationEmail, userSignup,
    verifyUserEmail, forgotPassword,
    resetPassword,
    logout,
    login
} from '../controllers/auth.controller';
import { basicAuth, withAuthentication } from '../middlewares/auth';
import schemaValidator from '../middlewares/routerSchemaValidator';
import * as schema from '../types/routerschemas';

const router = Router();

router
    .post('/signup/enduser', schemaValidator(schema.userSignup), userSignup)
    .get(
        '/verificationemail',
        schemaValidator(schema.resendVerificationEmail),
        resendVerificationEmail
    )
    .post(
        '/verifyemail/',
        schemaValidator(schema.verifyUserEmail),
        basicAuth('verification'),
        withAuthentication(verifyUserEmail)
    )
    .post('/forgotpassword', forgotPassword)
    .patch('/resetpassword', basicAuth('password_reset'), withAuthentication(resetPassword))
    .post('/login', login)
    .post('/logout', basicAuth(undefined), withAuthentication(logout))

export default router;
