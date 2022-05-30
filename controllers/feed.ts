import fs from 'fs';
import path from 'path';
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

  if (!req.file) {
    const error = new Error('No image provided.');
    (error as Error & { statusCode: number }).statusCode = 422;
    next(error);
  }

  const post = new Post({
    title,
    content,
    imageUrl: req.file.path,
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

export const updatePost: ExpressCB = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    (error as Error & { statusCode: number }).statusCode = 422;
    throw error;
  }

  const { postId } = req.params;
  const { title, content } = req.body;
  let image = req.body.image;

  if (req.file) {
    image = req.file.path;
  }

  if (!image) {
    const error = new Error('No image provided.');
    (error as Error & { statusCode: number }).statusCode = 422;
    throw error;
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Couldn't find post");
      (error as Error & { statusCode: number }).statusCode = 404;
      throw error;
    }

    if (image !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.imageUrl = image;
    post.content = content;

    const updatedPost = await post.save();

    return res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
}

const clearImage = (filePath) => {
  const pathToDelete = path.join(__dirname, '..', filePath);
  fs.unlink(pathToDelete, e => console.log(e));
}
