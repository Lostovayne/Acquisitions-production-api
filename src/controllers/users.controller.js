import logger from '#config/logger';
import { HTTP_STATUS } from '#constants/http-status';
import { asyncHandler } from '#middlewares/error.middleware';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '#services/users.service';
import { ValidationError } from '#utils/errors';
import { formatValidationErrors } from '#utils/format';
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  userQuerySchema,
} from '#validations/users.validation';

export const fetchAllUsers = asyncHandler(async (req, res) => {
  const validationResult = userQuerySchema.safeParse(req.query);
  if (!validationResult.success) {
    const errorDetails = formatValidationErrors(validationResult.error);
    throw new ValidationError('Invalid query parameters', errorDetails);
  }

  const result = await getAllUsers(validationResult.data);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Users fetched successfully',
    data: result.users,
    pagination: result.pagination,
  });

  logger.info('Users fetched successfully', {
    count: result.users.length,
    page: result.pagination.page,
    total: result.pagination.total,
  });
});

export const fetchUserById = asyncHandler(async (req, res) => {
  const validationResult = userIdSchema.safeParse(req.params);
  if (!validationResult.success) {
    const errorDetails = formatValidationErrors(validationResult.error);
    throw new ValidationError('Invalid user ID', errorDetails);
  }

  const { id } = validationResult.data;

  // Users can only view their own profile unless they are admin
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'You can only view your own profile',
    });
  }

  const user = await getUserById(id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User fetched successfully',
    data: user,
  });

  logger.info('User fetched successfully', {
    userId: id,
    userEmail: user.email,
    accessedBy: req.user.email,
  });
});

export const createUserController = asyncHandler(async (req, res) => {
  const validationResult = createUserSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errorDetails = formatValidationErrors(validationResult.error);
    throw new ValidationError(
      'Please provide all required fields with valid data',
      errorDetails
    );
  }

  const user = await createUser(validationResult.data);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });

  logger.info('User created successfully', {
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    createdBy: req.user?.email || 'system',
  });
});

export const updateUserController = asyncHandler(async (req, res) => {
  const idValidation = userIdSchema.safeParse(req.params);
  if (!idValidation.success) {
    const errorDetails = formatValidationErrors(idValidation.error);
    throw new ValidationError('Invalid user ID', errorDetails);
  }

  const dataValidation = updateUserSchema.safeParse(req.body);
  if (!dataValidation.success) {
    const errorDetails = formatValidationErrors(dataValidation.error);
    throw new ValidationError('Invalid update data', errorDetails);
  }

  const { id } = idValidation.data;
  const updateData = dataValidation.data;

  // Only admin can update role
  if (updateData.role && req.user.role !== 'admin') {
    delete updateData.role;
  }

  // Users can only update their own account unless they are admin
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'You can only update your own account',
    });
  }

  const updatedUser = await updateUser(id, updateData);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser,
  });

  logger.info('User updated successfully', {
    userId: id,
    updatedBy: req.user.email,
    updatedFields: Object.keys(updateData),
  });
});

export const deleteUserController = asyncHandler(async (req, res) => {
  const validationResult = userIdSchema.safeParse(req.params);
  if (!validationResult.success) {
    const errorDetails = formatValidationErrors(validationResult.error);
    throw new ValidationError('Invalid user ID', errorDetails);
  }

  const { id } = validationResult.data;
  const currentUserId = req.user.id;

  const result = await deleteUser(id, currentUserId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: result.message,
  });

  logger.info('User deleted successfully', {
    deletedUserId: id,
    deletedBy: req.user.email,
  });
});
