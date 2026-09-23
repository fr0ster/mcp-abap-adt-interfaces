/**
 * Data Element ADT operation parameter interfaces (snake_case, low-level)
 */

export type DataElementTypeKind =
  | 'domain'
  | 'predefinedAbapType'
  | 'refToPredefinedAbapType'
  | 'refToDictionaryType'
  | 'refToClifType';

export interface ICreateDataElementParams {
  data_element_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IDataElementConfig {
  /**
   * **No `source` here, and that is the point.** This type's write takes its
   * body from `IAdtOperationOptions.source`, which is where the capability
   * atoms say a write's body goes. It used to be declared on this config as
   * well, with a comment telling the caller to pass the document "here" — two
   * channels, two sentences, and an implementation forced to guess. Nothing on
   * this type read it but the write: it has no `check` and no `validate` that
   * compiles a source the server does not hold yet, which is the one job a
   * `source` on a config still has.
   */

  dataElementName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  dataType?: string;
  length?: number;
  typeKind?:
    | 'domain'
    | 'predefinedAbapType'
    | 'refToPredefinedAbapType'
    | 'refToDictionaryType'
    | 'refToClifType';
}
