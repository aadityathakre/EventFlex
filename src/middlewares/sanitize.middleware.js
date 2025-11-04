import { ApiError } from "../utils/ApiError.js";

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize string inputs
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .substring(0, 1000); // Limit length
    };

    // Sanitize request body
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        }
      }
    }

    // Sanitize query parameters
    if (req.query) {
      for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeString(req.query[key]);
        }
      }
    }

    // Sanitize route parameters
    if (req.params) {
      for (const key in req.params) {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeString(req.params[key]);
        }
      }
    }

    next();
  } catch (error) {
    throw new ApiError(400, "Invalid input data");
  }
};

// Rate limiting middleware (basic implementation)
const requestCounts = new Map();

export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(clientId)) {
      requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    } else {
      const clientData = requestCounts.get(clientId);
      
      if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + windowMs;
      } else {
        clientData.count++;
        
        if (clientData.count > maxRequests) {
          return res.status(429).json({
            success: false,
            message: "Too many requests, please try again later",
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
          });
        }
      }
    }
    
    next();
  };
};
