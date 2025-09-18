import logger from '#config/logger';
import { formatValidationErrors } from '#utils/format';
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
    logger.info('User signed up successfully', { email, role });
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: 1, // Simulated user ID
        name,
        email,
        role,
      },
    });
  } catch (error) {
    logger.error('Error during signup', { error });

    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    next(error);
  }
};
