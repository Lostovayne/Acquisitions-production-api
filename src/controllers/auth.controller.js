import logger from '#config/logger';
import { HTTP_STATUS } from '#constants/http-status';
import { asyncHandler } from '#middlewares/error.middleware';
import { authenticateUser, createUser } from '#services/auth.service';
import { cookies } from '#utils/cookies';
import { ValidationError } from '#utils/errors';
import { formatValidationErrors } from '#utils/format';
import { jwttoken } from '#utils/jwt';
import { loginSchema, signupSchema } from '#validations/auth.validation';

export const signup = asyncHandler(async (req, res) => {
  const validationResult = signupSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errorDetails = formatValidationErrors(validationResult.error);
    throw new ValidationError(
      'Please provide all required fields with valid data',
      errorDetails
    );
  }

  const { name, email, password, role } = validationResult.data;

  // Create user with hashed password
  const newUser = await createUser({ name, email, password, role });

  // Create JWT
  const token = jwttoken.sign({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  // Set cookie
  cookies.set(res, 'token', token);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });

  logger.info('User signed up successfully', {
    email: newUser.email,
    role: newUser.role,
  });
});

export const signin = asyncHandler(async (req, res) => {
  const validationResult = loginSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errorDetails = formatValidationErrors(validationResult.error);
    throw new ValidationError(
      'Please provide valid login credentials',
      errorDetails
    );
  }

  const { email, password } = validationResult.data;

  // Authenticate user
  const user = await authenticateUser({ email, password });

  // Create JWT
  const token = jwttoken.sign({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Set cookie
  cookies.set(res, 'token', token);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User signed in successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  logger.info('User signed in successfully', {
    email: user.email,
    role: user.role,
  });
});

export const signout = asyncHandler(async (req, res) => {
  // Clear the token cookie
  cookies.clear(res, 'token');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User signed out successfully',
  });

  logger.info('User signed out successfully');
});

export const getProfile = asyncHandler(async (req, res) => {
  // User info is already available in req.user from the auth middleware
  res.status(HTTP_STATUS.OK).json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});
