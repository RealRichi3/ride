import { Application } from 'express';

import authRoute from './auth.routes';

export default function routeHandler (app: Application) {
    app.use('/', [authRoute]);
}
