import { ERROR_TYPES, HTTP_STATUS } from '#constants/http-status';

/**
 * Base class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode, type = ERROR_TYPES.INTERNAL_ERROR, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_TYPES.VALIDATION_ERROR);
    this.details = details;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_TYPES.AUTHENTICATION_ERROR);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_TYPES.AUTHORIZATION_ERROR);
  }
}

/**
 * Duplicate resource error
 */
export class DuplicateResourceError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, HTTP_STATUS.CONFLICT, ERROR_TYPES.DUPLICATE_RESOURCE);
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_TYPES.RESOURCE_NOT_FOUND);
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_TYPES.DATABASE_ERROR);
  }
}

/**
 * Format error response
 */
export const formatErrorResponse = (error, includeStack = false) => {
  const response = {
    success: false,
    error: {
      type: error.type || ERROR_TYPES.INTERNAL_ERROR,
      message: error.message || 'An unexpected error occurred',
      timestamp: error.timestamp || new Date().toISOString(),
    },
  };

  // Add details for validation errors
  if (error.details) {
    response.error.details = error.details;
  }

  // Add stack trace in development
  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
};

/**
 * Check if error is operational (expected) or programming error
 */
export const isOperationalError = (error) => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};