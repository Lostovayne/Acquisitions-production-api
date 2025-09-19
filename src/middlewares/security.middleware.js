import aj from '#config/arcjet';
import logger from '#config/logger';
import { ERROR_MESSAGES, HTTP_STATUS } from '#constants/http-status';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';
    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20; // 20 requests per minute for admin
        message = 'Admin rate limit exceeded. Try again later.';
        break;
      case 'user':
        limit = 10; // 10 requests per minute for regular users
        message = 'User rate limit exceeded. Try again later.';
        break;
      case 'guest':
        limit = 5; // 5 requests per minute for guests
        message = 'Guest rate limit exceeded. Try again later.';
        break;
    }

    console.error('Rate Limit:', message);
    // Implement rate limiting logic here (e.g., using Redis or in-memory store)
    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    // If Request is a Bot, Block it
    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked:', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        path: req.path,
      });
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ error: ERROR_MESSAGES.FORBIDDEN });
    }

    // IsShield Request, Block it
    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield request blocked:', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ error: ERROR_MESSAGES.FORBIDDEN });
    }

    // Rate Limit Exceeded
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded:', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      return res
        .status(HTTP_STATUS.TOO_MANY_REQUESTS)
        .json({ error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED });
    }
    next();
  } catch (error) {
    console.error('Security Middleware Error:', error);
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
