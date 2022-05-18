import type { ExpressCB } from './types';

export const getPosts: ExpressCB = (req, res) => {
  res.status(200).json({
    posts: [
      {
        title: 'First Post',
        content: 'Some content'
      }
    ]
  });
}

export const postPost: ExpressCB = ({ body: { title, content } }, res) => {
  res.status(201).json({
    message: 'Post created successfully!',
    post: {
      id: new Date().toISOString(),
      title,
      content
    }
  });
}
