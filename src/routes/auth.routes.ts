import { Router } from 'express';
import { resendVerificationEmail, userSignup, verifyUserEmail } from '../controllers/auth.controller';
import { basicAuth, withAuthentication } from '../middlewares/auth';

const router = Router();

router
    .post('/signup/enduser', userSignup)
    .get('/verificationemail', resendVerificationEmail)
    .post('/verifyemail', basicAuth('verification'), withAuthentication(verifyUserEmail));

export default router;
