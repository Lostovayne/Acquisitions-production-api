import { db } from '#config/database';
import logger from '#config/logger';
import { users } from '#models/user.model';
import { eq } from 'drizzle-orm';

import bcrypt from 'bcrypt';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

export const createUser = async ({ name, email, password, role = 'role' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning();

    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
};
