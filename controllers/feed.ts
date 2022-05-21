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

export const postPost: ExpressCB = async (req, res) => {
  const { body: { title, content } } = req;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed, entered data is incorrect.',
      errors: errors.array()
    })
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
    console.log(e);
  }
}
