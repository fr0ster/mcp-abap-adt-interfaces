/** Loaded TLS client-cert material for an https.Agent. */
export interface ICertificateMaterial {
  cert?: Buffer | string | undefined;
  key?: Buffer | string | undefined;
  pfx?: Buffer | undefined;
  passphrase?: string | undefined;
}
