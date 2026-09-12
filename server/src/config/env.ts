import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root or local
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Sanitizes environment variable values by trimming whitespace, newlines,
 * and stripping accidental enclosing single or double quotes.
 */
const sanitizeEnv = (val?: string): string => {
  if (!val) return '';
  let cleaned = val.trim();
  // Strip outer quotes if present (both single and double)
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  // Strip trailing carriage returns or stray newlines
  cleaned = cleaned.replace(/[\r\n]+/g, '').trim();
  return cleaned;
};

const rawPort = sanitizeEnv(process.env.PORT) || '5000';
const rawClientUrl = sanitizeEnv(process.env.CLIENT_URL) || 'http://localhost:5173';
const rawServerUrl = sanitizeEnv(process.env.SERVER_URL) || `http://localhost:${rawPort}`;

export const config = {
  port: parseInt(rawPort, 10),
  databaseType: sanitizeEnv(process.env.DATABASE_TYPE) || 'auto', // 'postgres' | 'mysql' | 'auto'
  databaseUrl: sanitizeEnv(process.env.DATABASE_URL),
  pgHost: sanitizeEnv(process.env.PG_HOST) || 'localhost',
  pgPort: parseInt(sanitizeEnv(process.env.PG_PORT) || '5432', 10),
  pgUser: sanitizeEnv(process.env.PG_USER) || 'postgres',
  pgPassword: sanitizeEnv(process.env.PG_PASSWORD) || 'postgres',
  pgDatabase: sanitizeEnv(process.env.PG_DATABASE) || 'pfis',
  mysqlHost: sanitizeEnv(process.env.MYSQL_HOST) || 'localhost',
  mysqlPort: parseInt(sanitizeEnv(process.env.MYSQL_PORT) || '3306', 10),
  mysqlUser: sanitizeEnv(process.env.MYSQL_USER) || 'root',
  mysqlPassword: sanitizeEnv(process.env.MYSQL_PASSWORD) || '',
  mysqlDatabase: sanitizeEnv(process.env.MYSQL_DATABASE) || 'pfis',
  jwtSecret: sanitizeEnv(process.env.JWT_SECRET) || 'pfis_super_secure_jwt_secret_key_2026',
  jwtExpiresIn: '7d',
  googleMapsApiKey: sanitizeEnv(process.env.GOOGLE_MAPS_API_KEY),
  googleClientSecret: sanitizeEnv(process.env.GOOGLE_CLIENT_SECRET),
  googleClientId: sanitizeEnv(process.env.GOOGLE_CLIENT_ID),
  clientUrl: rawClientUrl.replace(/\/+$/, ''),
  serverUrl: rawServerUrl.replace(/\/+$/, ''),
  googleCallbackUrl: (
    sanitizeEnv(process.env.GOOGLE_CALLBACK_URL) ||
    `${rawServerUrl.replace(/\/+$/, '')}/api/auth/google/callback`
  ).replace(/\/+$/, ''),
  nodeEnv: sanitizeEnv(process.env.NODE_ENV) || 'development',
  maxFileSizeMb: parseInt(sanitizeEnv(process.env.MAX_FILE_SIZE_MB) || '10', 10),
};

/**
 * Safe startup validator for Google OAuth configuration.
 * Validates presence, format, and consistency without ever exposing or logging secret values.
 */
export const validateGoogleOAuthEnv = (): void => {
  const isProd = config.nodeEnv === 'production';
  const hasClientId = !!config.googleClientId && config.googleClientId.length > 0;
  const hasClientSecret = !!config.googleClientSecret && config.googleClientSecret.length > 0;
  const hasCallbackUrl = !!config.googleCallbackUrl && config.googleCallbackUrl.length > 0;

  console.log('[PFIS OAuth Validation]');
  console.log(`  - Target Callback URL: ${config.googleCallbackUrl}`);
  console.log(`  - Client URL (Frontend): ${config.clientUrl}`);
  console.log(`  - Server URL (Backend): ${config.serverUrl}`);
  console.log(`  - Client ID Configured: ${hasClientId ? `YES (length: ${config.googleClientId.length})` : 'NO (MISSING)'}`);
  console.log(`  - Client Secret Configured: ${hasClientSecret ? `YES (length: ${config.googleClientSecret.length})` : 'NO (MISSING)'}`);

  if (isProd) {
    if (!hasClientId) {
      console.error('[PFIS OAuth ERROR] GOOGLE_CLIENT_ID is missing in Render production environment!');
    }
    if (!hasClientSecret) {
      console.error('[PFIS OAuth ERROR] GOOGLE_CLIENT_SECRET is missing in Render production environment!');
    }
    if (!hasCallbackUrl) {
      console.error('[PFIS OAuth ERROR] GOOGLE_CALLBACK_URL is missing or empty!');
    }
    if (hasClientId && !config.googleClientId.includes('.apps.googleusercontent.com')) {
      console.warn('[PFIS OAuth WARNING] GOOGLE_CLIENT_ID does not appear to end with .apps.googleusercontent.com. Please verify your Google Cloud Console Web Application credentials.');
    }
    if (hasClientSecret && config.googleClientSecret.length < 10) {
      console.warn('[PFIS OAuth WARNING] GOOGLE_CLIENT_SECRET appears unusually short. Please ensure you copied the full Client Secret from Google Cloud Console.');
    }
  }
};
