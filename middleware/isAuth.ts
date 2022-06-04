import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type { ExpressCB } from '../controllers/types';

export const isAuth: ExpressCB = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader)  {
    const error = new Error('Not authenticated');
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.SECRET_KEY);
  } catch (e) {
    (e as Error & { statusCode: number }).statusCode = 500;
    throw e;
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated');
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }

  (req as Request & { userId: string }).userId = (decodedToken as JwtPayload).userId;

  next();
}
