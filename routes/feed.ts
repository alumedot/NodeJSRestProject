import express from 'express';
import { body } from 'express-validator';
import { getPosts, postPost } from '../controllers/feed';

export const router = express.Router();

router.get('/posts', getPosts);

router.post(
  '/post',
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ],
  postPost
);
