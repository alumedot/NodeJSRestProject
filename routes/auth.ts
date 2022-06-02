import { Router } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { signup } from '../controllers/auth';

export const router = Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom(async (value) => {
        const user = await User.findOne({ email: value });

        if (user) {
          return Promise.reject('Email address already exists');
        }
      })
      .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
  ],
  signup
);
