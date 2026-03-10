// src/features/auth/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import config from '../../../shared/config/env';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../../shared/utils/AppError';
import { SignupDto, LoginDto, AuthTokenResponse, UserResponse } from '../types';
import { IUser } from '../models/User.model';
import logger from '../../../shared/utils/logger';

// ── Helpers ──────────────────────────────────────────────

const toUserResponse = (user: IUser): UserResponse => ({
  id:        String(user._id),
  firstName: user.firstName,
  lastName:  user.lastName,
  email:     user.email,
  createdAt: user.createdAt.toISOString(),
});

const signToken = (userId: string, email: string): string =>
  jwt.sign({ userId, email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

// ── Service ──────────────────────────────────────────────

export const authService = {
  async signup(dto: SignupDto): Promise<AuthTokenResponse> {
    const exists = await userRepository.existsByEmail(dto.email);
    if (exists) throw new ConflictError('An account with that email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, config.bcrypt.rounds);

    const user = await userRepository.create({
      firstName: dto.firstName.trim(),
      lastName:  dto.lastName.trim(),
      email:     dto.email.toLowerCase(),
      password:  hashedPassword,
    });

    logger.info('User registered', { userId: String(user._id) });

    return {
      user:  toUserResponse(user),
      token: signToken(String(user._id), user.email),
    };
  },

  async login(dto: LoginDto): Promise<AuthTokenResponse> {
    // Explicitly request the password field (excluded by default)
    const user = await userRepository.findByEmail(dto.email, true);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedError('Invalid email or password');

    logger.info('User logged in', { userId: String(user._id) });

    return {
      user:  toUserResponse(user),
      token: signToken(String(user._id), user.email),
    };
  },

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    return toUserResponse(user);
  },
};
