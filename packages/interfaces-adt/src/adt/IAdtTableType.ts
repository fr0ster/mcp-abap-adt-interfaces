/**
 * Table Type ADT operation parameter interfaces (snake_case, low-level)
 */

export type TableTypeRowKind =
  | 'dictionaryType'
  | 'predefinedAbapType'
  | 'refToPredefinedAbapType'
  | 'refToDictionaryType'
  | 'refToClassOrInterfaceType'
  | 'rangeTypeOnPredefinedType'
  | 'rangeTypeOnDataelement';

export type TableTypeAccessType =
  | 'standard'
  | 'sorted'
  | 'hashed'
  | 'index'
  | 'notSpecified';

export type TableTypePrimaryKeyDefinition =
  | 'standard'
  | 'rowType'
  | 'keyComponents'
  | 'empty'
  | 'notSpecified';

export type TableTypePrimaryKeyKind = 'unique' | 'nonUnique' | 'notSpecified';

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface ITableTypeConfig {
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

  tableTypeName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  // XML-based TableType parameters (TableType is XML-based entity like Domain/DataElement)
  rowTypeName?: string; // Structure name for dictionaryType (required for update)
  description?: string; // Required for create/validate operations, optional for others
}
