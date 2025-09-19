import { db } from '#config/database';
import logger from '#config/logger';
import { users } from '#models/user.model';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db.select().from(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async id => {
  try {
    return await db.select().from(users).where(eq(users.id, id)).limit(1);
  } catch (error) {
    logger.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};
