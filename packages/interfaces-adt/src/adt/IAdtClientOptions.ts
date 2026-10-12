/**
 * How a consumer configures an ADT client.
 *
 * Here rather than in adt-clients because configuring the client is the first
 * thing a consumer does, and it should not require importing the implementation
 * package to describe.
 */

import type { IAdtContentTypes } from './IAdtContentTypes';

export interface IAdtSystemContext {
  masterSystem?: string;
  responsible?: string;
  /** Master/original language for newly created objects (adtcore:masterLanguage). Sourced from SAP_LANGUAGE; defaults to EN when unset. */
  masterLanguage?: string;
}

export interface IAdtClientOptions {
  enableAcceptCorrection?: boolean;
  masterSystem?: string;
  responsible?: string;
  /** Master/original language for newly created objects. Falls back to EN when unset. */
  masterLanguage?: string;
  contentTypes?: IAdtContentTypes;
  /** Whether the SAP system uses Unicode encoding. Affects Content-Type headers for source code operations. */
  unicode?: boolean;
}
