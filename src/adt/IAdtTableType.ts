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
  master_system?: string;
  responsible?: string;
}

export interface IReadTableTypeParams {
  tabletype_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateTableTypeParams {
  tabletype_name: string;
  description?: string;
  row_type_name: string;
  row_type_kind?: TableTypeRowKind;
  access_type?: TableTypeAccessType;
  primary_key_definition?: TableTypePrimaryKeyDefinition;
  primary_key_kind?: TableTypePrimaryKeyKind;
  transport_request?: string;
}

export interface IDeleteTableTypeParams {
  tabletype_name: string;
  transport_request?: string;
}
