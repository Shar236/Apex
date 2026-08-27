import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/index.js';
import { GoogleSearchConsoleConnection } from '../models/index.js';
import { encrypt, decrypt } from '../utils/tokenCrypto.js';

export const SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

const getClient = () => {
  const sc = config.google.searchConsole;
  return new OAuth2Client(sc.clientId, sc.clientSecret, sc.redirectUri);
};

export const buildConsentUrl = (stateJwt) => {
  const client = getClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [SEARCH_CONSOLE_SCOPE],
    state: stateJwt,
  });
};

export const exchangeCodeForTokens = async (code) => {
  const client = getClient();
  const { tokens } = await client.getToken(code);
  return tokens; // { refresh_token, access_token, expiry_date, scope, ... }
};

class GoogleAuthError extends Error {
  constructor(message, code = 'GOOGLE_AUTH_ERROR') {
    super(message);
    this.code = code;
  }
}

/**
 * Mints a fresh access token on demand from the stored encrypted refresh
 * token. Access tokens are never persisted — only the encrypted refresh
 * token lives at rest, one less secret to protect.
 */
export const getFreshAccessToken = async () => {
  const conn = await GoogleSearchConsoleConnection.findOne({ connected: true });
  if (!conn || !conn.encryptedRefreshToken) {
    throw new GoogleAuthError('Google Search Console is not connected.', 'NOT_CONNECTED');
  }
  const refreshToken = decrypt(conn.encryptedRefreshToken);
  const client = getClient();
  client.setCredentials({ refresh_token: refreshToken });
  try {
    const { token } = await client.getAccessToken();
    if (!token) throw new GoogleAuthError('Failed to obtain a Google access token.', 'TOKEN_REFRESH_FAILED');
    return token;
  } catch (err) {
    if (err.message?.includes('invalid_grant') || err.message?.includes('revoked')) {
      throw new GoogleAuthError('Google authorization expired or was revoked. Please reconnect.', 'REAUTH_REQUIRED');
    }
    throw new GoogleAuthError('Could not refresh Google access token.', 'TOKEN_REFRESH_FAILED');
  }
};

export { GoogleAuthError };
