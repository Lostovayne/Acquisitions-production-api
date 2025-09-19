import 'dotenv/config.js';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Configure Neon based on environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // Configure for Neon Local (development)
  neonConfig.fetchEndpoint = 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
} else if (isProduction) {
  neonConfig.useSecureWebSocket = true;
  neonConfig.poolQueryViaFetch = false;
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, {
  logger: isDevelopment ? true : false,
});

export { db, sql };
