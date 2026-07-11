/**
 * Wrapper for async route handlers to catch errors
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */

const { AppError } = require('../exceptions/AppError');
const Logger = require('./logger');

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      Logger.error('ASYNC_HANDLER', `Unhandled error in route: ${req.method} ${req.path}`, error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
          timestamp: error.timestamp
        });
      }

      // Handle unexpected errors
      res.status(500).json({
        error: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      });
    });
  };
};

module.exports = asyncHandler;
