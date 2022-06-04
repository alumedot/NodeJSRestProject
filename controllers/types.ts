import type { NextFunction, Request, Response } from 'express';

interface IRequest extends Request {
  userId: string;
}

export type ExpressCB = (req: IRequest, res: Response, next: NextFunction) => void;
