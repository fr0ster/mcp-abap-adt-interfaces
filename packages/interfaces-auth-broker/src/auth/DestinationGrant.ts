/**
 * How a destination obtains a new credential — stated by the destination's
 * configuration, never inferred from the host or the shape of a service key.
 *
 * Read with `IConnectionConfig.authType`: the grants in the first group renew
 * a `'jwt'` destination, those in the second a `'saml'` one, and `'none'`
 * either — a credential handed over and not renewed.
 *
 * Not `OAuth2GrantType` (`@mcp-abap-adt/interfaces-auth`): that lists OAuth
 * grants on the wire; this lists the ways a destination is renewed, which
 * include a UAA passcode, SAML session cookies and no renewal at all.
 */
export type DestinationGrant =
  // authType 'jwt'
  /** UAA authorization code */
  | 'authorization_code'
  /** UAA client credentials */
  | 'client_credentials'
  /** UAA one-time passcode */
  | 'passcode'
  /** OIDC authorization code with PKCE */
  | 'oidc_authorization_code'
  /** OIDC device authorization */
  | 'device_code'
  /** OIDC resource owner password */
  | 'password'
  /** OAuth 2.0 token exchange (RFC 8693) */
  | 'token_exchange'
  // authType 'saml'
  /** A SAML assertion exchanged for session cookies */
  | 'saml2_pure'
  /** A SAML assertion exchanged for an OAuth token (RFC 7522) */
  | 'saml2_bearer'
  // either
  /** Handed over, not renewed */
  | 'none';
