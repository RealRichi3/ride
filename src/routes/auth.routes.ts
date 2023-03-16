import { Router } from 'express';
import { userSignup } from '../controllers/auth.controller';

const router = Router();


router
    .post('/signup/enduser', userSignup)
    .get('/verificationemail', userSignup)

export default router;
