// src/features/auth/repositories/user.repository.ts
import UserModel, { IUser } from '../models/User.model';
import { IUserLean } from '../types';

// The repository is the ONLY place in the codebase that imports a Mongoose model.
// All queries are encapsulated here. Services never call mongoose directly.

export const userRepository = {
  /**
   * Find a user by email.
   * Password is excluded by default (select: false on schema).
   * Pass includePassword=true when you need to verify credentials.
   */
  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (includePassword) query.select('+password');
    return query.lean<IUser>().exec();
  },

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).lean<IUser>().exec();
  },

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<IUserLean> {
    const user = await UserModel.create(data);
    // Return without password
    const { password: _pw, ...safe } = user.toObject();
    return safe as IUserLean;
  },

  async existsByEmail(email: string): Promise<boolean> {
    return !!(await UserModel.exists({ email: email.toLowerCase() }));
  },
};
