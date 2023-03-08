import { Router, Request, Response, NextFunction } from 'express';

let router = Router();

router.get('/main', (req: Request, res: Response, next: NextFunction) => {
    console.log('insisdde')
    return res.status(200).send({
        message: 'seen',
    });
});

export default router;
