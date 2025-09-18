export const formatValidationErrors = errors => {
  if (!errors || errors.issues) return 'Validation failed';

  if (Array.isArray(errors)) {
    return errors
      .map(err => `${err.path.join('.')} - ${err.message}`)
      .join(', ');
  }
  return JSON.stringify(errors);
};
