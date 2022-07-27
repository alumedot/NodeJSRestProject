import { validationResult } from 'express-validator';
import type { ValidationError } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

export const login: ExpressCB = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('A user with this email could not be found') as Error & {
        statusCode: number;
      };
      error.statusCode = 404;

      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error('Wrong password!') as Error & {
        statusCode: number;
      };
      error.statusCode = 401;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, userId: user._id.toString() });
    return;
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }

    next(e);
    return e;
  }
}

export const getStatus: ExpressCB = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('User not found') as Error & {
        statusCode: number;
      };
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ status: user.status })
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
}

export const patchStatus: ExpressCB = async ({ userId, body }, res, next) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found') as Error & {
        statusCode: number;
      };
      error.statusCode = 404;
      throw error;
    }

    user.status = body.status;
    await user.save();

    res.status(200).json({ message: 'User updated '});
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
}
