import { Request, Response, NextFunction } from 'express';
import { getAuthAdmin } from '../config/firebase';
import { z, ZodSchema } from 'zod';
import rateLimit from 'rate-limit-flexible'; // better for distributed environments
import { idempotencyRepository } from '../repositories';
import logger from '../utils/logger'; // assume a logger is available
import { AppError, AuthError, ValidationError, NotFoundError, ConflictError } from '../utils/errors';

// Extend Express Request type with generics for validated body
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        displayName?: string;
      };
      validatedBody?: unknown; // will be narrowed by middleware
      idempotencyKey?: string;
    }
  }
}

// Environment check for dev-only bypass
const isDevelopment = process.env.NODE_ENV === 'development';

// ------------------------------------------------------------------
// 1. Authentication Middleware
// ------------------------------------------------------------------

/**
 * Strict authentication – fails if no valid token or user ID.
 * - Supports Bearer token (primary) and x-user-id header (dev only).
 * - In production, x-user-id is ignored unless explicitly enabled via ENV.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'] as string;

    // Bearer token takes precedence
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decodedToken = await getAuthAdmin().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name,
      };
      return next();
    }

    // Developer bypass – only in development and when explicitly allowed
    if (isDevelopment && userIdHeader) {
      try {
        const userRecord = await getAuthAdmin().getUser(userIdHeader);
        req.user = {
          uid: userRecord.uid,
          email: userRecord.email || '',
          displayName: userRecord.displayName || undefined,
        };
        return next();
      } catch {
        throw new AuthError('Invalid user ID');
      }
    }

    throw new AuthError('Authorization header required');
  } catch (error) {
    next(error); // pass to error handler
  }
}

/**
 * Optional authentication – continues even without credentials.
 */
export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decodedToken = await getAuthAdmin().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name,
      };
    }
    next();
  } catch {
    next(); // ignore errors and continue
  }
}

// ------------------------------------------------------------------
// 2. Validation Middleware (typed)
// ------------------------------------------------------------------

/**
 * Validates request body against a Zod schema.
 * Attaches validated data to `req.validatedBody` with proper typing.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError('Validation failed', result.error.flatten().fieldErrors));
      return;
    }
    req.validatedBody = result.data;
    next();
  };
}

/**
 * Validates query parameters against a Zod schema.
 * Overwrites `req.query` with validated data (type-safe).
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ValidationError('Invalid query parameters', result.error.flatten().fieldErrors));
      return;
    }
    req.query = result.data as any;
    next();
  };
}

// ------------------------------------------------------------------
// 3. Rate Limiting (configurable)
// ------------------------------------------------------------------

// Use environment variables for flexibility
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 min
const API_RATE_LIMIT_MAX = parseInt(process.env.API_RATE_LIMIT_MAX || '100', 10);
const AUTH_RATE_LIMIT_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10);
const STRICT_RATE_LIMIT_MAX = parseInt(process.env.STRICT_RATE_LIMIT_MAX || '30', 10);

// For distributed systems, consider using Redis store with `rate-limit-redis`
export const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: API_RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: STRICT_RATE_LIMIT_MAX,
  message: { error: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ------------------------------------------------------------------
// 4. Idempotency Middleware
// ------------------------------------------------------------------

/**
 * Ensures idempotency key is present for mutating requests.
 * Non-mutating requests skip this check.
 */
export function idempotencyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    return next(new ValidationError('Idempotency-Key header required for mutating requests'));
  }

  req.idempotencyKey = idempotencyKey;
  next();
}

/**
 * Checks idempotency store for existing response.
 * If found, returns cached response; otherwise stores the response after handler completes.
 */
export async function checkIdempotency(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.idempotencyKey) return next();

  try {
    const { isNew, response } = await idempotencyRepository.checkAndStore(
      req.idempotencyKey,
      null, // placeholder, will be updated later
      60 * 60 // TTL in seconds (1 hour)
    );

    if (!isNew) {
      // Replay cached response
      res.setHeader('X-Idempotency-Replay', 'true');
      return res.json(response);
    }

    // Intercept `res.json` to capture and store the final response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Store asynchronously – do not await to avoid blocking response
      idempotencyRepository
        .checkAndStore(req.idempotencyKey!, body, 60 * 60)
        .catch(err => logger.error('Failed to store idempotency response', err));
      return originalJson(body);
    };

    next();
  } catch (error) {
    logger.error('Idempotency error:', error);
    next(); // continue without idempotency on error (fail-open)
  }
}

// ------------------------------------------------------------------
// 5. Optimistic Locking (placeholder)
// ------------------------------------------------------------------

/**
 * Simple pass-through for `If-Match` header.
 * Real logic should be implemented in the route handler using the header.
 */
export function optimisticLockMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Just forward the header; actual concurrency control is applied in service layer
  next();
}

// ------------------------------------------------------------------
// 6. Global Error Handler
// ------------------------------------------------------------------

/**
 * Central error handler with custom error classes.
 * All errors are passed to this middleware, which sends appropriate HTTP responses.
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error('Unhandled error:', err);

  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Zod validation errors (should already be caught by ValidationError wrapper)
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.flatten().fieldErrors,
    });
  }

  // Fallback for unexpected errors
  res.status(500).json({ error: 'Internal server error' });
}

// ------------------------------------------------------------------
// 7. Async Handler Wrapper
// ------------------------------------------------------------------

/**
 * Wraps async route handlers to catch errors and forward to Express error middleware.
 * Usage: `router.get('/path', asyncHandler(async (req, res) => { ... }))`
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
