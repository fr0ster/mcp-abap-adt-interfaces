import type { ICertificateMaterial } from './ICertificateMaterial';

/** What a token request is, before the client is authenticated. */
export interface ITokenRequestDraft {
  /** The token endpoint the provider's configuration names. */
  readonly endpoint: string;
  /** The mTLS alias of that endpoint, when the server published one (RFC 8705 §5). */
  readonly mtlsEndpoint?: string;
  /**
   * The authorization server's token endpoint, also for a request that goes
   * elsewhere (the device authorization). A client assertion names it as its
   * audience (RFC 7523): Keycloak refuses an assertion whose `aud` is the
   * device endpoint.
   */
  readonly tokenEndpoint?: string;
  readonly clientId: string;
  /** `client_credentials`, `authorization_code`, `refresh_token`, … — or `device_authorization`. */
  readonly grantType: string;
}

/** How this client authenticates one token request. */
export interface ITokenRequestAuthentication {
  /** Where the request goes instead of `draft.endpoint` (XSUAA `certurl`, an mTLS alias). */
  readonly endpoint?: string;
  /** Form parameters added to the body (`client_id`, `client_secret`, `client_assertion`, …). */
  readonly parameters?: Readonly<Record<string, string>>;
  /** Headers added to the request (`Authorization: Basic …`). */
  readonly headers?: Readonly<Record<string, string>>;
}

/**
 * How a token provider's client authenticates to the authorization server.
 * Called once per request to the server — the first token, every refresh,
 * the device authorization — never cached by the caller.
 */
export interface IClientAuthentication {
  authenticate(draft: ITokenRequestDraft): Promise<ITokenRequestAuthentication>;
  /**
   * The TLS client material this client presents, when it presents one: in
   * the token request's handshake, and on the resource logon of a token bound
   * to it. Absent for a client that presents none.
   */
  tlsMaterial?(): Promise<ICertificateMaterial>;
}
