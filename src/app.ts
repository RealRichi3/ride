import express, { Application, NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { NODE_ENV, PORT } from './config';

function initMiddlewares(app: Application) {
    NODE_ENV == 'dev' ? app.use(morgan('dev')) : null;

    app.use(express.json());
    app.use(cors());
}

function initExpressRouteHandler(app: Application) {}

export const app: Application = express();

export function startExpressServer() {
    initMiddlewares(app);

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}...`);
    });
}
