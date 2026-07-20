/**
 * Sanitizes server and internal error messages to display abstract,
 * non-revealing errors to the user.
 * 
 * @param {string|any} msg - The raw error message from the server or catch block
 * @returns {string} The safe, abstract error message
 */
export const sanitizeErrorMessage = (msg) => {
  if (typeof msg !== 'string') return 'An unexpected error occurred.';

  const lowerMsg = msg.toLowerCase();

  // 1. Route/Endpoint not found errors
  if (lowerMsg.includes('on this server') || lowerMsg.includes('not found') || lowerMsg.includes('route')) {
    return 'The requested resource could not be found.';
  }

  // 2. Role validation errors
  if (lowerMsg.includes('role must be') || lowerMsg.includes('invalid role')) {
    return 'Please select a valid role to continue.';
  }

  // 3. Database / Cast / Validation errors
  if (
    lowerMsg.includes('validation error') ||
    lowerMsg.includes('validationerror') ||
    lowerMsg.includes('casterror') ||
    lowerMsg.includes('duplicate key') ||
    lowerMsg.includes('mongodb') ||
    lowerMsg.includes('database') ||
    lowerMsg.includes('invalid value') ||
    lowerMsg.includes('cast to objectid')
  ) {
    return 'Invalid data format or request parameters.';
  }

  // 4. Request body/JSON/syntax errors
  if (lowerMsg.includes('invalid json') || lowerMsg.includes('syntaxerror')) {
    return 'Invalid request format.';
  }

  // 5. Server/Internal/Multer errors
  if (lowerMsg.includes('unexpected file field') || lowerMsg.includes('multer')) {
    return 'File upload failed due to invalid file field.';
  }

  // 6. Generic or highly technical errors
  if (
    lowerMsg.includes('jwt') ||
    lowerMsg.includes('token') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('forbidden')
  ) {
    if (lowerMsg.includes('expired')) {
      return 'Your session has expired. Please login again.';
    }
    return 'Authentication failed. Please login again.';
  }

  if (
    lowerMsg.includes('stack') ||
    lowerMsg.includes('line ') ||
    lowerMsg.includes('column ') ||
    lowerMsg.includes('anonymous') ||
    lowerMsg.includes('node_modules') ||
    lowerMsg.includes('internal server error') ||
    lowerMsg.includes('something went wrong') ||
    lowerMsg.includes('http') ||
    lowerMsg.includes('axios') ||
    lowerMsg.includes('fetch')
  ) {
    return 'A server error occurred. Please try again later.';
  }

  return msg;
};

export default sanitizeErrorMessage;
