import { config } from '../config/index.js';

const PLACEHOLDER_PATTERNS = [/^YOUR_/i, /^CHANGE_ME/i, /_HERE$/i];

const isPlaceholder = (value) => {
  const v = String(value || '').trim();
  if (!v) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(v));
};

export const hasSearchConsoleCredentials = () => {
  const sc = config.google.searchConsole;
  return !isPlaceholder(sc.clientId) && !isPlaceholder(sc.clientSecret) && !isPlaceholder(sc.redirectUri);
};

export const hasPageSpeedCredentials = () => !isPlaceholder(config.google.pagespeed.apiKey);

export const hasTokenEncryptionKey = () => !isPlaceholder(config.google.tokenEncryptionKey);

export const isGoogleSeoEnabled = () => config.google.seoIntegrationEnabled;

export const isSearchConsoleEnabled = () =>
  isGoogleSeoEnabled() && config.google.searchConsole.enabled && hasSearchConsoleCredentials() && hasTokenEncryptionKey();

export const isPageSpeedEnabled = () =>
  isGoogleSeoEnabled() && config.google.pagespeed.enabled && hasPageSpeedCredentials();

// The only shape ever safe to send to the frontend — booleans only, no secrets.
export const getGoogleSeoConfig = () => ({
  seoIntegrationEnabled: isGoogleSeoEnabled(),
  searchConsole: {
    enabled: isSearchConsoleEnabled(),
    configured: hasSearchConsoleCredentials(),
    clientIdConfigured: !isPlaceholder(config.google.searchConsole.clientId),
    clientSecretConfigured: !isPlaceholder(config.google.searchConsole.clientSecret),
    redirectUriConfigured: !isPlaceholder(config.google.searchConsole.redirectUri),
  },
  pagespeed: {
    enabled: isPageSpeedEnabled(),
    configured: hasPageSpeedCredentials(),
  },
  siteUrl: config.google.siteUrl || '',
});
