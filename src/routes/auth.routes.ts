import { Router, Request, Response, NextFunction } from 'express';

const router = Router();


router
    .get('/', (req: Request, res: Response, next: NextFunction) => {
        res.status(200).send({
            message: 'seen',
        });
    })
    .get('/', (req: Request, res: Response, next: NextFunction) => {
        res.status(200).send({
            message: 'seen',
        });
    })
    .get('/', (req: Request, res: Response, next: NextFunction) => {
        res.status(200).send({
            message: 'seen',
        });
    })
    .get('/', (req: Request, res: Response, next: NextFunction) => {
        res.status(200).send({
            message: 'seen',
        });
    });

export default router;
