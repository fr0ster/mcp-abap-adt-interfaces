/**
 * AuthorizationField (SUSO / AUTH) ADT operation parameter interfaces (low-level)
 */

import type { IResultStrategy } from './IAdtResponse';

export interface IAuthorizationFieldConfig {
  authorizationFieldName: string;
  packageName?: string | undefined;
  description?: string | undefined;
  transportRequest?: string | undefined;
  masterSystem?: string | undefined;
  responsible?: string | undefined;

  fieldName?: string | undefined;
  rollName?: string | undefined;
  checkTable?: string | undefined;
  exitFb?: string | undefined;
  abapLanguageVersion?: string | undefined;
  search?: string | undefined;
  objexit?: string | undefined;
  domname?: string | undefined;
  outputlen?: string | undefined;
  convexit?: string | undefined;
  orglvlinfo?: string | undefined;
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
