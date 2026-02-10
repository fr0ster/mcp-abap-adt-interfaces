import type { SapAuthType } from './SapAuthType';

export interface ISapConfig {
  url: string;
  client?: string;
  authType: SapAuthType;
  username?: string;
  password?: string;
  jwtToken?: string;
  refreshToken?: string;
  // Session cookies for SAML authentication (raw Cookie header value)
  sessionCookies?: string;

  uaaUrl?: string; // UAA URL for token refresh (optional, can be extracted from service key)
  uaaClientId?: string; // UAA client ID for token refresh (optional)
  uaaClientSecret?: string; // UAA client secret for token refresh (optional)
}
