import { Router } from 'express';
import { userSignup } from '../controllers/auth.controller';
import zodValidator from '../middlewares/zod';

const router = Router();

router.post('/signup/enduser', zodValidator, userSignup);

export default router;
