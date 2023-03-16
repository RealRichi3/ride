import { Router, Application } from 'express';

import authRoute from './auth.routes';
import zodValidator from '../middlewares/zod';

export default function routeHandler(app: Application) {
    const router = Router();
    app.use('/api/v1', router);

    router.use(zodValidator)
    router.use('/auth', authRoute);
}
