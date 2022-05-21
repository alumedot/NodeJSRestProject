import { validationResult } from 'express-validator';
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

export const postPost: ExpressCB = (req, res) => {
  const { body: { title, content } } = req;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed, entered data is incorrect.',
      errors: errors.array()
    })
  }

  res.status(201).json({
    message: 'Post created successfully!',
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: { name: 'Alex' },
      createdAt: new Date()
    }
  });
}
