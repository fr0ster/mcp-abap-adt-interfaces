/** A client certificate a service key carries — the key's data, as it is. */
export interface IClientCertificate {
  /** The authorization server (XSUAA `url`) — its authorize page. */
  readonly uaaUrl: string;
  /** The client id (`clientid`). */
  readonly clientId: string;
  /** PEM: the client certificate, possibly a chain (leaf first). */
  readonly certificate: string;
  /** PEM: the certificate's private key. */
  readonly key: string;
  /** The mTLS host of the authorization server (XSUAA `certurl`), no path. */
  readonly certUrl: string;
}
