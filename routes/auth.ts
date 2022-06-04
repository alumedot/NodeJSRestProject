import { Router } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { signup, login, getStatus, patchStatus } from '../controllers/auth';
import { isAuth } from '../middleware/isAuth';

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

router.post('/login', login);

router.get('/status', isAuth, getStatus);

router.patch(
  '/status',
  isAuth,
  [
    body('status').trim().not().isEmpty()
  ],
  patchStatus
);
