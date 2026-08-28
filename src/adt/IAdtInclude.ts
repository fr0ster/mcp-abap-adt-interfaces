/**
 * Standalone `PROG/I` include parameters — a resource of its own, not a program.
 *
 * Measured: an include answers with `include:abapInclude`, its own namespace,
 * `adtcore:type="PROG/I"` and `include:contextRefCount`; a program answers with
 * `program:abapProgram`, `program:programType` and `PROG/P`. The two
 * collections even accept different content types. Modelling an include as a
 * program would therefore build the wrong document and post it to the wrong
 * place, which is why these types exist rather than a flag on the program ones.
 *
 * Creation is a **modern on-prem** capability: only there does discovery give
 * the includes collection an `app:accept`, and a collection without one is not
 * a POST target. The types are the same everywhere; what varies is whether the
 * system will accept the request.
 */

import type { IAdtObjectState } from './IAdtObjectState';

export interface ICreateIncludeParams {
  includeName: string;
  description?: string;
  packageName: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
  sourceCode?: string;
  activate?: boolean;
  /**
   * The main program this include is edited in the context of.
   *
   * An include is not independently syntax-checkable — it is a fragment, and
   * what it compiles against is the program including it. `contextRefCount` on
   * a read include is how many such contexts the system knows about.
   */
  contextProgram?: string;
}

export interface IUpdateIncludeSourceParams {
  includeName: string;
  sourceCode: string;
  activate?: boolean;
}

export interface IDeleteIncludeParams {
  includeName: string;
  transportRequest?: string;
}

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IIncludeConfig {
  includeName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  sourceCode?: string;
  /** See {@link ICreateIncludeParams.contextProgram}. */
  contextProgram?: string;
  sessionId?: string;
  onLock?: (lockHandle: string) => void;
}

export interface IIncludeState extends IAdtObjectState {
  // All operation results are in IAdtObjectState:
  // validationResponse, createResult, lockHandle, updateResult, checkResult,
  // unlockResult, activateResult, deleteResult, readResult, transportResult, errors
}
