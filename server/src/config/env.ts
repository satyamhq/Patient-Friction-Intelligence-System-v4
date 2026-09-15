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

const nodeEnv = sanitizeEnv(process.env.NODE_ENV) || 'development';
const isProd = nodeEnv === 'production' || !!process.env.RENDER;

const rawPort = sanitizeEnv(process.env.PORT) || '5000';

const defaultClientUrl = isProd
  ? 'https://pfis-patient-friction-intelligence.onrender.com'
  : 'http://localhost:5173';

const defaultServerUrl = isProd
  ? 'https://pfis-patient-friction-intelligence-system.onrender.com'
  : `http://localhost:${rawPort}`;

let rawClientUrl = sanitizeEnv(process.env.CLIENT_URL) || defaultClientUrl;
if (isProd && (rawClientUrl.includes('localhost') || rawClientUrl.includes('127.0.0.1'))) {
  console.warn('[PFIS Config Warning] CLIENT_URL configured with localhost in production environment. Overriding with production frontend domain.');
  rawClientUrl = 'https://pfis-patient-friction-intelligence.onrender.com';
}

let rawServerUrl = sanitizeEnv(process.env.SERVER_URL) || defaultServerUrl;
if (isProd && (rawServerUrl.includes('localhost') || rawServerUrl.includes('127.0.0.1'))) {
  console.warn('[PFIS Config Warning] SERVER_URL configured with localhost in production environment. Overriding with production backend domain.');
  rawServerUrl = 'https://pfis-patient-friction-intelligence-system.onrender.com';
}

let rawCallbackUrl = sanitizeEnv(process.env.GOOGLE_CALLBACK_URL) || `${rawServerUrl.replace(/\/+$/, '')}/api/auth/google/callback`;
if (isProd && (rawCallbackUrl.includes('localhost') || rawCallbackUrl.includes('127.0.0.1'))) {
  console.warn('[PFIS Config Warning] GOOGLE_CALLBACK_URL configured with localhost in production environment. Overriding with production callback domain.');
  rawCallbackUrl = 'https://pfis-patient-friction-intelligence-system.onrender.com/api/auth/google/callback';
}

export const config = {
  port: parseInt(rawPort, 10),
  mongodbUri: sanitizeEnv(process.env.MONGODB_URI) || 'mongodb://localhost:27017/pfis',
  jwtSecret: sanitizeEnv(process.env.JWT_SECRET) || 'pfis_super_secure_jwt_secret_key_2026',
  jwtExpiresIn: '7d',
  googleMapsApiKey: sanitizeEnv(process.env.GOOGLE_MAPS_API_KEY),
  googleClientSecret: sanitizeEnv(process.env.GOOGLE_CLIENT_SECRET),
  googleClientId: sanitizeEnv(process.env.GOOGLE_CLIENT_ID),
  clientUrl: rawClientUrl.replace(/\/+$/, ''),
  serverUrl: rawServerUrl.replace(/\/+$/, ''),
  googleCallbackUrl: rawCallbackUrl.replace(/\/+$/, ''),
  nodeEnv,
  maxFileSizeMb: parseInt(sanitizeEnv(process.env.MAX_FILE_SIZE_MB) || '10', 10),
  geminiApiKey: sanitizeEnv(process.env.GEMINI_API_KEY),
  elevenLabsAgentId: sanitizeEnv(process.env.ELEVENLABS_AGENT_ID) || 'agent_2901m2hw983kfcesprd47f904gbk',
  elevenLabsApiKey: sanitizeEnv(process.env.ELEVENLABS_API_KEY),
  twilioAccountSid: sanitizeEnv(process.env.TWILIO_ACCOUNT_SID),
  twilioAuthToken: sanitizeEnv(process.env.TWILIO_AUTH_TOKEN),
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
