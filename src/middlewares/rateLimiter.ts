import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => ENV.NODE_ENV === 'development',
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: () => ENV.NODE_ENV === 'development',
});

// OTP rate limiter
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many OTP requests. Please try again after 1 hour.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => ENV.NODE_ENV === 'development',
});

// Payment rate limiter
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many payment requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => ENV.NODE_ENV === 'development',
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many file uploads. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => ENV.NODE_ENV === 'development',
});
