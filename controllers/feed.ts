import fs from 'fs';
import path from 'path';
import { validationResult } from 'express-validator';
import { Post } from '../models/post';
import { User } from '../models/user';
import { getIo } from '../socket';
import type { ExpressCB } from './types';

export const getPosts: ExpressCB = async (req, res, next) => {
  const currentPage = Number(req.query.page) || 1;
  const LIMIT = 2;

  try {
    const totalItems = await  Post.find().countDocuments();

    const posts = await Post.find()
      .populate('creator')
      .skip((currentPage - 1) * LIMIT)
      .limit(LIMIT);

    res.status(200).json({
      message: 'Fetched posts',
      posts,
      totalItems
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
  const userId = req.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    (error as Error & { statusCode: number }).statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No image provided.');
    (error as Error & { statusCode: number }).statusCode = 422;
    throw error;
  }

  const post = new Post({
    title,
    content,
    imageUrl: req.file.path,
    creator: userId,
  })

  try {
    const result = await post.save();

    const user = await User.findById(userId)
    user.posts.push(post);
    await user.save();

    getIo().emit('posts', {
      action: 'create',
      post
    });

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

    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorised.');
      (error as Error & { statusCode: number }).statusCode = 403;
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

export const deletePost: ExpressCB = async ({ params, userId }, res, next) => {
  try {
    const post = await Post.findById(params.postId);

    if (!post) {
      const error = new Error("Couldn't find post");
      (error as Error & { statusCode: number }).statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== userId) {
      const error = new Error('Not authorised.');
      (error as Error & { statusCode: number }).statusCode = 403;
      throw error;
    }

    // TODO Check logged it user
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(params.postId);

    const user = await User.findById(userId);
    user.posts.pull(params.postId);
    await user.save();

    res.status(200).json({ message: 'Deleted post' });
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
