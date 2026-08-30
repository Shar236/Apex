class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let code = err.code || 'INTERNAL_ERROR';

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const fields = Object.values(err.errors).map(e => e.message).join('; ');
    statusCode = 400;
    message = fields;
    code = 'VALIDATION_ERROR';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).join(',');
    statusCode = 409;
    message = `Duplicate value for: ${field}`;
    code = 'DUPLICATE_KEY';
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
    code = 'BAD_REQUEST';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  if (!err.isOperational) {
    console.error('[error]', err);
  }

  const isDev = (process.env.NODE_ENV || '').toLowerCase() === 'development';

  // In production, never leak an unexpected internal error's raw message
  // (stack traces, DB errors, gateway internals). Operational AppErrors carry
  // safe, user-facing messages and are passed through.
  if (!isDev && statusCode >= 500 && !err.isOperational) {
    message = 'Something went wrong on our side. Please try again.';
    code = 'INTERNAL_ERROR';
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(isDev ? { stack: err.stack } : {}),
  });
};

export { AppError };
