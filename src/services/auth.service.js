import { db } from '#config/database';
import logger from '#config/logger';
import { users } from '#models/user.model';
import { eq } from 'drizzle-orm';
import { DuplicateResourceError, AuthenticationError, DatabaseError } from '#utils/errors';
import { ERROR_MESSAGES } from '#constants/http-status';

import bcrypt from 'bcrypt';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new DatabaseError('Failed to hash password');
  }
};

export const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error verifying password:', error);
    throw new DatabaseError('Failed to verify password');
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    // Re-throw authentication errors
    if (error instanceof AuthenticationError) {
      throw error;
    }
    
    // Log and throw database error for unexpected issues
    logger.error('Error authenticating user:', error);
    throw new DatabaseError('Authentication service unavailable');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new DuplicateResourceError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning();

    return newUser;
  } catch (error) {
    // Re-throw operational errors
    if (error instanceof DuplicateResourceError) {
      throw error;
    }
    
    // Log and throw database error for unexpected issues
    logger.error('Error creating user:', error);
    throw new DatabaseError('Failed to create user');
  }
};
