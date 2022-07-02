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
      throw new Error('User exists');
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
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      (error as IResponseError).code = 401;
      throw error;
    }

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

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('Invalid user');
      (error as IResponseError).code = 401;
      throw error;
    }

    const post = new Post({
      title,
      content,
      imageUrl,
      creator: user
    });

    const createdPost = await post.save();

    user.posts.push(createdPost);

    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    };
  },
  async posts(args, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      (error as IResponseError).code = 401;
      throw error;
    }

    const totalPosts = await Post.find().countDocuments();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('creator');

    return {
      posts: posts.map((post) => {
        return {
          ...post._doc,
          _id: post._id.toString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString()
        };
      }),
      totalPosts
    }
  }
}
