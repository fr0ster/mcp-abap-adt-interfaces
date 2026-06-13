import type { SapAuthType, SapConnectionType } from './SapAuthType';

export interface ISapConfig {
  url: string;
  client?: string;
  /** Logon language (e.g. "EN", "DE"). Passed per request like the client/mandant so the HTTP session runs in it; created objects then take it as their master language. */
  language?: string;
  authType: SapAuthType;
  connectionType?: SapConnectionType;
  username?: string;
  password?: string;
  jwtToken?: string;
  refreshToken?: string;
  // Session cookies for SAML authentication (raw Cookie header value)
  sessionCookies?: string;

  // Certificate (mTLS) auth — file-based, cross-platform
  certPath?: string; // PEM cert file
  certKeyPath?: string; // PEM private key file
  certPfxPath?: string; // PKCS#12 / PFX file (alternative to PEM pair)
  certPassphrase?: string; // optional passphrase for key/PFX

  // Kerberos / SPNEGO auth
  kerberosSpn?: string; // e.g. "HTTP@sap-host.corp"; derived from url if absent
  kerberosService?: string; // service class, default "HTTP"

  uaaUrl?: string; // UAA URL for token refresh (optional, can be extracted from service key)
  uaaClientId?: string; // UAA client ID for token refresh (optional)
  uaaClientSecret?: string; // UAA client secret for token refresh (optional)
}
