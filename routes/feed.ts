import express from 'express';
import { getPosts } from '../controllers/feed';

export const router = express.Router();

router.get('/posts', getPosts);
