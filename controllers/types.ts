import type { NextFunction, Request, Response } from 'express';

export type ExpressCB = (req: Request, res: Response, next: NextFunction) => void;
