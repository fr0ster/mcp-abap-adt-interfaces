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
  type_kind?:
    | 'domain'
    | 'predefinedAbapType'
    | 'refToPredefinedAbapType'
    | 'refToDictionaryType'
    | 'refToClifType';
  type_name?: string;
  data_type?: string;
  length?: number;
  decimals?: number;
  short_label?: string;
  medium_label?: string;
  long_label?: string;
  heading_label?: string;
  search_help?: string;
  search_help_parameter?: string;
  set_get_parameter?: string;
  default_component_name?: string;
  deactivate_input_history?: boolean;
  change_document?: boolean;
  left_to_right_direction?: boolean;
  deactivate_bidi_filtering?: boolean;
}

export interface IUpdateDataElementParams {
  data_element_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  type_kind?:
    | 'domain'
    | 'predefinedAbapType'
    | 'refToPredefinedAbapType'
    | 'refToDictionaryType'
    | 'refToClifType';
  type_name?: string;
  data_type?: string;
  length?: number;
  decimals?: number;
  short_label?: string;
  medium_label?: string;
  long_label?: string;
  heading_label?: string;
  search_help?: string;
  search_help_parameter?: string;
  set_get_parameter?: string;
  default_component_name?: string;
  deactivate_input_history?: boolean;
  change_document?: boolean;
  left_to_right_direction?: boolean;
  deactivate_bidi_filtering?: boolean;
  activate?: boolean;
}

export interface IDeleteDataElementParams {
  data_element_name: string;
  transport_request?: string;
}

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IDataElementConfig {
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

  dataElementName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  dataType?: string;
  length?: number;
  decimals?: number;
  shortLabel?: string;
  mediumLabel?: string;
  longLabel?: string;
  headingLabel?: string;
  typeKind?:
    | 'domain'
    | 'predefinedAbapType'
    | 'refToPredefinedAbapType'
    | 'refToDictionaryType'
    | 'refToClifType';
  typeName?: string;
  searchHelp?: string;
  searchHelpParameter?: string;
  setGetParameter?: string;
}
