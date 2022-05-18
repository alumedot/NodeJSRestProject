import express from 'express';
import { getPosts, postPost } from '../controllers/feed';

export const router = express.Router();

router.get('/posts', getPosts);

router.post('/post', postPost);
