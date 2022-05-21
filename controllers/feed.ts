import { validationResult } from 'express-validator';
import { Post } from '../models/post';
import type { ExpressCB } from './types';

export const getPosts: ExpressCB = (req, res) => {
  res.status(200).json({
    posts: [
      {
        _id: '1',
        title: 'First Post',
        content: 'Some content',
        imageUrl: 'images/dummy.png',
        creator: {
          name: 'Alex',
        },
        createdAt: new Date()
      }
    ]
  });
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
