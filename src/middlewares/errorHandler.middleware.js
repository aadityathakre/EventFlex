import { ApiError } from "../utils/ApiError.js";

// Centralized error handling middleware
export const errorHandler = (err, req, res, next) => {
  let error = err;
  
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, `Validation Error: ${message}`);
  } else if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(409, `${field} already exists`);
  } else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  } else if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  } else if (err.name === 'MongoError' && err.code === 11000) {
    error = new ApiError(409, 'Duplicate field value');
  } else if (!(err instanceof ApiError)) {
    error = new ApiError(500, err.message || 'Internal Server Error');
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler for undefined routes
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};
