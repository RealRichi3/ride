import { Router } from 'express';
import { resendVerificationEmail, userSignup } from '../controllers/auth.controller';

const router = Router();


router
    .post('/signup/enduser', userSignup)
    .get('/verificationemail', resendVerificationEmail)

export default router;
