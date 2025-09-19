export const formatValidationErrors = errors => {
  if (!errors) return 'Validation failed';

  // Handle Zod validation errors
  if (errors.issues && Array.isArray(errors.issues)) {
    // Format Zod errors into a more structured object
    const formattedErrors = {};

    errors.issues.forEach(issue => {
      const path = issue.path.join('.') || 'general';
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(issue.message);
    });

    return formattedErrors;
  }

  // Handle other array format
  if (Array.isArray(errors)) {
    const formattedErrors = {};

    errors.forEach(err => {
      const path = err.path?.join('.') || 'general';
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(err.message);
    });

    return formattedErrors;
  }

  // If it's already an object, return as is
  if (typeof errors === 'object' && errors !== null) {
    return errors;
  }

  // Fallback for simple string errors
  return { general: [errors.toString()] };
};
