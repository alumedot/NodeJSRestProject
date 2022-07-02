import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type { ExpressCB } from '../controllers/types';

export const auth: ExpressCB = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader)  {
    (req as any).isAuth = false;
    return next();
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.SECRET_KEY);
  } catch (e) {
    (req as any).isAuth = false;
    return next();
  }

  if (!decodedToken) {
    (req as any).isAuth = false;
    return next();
  }

  (req as Request & { userId: string }).userId = (decodedToken as JwtPayload).userId;
  (req as any).isAuth = true;

  next();
}
