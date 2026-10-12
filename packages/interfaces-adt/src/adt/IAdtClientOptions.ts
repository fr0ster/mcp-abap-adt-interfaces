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
  /**
   * Read at each request: a signal, or a function answering the signal for the
   * request being sent.
   *
   * Handed to the connection as the request's own signal
   * (`IAbapRequestOptions.signal`): once it aborts, nothing more of that
   * request is sent. A function lets one client serve several callers, each
   * request carrying its caller's signal. A release that undoes a step (an
   * unlock after a lock) is sent without it.
   */
  signal?: AbortSignal | (() => AbortSignal | undefined) | undefined;
}
