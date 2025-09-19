import logger from '#config/logger';
import {
  ERROR_MESSAGES,
  ERROR_TYPES,
  HTTP_STATUS,
} from '#constants/http-status';
import {
  formatErrorResponse,
  isOperationalError,
  ValidationError,
} from '#utils/errors';

/**
 * Global error handler middleware
 * Must be placed after all routes
 */
export const errorHandler = (error, req, res, _next) => {
  // Log the error
  logger.error('Error occurred:', {
    message: error.message,
    type: error.type || 'UNKNOWN_ERROR',
    statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Log full error details but limit what's sent in the response

  // Special handling for ValidationError
  if (
    error instanceof ValidationError ||
    error.message === 'Validation failed'
  ) {
    const errorResponse = {
      success: false,
      error: {
        type: ERROR_TYPES.VALIDATION_ERROR || 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details || 'Invalid input data',
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse);
  }

  // Handle operational errors (expected errors)
  if (isOperationalError(error)) {
    const errorResponse = formatErrorResponse(error, false); // Never include stack in response
    return res.status(error.statusCode).json(errorResponse);
  }

  // Handle unexpected errors
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  // For non-operational errors, don't expose internal details to client
  const errorResponse = {
    success: false,
    error: {
      type: 'INTERNAL_ERROR',
      message:
        statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
          ? ERROR_MESSAGES.INTERNAL_SERVER_ERROR
          : message,
      timestamp: new Date().toISOString(),
    },
  };

  // Include stack trace only in logs, never in response
  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 - Route not found
 */
export const notFoundHandler = (req, res) => {
  const errorResponse = {
    success: false,
    error: {
      type: 'RESOURCE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString(),
    },
  };

  logger.warn('Route not found:', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse);
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch Promise rejections
 */
export const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
