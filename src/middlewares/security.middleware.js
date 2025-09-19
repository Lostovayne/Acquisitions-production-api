import aj from '#config/arcjet';
import logger from '#config/logger';
import { ERROR_MESSAGES, HTTP_STATUS } from '#constants/http-status';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (req, res, next) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Agregar User-Agent por defecto si no existe
    if (!req.get('User-Agent')) {
      req.headers['user-agent'] = 'Internal-Request/1.0';
    }

    const role = req.user?.role || 'guest';
    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = isDevelopment ? 100 : 20; // 100 en dev, 20 en prod
        message = 'Admin rate limit exceeded. Try again later.';
        break;
      case 'user':
        limit = isDevelopment ? 50 : 10; // 50 en dev, 10 en prod
        message = 'User rate limit exceeded. Try again later.';
        break;
      case 'guest':
        limit = isDevelopment ? 30 : 8; // 30 en dev, 8 en prod (aumentado)
        message = 'Guest rate limit exceeded. Try again later.';
        break;
    }

    // Solo logear en desarrollo, no mostrar error
    if (isDevelopment) {
      // console.log(`🛡️ Arcjet check - Role: ${role}, Limit: ${limit}/min, UA: ${req.get('User-Agent')}`);
    } else {
      console.error('Rate Limit:', message);
    }

    const client = aj.withRule(
      slidingWindow({
        mode: isDevelopment ? 'DRY_RUN' : 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    // En modo DRY_RUN (desarrollo), solo logear sin bloquear
    if (isDevelopment && decision.isDenied()) {
      console.log('🚧 [DRY_RUN] Would block:', {
        reason: decision.reason.toString(),
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
      });
      return next(); // No bloquear en desarrollo
    }

    // Aplicar bloqueos solo en producción
    if (!isDevelopment) {
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
    }

    next();
  } catch (error) {
    console.error('Security Middleware Error:', error);
    // En desarrollo, continuar a pesar del error
    if (process.env.NODE_ENV === 'development') {
      console.log('🚧 [DEV] Continuing despite Arcjet error');
      return next();
    }
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
