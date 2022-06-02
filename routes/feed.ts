import { Router } from 'express';
import { body } from 'express-validator';
import {
  getPosts,
  postPost,
  getPost,
  updatePost,
  deletePost
} from '../controllers/feed';

export const router = Router();

router.get('/posts', getPosts);

router.post(
  '/post',
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ],
  postPost
);

router.get('/post/:postId', getPost);

router.put(
  '/post/:postId',
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ],
  updatePost
);

router.delete('/post/:postId', deletePost);
