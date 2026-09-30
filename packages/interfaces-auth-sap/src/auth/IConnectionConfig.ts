import type { DestinationGrant } from './DestinationGrant';

/**
 * Connection configuration - values needed for connecting to services
 * Returned by stores with actual values (not file paths)
 */
export interface IConnectionConfig {
  /** Service URL (SAP/ABAP/MCP URL) - undefined for XSUAA if not provided */
  serviceUrl?: string;
  /** Authorization token (JWT token) - required for JWT auth, optional for basic auth */
  authorizationToken?: string;
  /** Username for basic authentication - required for basic auth, optional for JWT auth */
  username?: string;
  /** Password for basic authentication - required for basic auth, optional for JWT auth */
  password?: string;
  /**
   * Authentication type - 'basic' for on-premise, 'jwt' for cloud, 'snc' for SNC over RFC.
   * A store states it for every destination that holds a credential or a grant.
   */
  authType?: 'basic' | 'jwt' | 'saml' | 'snc';
  /** How the destination obtains a new credential; absent means the destination does not say */
  grantType?: DestinationGrant;
  /**
   * When the stored credential stops being valid, in epoch milliseconds, as the
   * provider reported it. A JWT carries its own `exp`; session cookies do not.
   */
  expiresAt?: number;
  /** SAP client number (optional, for ABAP/BTP) */
  sapClient?: string;
  /** Language (optional, for ABAP/BTP) */
  language?: string;
  /** Session cookies for SAML authentication (raw Cookie header value) */
  sessionCookies?: string;
  // SNC settings for a destination whose `authType` is `'snc'` — how to reach
  // the system, not a secret. Such a destination needs no authorization
  // config, no username and no password.
  /** The system's SNC name, e.g. "p:CN=SID, O=ACME" */
  sncPartnerName?: string;
  /** Quality of protection: "1" auth, "2" integrity, "3" privacy, "8" default, "9" maximum available */
  sncQop?: string;
  /** The SNC (GSS) library; discovered when absent */
  sncLib?: string;
  /** The user's SNC name; taken from the credential when absent */
  sncMyName?: string;

  // OIDC settings, for grantType 'oidc_authorization_code', 'device_code',
  // 'password' (with username / password above) and 'token_exchange'. The
  // client is the destination's authorization config.
  /** The issuer; its discovery document supplies any endpoint not given */
  oidcIssuerUrl?: string;
  oidcAuthorizationEndpoint?: string;
  oidcTokenEndpoint?: string;
  oidcDeviceAuthorizationEndpoint?: string;
  oidcScopes?: string[];
  /** token_exchange: the token exchanged (RFC 8693 subject_token) */
  oidcSubjectToken?: string;
  /** token_exchange: its type URI */
  oidcSubjectTokenType?: string;
  /** token_exchange: the audience asked for */
  oidcAudience?: string;
  /** token_exchange: the actor token, when acting on behalf of the subject */
  oidcActorToken?: string;
  /** token_exchange: its type URI */
  oidcActorTokenType?: string;
  // SAML settings, for grantType 'saml2_pure' and 'saml2_bearer'. The IdP's
  // trust is stored with the destination; nothing is fetched at run time.
  /** The IdP's single sign-on URL */
  samlIdpSsoUrl?: string;
  /** The Issuer every assertion must name */
  samlIdpEntityId?: string;
  /** The IdP's signing certificates, PEM or base64 DER; several during a key rotation */
  samlIdpCertificates?: string[];
  /** This service provider's entity ID — the assertion's Audience */
  samlSpEntityId?: string;
  /** The assertion consumer service URL — the assertion's Recipient */
  samlAcsUrl?: string;
  samlRelayState?: string;
  /** IdP-initiated: no AuthnRequest, and the assertion carries no InResponseTo */
  samlIdpInitiated?: boolean;
  /** Clock skew allowed when checking the assertion's times, in milliseconds */
  samlClockSkewMs?: number;
  /** saml2_bearer: the token endpoint the assertion is exchanged at */
  samlTokenUrl?: string;
}
