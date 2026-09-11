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

export interface ICreateTableTypeParams {
  tabletype_name: string;
  package_name: string;
  description?: string;
  transport_request?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface IUpdateTableTypeParams {
  tabletype_name: string;
  description?: string;
  row_type_name: string;
  row_type_kind?:
    | 'dictionaryType'
    | 'predefinedAbapType'
    | 'refToPredefinedAbapType'
    | 'refToDictionaryType'
    | 'refToClassOrInterfaceType'
    | 'rangeTypeOnPredefinedType'
    | 'rangeTypeOnDataelement';
  access_type?: 'standard' | 'sorted' | 'hashed' | 'index' | 'notSpecified';
  primary_key_definition?:
    | 'standard'
    | 'rowType'
    | 'keyComponents'
    | 'empty'
    | 'notSpecified';
  primary_key_kind?: 'unique' | 'nonUnique' | 'notSpecified';
  transport_request?: string;
  activate?: boolean;
}

export interface IDeleteTableTypeParams {
  tabletype_name: string;
  transport_request?: string;
}

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface ITableTypeConfig {
  /**
   * The complete document to write, when this config is used for an update.
   *
   * **An update is a write, not a read-modify-write.** Until 19.0.0 of
   * `adt-clients` the five DDIC-shaped updates fetched the current document,
   * patched the fields named here into it, and PUT the result — two requests in
   * one member, and a merge whose rules nobody outside could change. They no
   * longer do: a caller reads the document with the member that reads it, edits
   * it, and passes it here.
   *
   * So the fields beside this one describe a *create*. On an update they are not
   * sent, and a field left out of `document` is not preserved — there is nothing
   * to preserve it from, because nothing was read.
   *
   * Optional because the same config creates, where there is no document yet.
   */
  document?: string;

  tableTypeName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  // XML-based TableType parameters (TableType is XML-based entity like Domain/DataElement)
  rowTypeName?: string; // Structure name for dictionaryType (required for update)
  rowTypeKind?:
    | 'dictionaryType'
    | 'predefinedAbapType'
    | 'refToPredefinedAbapType'
    | 'refToDictionaryType'
    | 'refToClassOrInterfaceType'
    | 'rangeTypeOnPredefinedType'
    | 'rangeTypeOnDataelement';
  accessType?: 'standard' | 'sorted' | 'hashed' | 'index' | 'notSpecified';
  primaryKeyDefinition?:
    | 'standard'
    | 'rowType'
    | 'keyComponents'
    | 'empty'
    | 'notSpecified';
  primaryKeyKind?: 'unique' | 'nonUnique' | 'notSpecified';
  description?: string; // Required for create/validate operations, optional for others
}
