import { validationResult } from 'express-validator';
import type { ValidationError } from 'express-validator';
import bcrypt from 'bcryptjs';
import { User } from '../models/user';
import type { ExpressCB } from './types';

export const signup: ExpressCB = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.') as Error & {
        statusCode: number;
        data: ValidationError[];
      };
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { email, name, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await new User({
      email,
      password: hashedPassword,
      name
    });

    const result = await user.save();
    res.status(201).json({ message: 'User created!', userId: result.userId });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
}
