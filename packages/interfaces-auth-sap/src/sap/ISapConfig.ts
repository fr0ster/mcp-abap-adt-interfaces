import type { SapAuthType } from './SapAuthType';

/** What every destination may state, whatever its wire. */
export interface ISapConfigBase {
  authType: SapAuthType;
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

  uaaUrl?: string; // UAA URL for token refresh (optional, can be extracted from service key)
  uaaClientId?: string; // UAA client ID for token refresh (optional)
  uaaClientSecret?: string; // UAA client secret for token refresh (optional)
}

/**
 * HTTP: the system's URL, and no RFC key. `connectionType` absent is HTTP, so
 * an HTTP literal written before 4.0.0 compiles unchanged.
 */
export interface ISapHttpConfig extends ISapConfigBase {
  connectionType?: 'http';
  url: string;
  client?: string;
  ashost?: never;
  sysnr?: never;
  mshost?: never;
  msserv?: never;
  sysid?: never;
  group?: never;
  saprouter?: never;
  language?: never;
}

/**
 * What every RFC destination states besides its address: its client and its
 * logon language, none defaulted. No URL: nothing of an RFC address is read
 * from one. The address fields are the SAP NW RFC SDK's own connection
 * parameters, passed to it as they are; `language` is the SDK's `lang`.
 */
export interface ISapRfcLogon extends ISapConfigBase {
  connectionType: 'rfc';
  client: string;
  language: string;
  saprouter?: string; // SAProuter string, e.g. "/H/router.example.com/S/3299/H/"; for either address
  url?: never;
}

/** RFC to one application server: its host and its system number. */
export interface ISapRfcApplicationServer extends ISapRfcLogon {
  ashost: string; // application server host
  sysnr: string; // system number, e.g. "00"
  mshost?: never;
  msserv?: never;
  sysid?: never;
  group?: never;
}

/**
 * RFC through a message server and a logon group (load balancing): its host,
 * its service named by `msserv`, `sysid` or both, and the group.
 */
export type ISapRfcMessageServer = ISapRfcLogon & {
  mshost: string; // message server host
  group: string; // logon group, e.g. "PUBLIC"
  ashost?: never;
  sysnr?: never;
} & (
    | { msserv: string; sysid?: string } // msserv: service or port, e.g. "3600" or "sapmsSID"
    | { msserv?: string; sysid: string } // sysid: the system ID
  );

/** An RFC destination: exactly one complete address. */
export type ISapRfcConfig = ISapRfcApplicationServer | ISapRfcMessageServer;

/**
 * An SAP system's configuration, by connection type: `connectionType: 'rfc'`
 * narrows to `ISapRfcConfig`; anything else — `'http'` or absent — is
 * `ISapHttpConfig`.
 */
export type ISapConfig = ISapHttpConfig | ISapRfcConfig;
