/** Loaded TLS client-cert material for an https.Agent. */
export interface ICertificateMaterial {
  cert?: Buffer | string;
  key?: Buffer | string;
  pfx?: Buffer;
  passphrase?: string;
}
