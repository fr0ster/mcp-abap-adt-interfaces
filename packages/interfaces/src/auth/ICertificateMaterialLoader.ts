import type { ISapConfig } from '../sap/ISapConfig';

/** Loaded TLS client-cert material for an https.Agent. */
export interface ICertificateMaterial {
  cert?: Buffer | string;
  key?: Buffer | string;
  pfx?: Buffer;
  passphrase?: string;
}

/** Loads client-certificate material from a connection config (file paths, etc.). */
export interface ICertificateMaterialLoader {
  load(config: ISapConfig): Promise<ICertificateMaterial>;
}
