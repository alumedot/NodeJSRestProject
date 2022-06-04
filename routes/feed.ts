import { Router } from 'express';
import { body } from 'express-validator';
import { isAuth } from '../middleware/isAuth';
import {
  getPosts,
  postPost,
  getPost,
  updatePost,
  deletePost
} from '../controllers/feed';

export const router = Router();

router.get('/posts', isAuth, getPosts);

router.post(
  '/post',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ],
  postPost
);

router.get('/post/:postId', getPost);

router.put(
  '/post/:postId',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ],
  updatePost
);

router.delete('/post/:postId', isAuth, deletePost);
