/**
 * AuthorizationField (SUSO / AUTH) ADT operation parameter interfaces (low-level)
 */

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
