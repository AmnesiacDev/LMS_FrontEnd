import { describe, it, expect } from 'vitest';
import { sanitizeErrorMessage } from '../errorSanitizer';

describe('errorSanitizer utility', () => {
  it('should return default message for non-string input', () => {
    expect(sanitizeErrorMessage(null)).toBe('An unexpected error occurred.');
    expect(sanitizeErrorMessage(undefined)).toBe('An unexpected error occurred.');
    expect(sanitizeErrorMessage({})).toBe('An unexpected error occurred.');
  });

  it('should abstract route not found errors', () => {
    expect(sanitizeErrorMessage("Can't find /api/v1/auth/signup-admin on this server!"))
      .toBe('The requested resource could not be found.');
    expect(sanitizeErrorMessage("Route not found")).toBe('The requested resource could not be found.');
  });

  it('should abstract role validation errors', () => {
    expect(sanitizeErrorMessage("Role must be one of: student, parent"))
      .toBe('Please select a valid role to continue.');
    expect(sanitizeErrorMessage("invalid role provided")).toBe('Please select a valid role to continue.');
  });

  it('should abstract database validation and cast errors', () => {
    expect(sanitizeErrorMessage("ValidationError: Name is required"))
      .toBe('Invalid data format or request parameters.');
    expect(sanitizeErrorMessage("Cast to ObjectId failed for value '123'"))
      .toBe('Invalid data format or request parameters.');
    expect(sanitizeErrorMessage("duplicate key error index: email_1"))
      .toBe('Invalid data format or request parameters.');
  });

  it('should abstract JSON body parser errors', () => {
    expect(sanitizeErrorMessage("SyntaxError: Unexpected token } in JSON at position 10"))
      .toBe('Invalid request format.');
    expect(sanitizeErrorMessage("invalid json in request body")).toBe('Invalid request format.');
  });

  it('should abstract multer/upload errors', () => {
    expect(sanitizeErrorMessage("Unexpected file field 'avatar'")).toBe('File upload failed due to invalid file field.');
    expect(sanitizeErrorMessage("MulterError: File too large")).toBe('File upload failed due to invalid file field.');
  });

  it('should sanitize but preserve expired vs authentication failures', () => {
    expect(sanitizeErrorMessage("jwt expired")).toBe('Your session has expired. Please login again.');
    expect(sanitizeErrorMessage("invalid signature (JWT)")).toBe('Authentication failed. Please login again.');
    expect(sanitizeErrorMessage("unauthorized access token")).toBe('Authentication failed. Please login again.');
  });

  it('should abstract traceback, stack and generic internal errors', () => {
    expect(sanitizeErrorMessage("Internal Server Error"))
      .toBe('A server error occurred. Please try again later.');
    expect(sanitizeErrorMessage("something went wrong !"))
      .toBe('A server error occurred. Please try again later.');
    expect(sanitizeErrorMessage("ReferenceError: x is not defined\n    at Object.<anonymous> (file.js:2:12)"))
      .toBe('A server error occurred. Please try again later.');
  });

  it('should pass through safe user-friendly errors', () => {
    expect(sanitizeErrorMessage("Incorrect email or password")).toBe("Incorrect email or password");
    expect(sanitizeErrorMessage("Email already in use")).toBe("Email already in use");
    expect(sanitizeErrorMessage("Password must be at least 8 characters")).toBe("Password must be at least 8 characters");
  });
});
