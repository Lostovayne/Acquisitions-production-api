import arcjet, { detectBot, shield, slidingWindow } from '@arcjet/node';

// Usar modo DRY_RUN en desarrollo para evitar bloqueos
const isDevelopment = process.env.NODE_ENV === 'development';
const mode = isDevelopment ? 'DRY_RUN' : 'LIVE';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode }),
    detectBot({
      mode,
      allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
    }),
    slidingWindow({
      mode,
      interval: '1m',
      max: isDevelopment ? 50 : 10, // Límite más alto en desarrollo
    }),
  ],
});

export default aj;
