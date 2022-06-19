import bcrypt from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Post } from '../models/post';

export interface IResponseError extends Error {
  data: {};
  code: number;
}

export const resolver = {
  async createUser(
    {
      userInput: { email, name, password }
    },
    req
  ) {
    const errors: { message: string }[] = [];

    if (!validator.isEmail(email)) {
      errors.push({ message: email });
    }

    if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
      errors.push({ message: 'Password is too short' });
    }

    if (errors.length) {
      const error = new Error('Invalid input');
      (error as IResponseError).data = errors;
      (error as IResponseError).code = 422;
      throw error;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('User exists');
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      name,
      password: hashedPassword
    });

    const createdUser = await user.save();

    return {
      ...createdUser._doc,
      _id: createdUser._id.toString()
    };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found.');
      (error as IResponseError).code = 401;
      throw error;
    }

    const isEqualPassword = await bcrypt.compare(password, user.password);

    if (!isEqualPassword) {
      const error = new Error('Password is incorrect');
      (error as IResponseError).code = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email
      },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    return {
      token,
      userId: user._id.toString()
    };
  },

  async createPost(
    {
      postInput: {
        title,
        content,
        imageUrl
      }
    },
    req
  ) {
    const errors = [];

    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: 'Title is invalid' });
    }

    if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
      errors.push({ message: 'Content is invalid' });
    }

    if (errors.length) {
      const error = new Error('Invalid input');
      (error as IResponseError).data = errors;
      (error as IResponseError).code = 422;
      throw error;
    }

    const post = new Post({
      title,
      content,
      imageUrl
    });

    const createdPost = await post.save();

    // Add post to users posts

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    };
  }
}
