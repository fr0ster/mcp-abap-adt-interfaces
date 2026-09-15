import type { ICertificateMaterial } from '@mcp-abap-adt/interfaces-auth';

import type { ISapConfig } from '../sap/ISapConfig';
/** Loads client-certificate material from a connection config (file paths, etc.). */
export interface ICertificateMaterialLoader {
  load(config: ISapConfig): Promise<ICertificateMaterial>;
}
