import { db } from '#config/database';
import logger from '#config/logger';
import { ERROR_MESSAGES } from '#constants/http-status';
import { users } from '#models/user.model';
import { hashPassword } from '#services/auth.service';
import {
  DatabaseError,
  DuplicateResourceError,
  NotFoundError,
} from '#utils/errors';
import { and, count, desc, eq, like, or } from 'drizzle-orm';

export const getAllUsers = async (filters = {}) => {
  try {
    const { page = 1, limit = 10, role, search } = filters;
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);

    // Apply filters
    const whereConditions = [];

    if (role) {
      whereConditions.push(eq(users.role, role));
    }

    if (search) {
      whereConditions.push(
        or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
      );
    }

    if (whereConditions.length > 0) {
      query = query.where(
        whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions)
      );
    }

    // Get total count for pagination
    const totalQuery = db.select({ count: count() }).from(users);
    if (whereConditions.length > 0) {
      totalQuery.where(
        whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions)
      );
    }

    const [totalResult] = await totalQuery;
    const total = totalResult.count;

    // Apply pagination and sorting
    const usersList = await query
      .orderBy(desc(users.created_at))
      .limit(limit)
      .offset(offset);

    return {
      users: usersList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw new DatabaseError('Failed to fetch users');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      throw new DuplicateResourceError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
        updated_at: new Date(),
      })
      .returning();

    // Return user without password
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof DuplicateResourceError) {
      throw error;
    }
    logger.error('Error creating user:', error);
    throw new DatabaseError('Failed to create user');
  }
};

export const updateUser = async (id, updateData) => {
  try {
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== existingUser.email) {
      const [emailExists] = await db
        .select()
        .from(users)
        .where(eq(users.email, updateData.email))
        .limit(1);

      if (emailExists) {
        throw new DuplicateResourceError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    // Return user without password
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof DuplicateResourceError
    ) {
      throw error;
    }
    logger.error(`Error updating user with ID ${id}:`, error);
    throw new DatabaseError('Failed to update user');
  }
};

export const deleteUser = async (id, currentUserId) => {
  try {
    // Prevent self-deletion
    if (id === currentUserId) {
      throw new DatabaseError('Cannot delete your own account');
    }

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Delete user
    await db.delete(users).where(eq(users.id, id));

    return { message: 'User deleted successfully' };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof DatabaseError) {
      throw error;
    }
    logger.error(`Error deleting user with ID ${id}:`, error);
    throw new DatabaseError('Failed to delete user');
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Return user without password
    // eslint-disable-next-line no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error(`Error fetching user with ID ${id}:`, error);
    throw new DatabaseError('Failed to fetch user');
  }
};
