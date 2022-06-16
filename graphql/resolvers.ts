import bcrypt from 'bcryptjs';
import { User } from '../models/user';

export const resolver = {
  async createUser(
    {
      userInput: { email, name, password }
    },
    req
  ) {
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
  }
}
