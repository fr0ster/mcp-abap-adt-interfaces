import type { ISapConfig } from '../sap/ISapConfig';
import type { ICertificateMaterial } from './ICertificateMaterial';
/** Loads client-certificate material from a connection config (file paths, etc.). */
export interface ICertificateMaterialLoader {
  load(config: ISapConfig): Promise<ICertificateMaterial>;
}
