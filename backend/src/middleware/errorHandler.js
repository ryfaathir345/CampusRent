// src/middleware/errorHandler.js
// Global error handling middleware

const { errorResponse } = require('../utils/response');

/**
 * Async handler wrapper — eliminates try/catch boilerplate in controllers
 * @param {Function} fn - Async route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, `Route ${req.originalUrl} not found`);
};

/**
 * Global error handler — must be registered LAST in Express middleware chain
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return errorResponse(res, 409, `${field} already exists`);
  }

  if (err.code === 'P2025') {
    return errorResponse(res, 404, 'Record not found');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Token expired');
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, statusCode, message);
};

module.exports = { asyncHandler, notFoundHandler, globalErrorHandler };
