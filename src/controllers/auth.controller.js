import logger from '#config/logger';
import { createUser } from '#services/auth.service';
import { cookies } from '#utils/cookies';
import { formatValidationErrors } from '#utils/format';
import { jwttoken } from '#utils/jwt';
import { signupSchema } from '#validations/auth.validation';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.validate(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationErrors(validationResult.error),
      });
    }
    const { name, email, role } = validationResult.data;
    // Simulate user creation logic
    const newUser = await createUser({ name, email, role });

    // create JWT
    const token = jwttoken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });
    // set cookie
    cookies.set('token', token);

    res.status(201).json({
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
  } catch (error) {
    logger.error('Error during signup', { error });
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    next(error);
  }
};
