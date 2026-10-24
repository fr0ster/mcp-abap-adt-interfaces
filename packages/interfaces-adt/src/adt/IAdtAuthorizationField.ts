/**
 * AuthorizationField (SUSO / AUTH) ADT operation parameter interfaces (low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

export interface IAuthorizationFieldConfig {
  authorizationFieldName: string;
  packageName?: string;
  description?: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;

  fieldName?: string;
  rollName?: string;
  checkTable?: string;
  exitFb?: string;
  abapLanguageVersion?: string;
  search?: string;
  objexit?: string;
  domname?: string;
  outputlen?: string;
  convexit?: string;
  orglvlinfo?: string;
}

/** One strategy per member of a authorizationField implementation. See `IClassResults`. */
export interface IAuthorizationFieldResults {
  readonly created: IResultStrategy<unknown>;
  readonly source: IResultStrategy<unknown>;
  readonly metadata: IResultStrategy<unknown>;
  readonly check: IResultStrategy<unknown>;
  readonly activation: IResultStrategy<unknown>;
  readonly validation: IResultStrategy<unknown>;
  readonly deletion: IResultStrategy<unknown>;
  readonly metadataUpdated: IResultStrategy<unknown>;
  /** What a deletion check answers: `del:checkResponse`. */
  readonly deletionCheck: IResultStrategy<unknown>;
}
