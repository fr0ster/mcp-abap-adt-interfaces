import type { SapAuthType, SapConnectionType } from './SapAuthType';

export interface ISapConfig {
  url: string;
  client?: string;
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

  // SNC over RFC — the SNC library of an installed product authenticates the
  // RFC logon; no username or password.
  sncPartnerName?: string; // the system's SNC name, e.g. "p:CN=SID, O=ACME"
  sncQop?: string; // "1" auth, "2" integrity, "3" privacy, "8" default, "9" maximum available
  sncLib?: string; // path to the SNC (GSS) library; discovered when absent
  sncMyName?: string; // the user's SNC name; taken from the credential when absent

  // RFC through a message server and a logon group (load balancing), instead
  // of one application server. The names are the SAP NW RFC SDK's own
  // connection parameters, passed to it as they are. With `mshost` set, the RFC
  // wire dials the message server and `url` gives no host or system number.
  mshost?: string; // message server host
  msserv?: string; // message server service or port, e.g. "3600" or "sapmsSID"
  sysid?: string; // system ID; with mshost, when msserv is absent
  group?: string; // logon group, e.g. "PUBLIC"
  saprouter?: string; // SAProuter string, e.g. "/H/router.example.com/S/3299/H/"; for either addressing

  uaaUrl?: string; // UAA URL for token refresh (optional, can be extracted from service key)
  uaaClientId?: string; // UAA client ID for token refresh (optional)
  uaaClientSecret?: string; // UAA client secret for token refresh (optional)
}
