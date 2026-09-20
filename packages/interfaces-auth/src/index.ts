/**
 * @mcp-abap-adt/interfaces-auth
 *
 * Credential and access contracts shared across MCP ABAP ADT package families.
 */

export type { IAuthProvider, IRenewableCredential } from './auth/IAuthProvider';
export type { ICertificateMaterial } from './auth/ICertificateMaterial';
export type {
  IApiKeyCredential,
  IBearerCredential,
  ISecretLoginCredential,
} from './auth/ICredentials';
