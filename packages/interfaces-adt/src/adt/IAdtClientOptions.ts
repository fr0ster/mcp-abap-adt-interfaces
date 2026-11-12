/**
 * How a consumer configures an ADT client.
 *
 * Here rather than in adt-clients because configuring the client is the first
 * thing a consumer does, and it should not require importing the implementation
 * package to describe.
 */

import type { IAdtContentTypes } from './IAdtContentTypes';

export interface IAdtSystemContext {
  masterSystem?: string | undefined;
  responsible?: string | undefined;
  /** Master/original language for newly created objects (adtcore:masterLanguage). Sourced from SAP_LANGUAGE; when unset, none is sent and SAP takes its logon language. */
  masterLanguage?: string | undefined;
}

/**
 * `enableAcceptCorrection` was here until 20.0.0. A member whose request sets
 * both headers takes them with the call (`headers: IAdtHeaders`); correcting a
 * format the server refused is the consumer's own.
 */
export interface IAdtClientOptions {
  masterSystem?: string | undefined;
  responsible?: string | undefined;
  /** Master/original language for newly created objects. When unset, none is sent and SAP takes the request's logon language. */
  masterLanguage?: string | undefined;
  contentTypes?: IAdtContentTypes | undefined;
  /** Whether the SAP system uses Unicode encoding. Affects Content-Type headers for source code operations. */
  unicode?: boolean | undefined;
}
