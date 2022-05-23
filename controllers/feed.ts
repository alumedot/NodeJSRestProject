import { validationResult } from 'express-validator';
import { Post } from '../models/post';
import type { ExpressCB } from './types';

export const getPosts: ExpressCB = async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.status(200).json({
      message: 'Fetched posts',
      posts
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
}

export const postPost: ExpressCB = async (req, res, next) => {
  const { body: { title, content } } = req;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    (error as Error & { statusCode: number }).statusCode = 422;
    next(error);
  }

  const post = new Post({
    title,
    content,
    imageUrl: 'images/dummy.png',
    creator: { name: 'Alex' },
  })

  try {
    const result = await post.save();

    res.status(201).json({
      message: 'Post created successfully!',
      post: result
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
}

export const getPost: ExpressCB = async ({ params }, res, next) => {
  try {
    const post = await Post.findById(params.postId);
    if (!post) {
      const error = new Error("Couldn't find post");
      (error as Error & { statusCode: number }).statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: 'Post fetched',
      post
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
}
