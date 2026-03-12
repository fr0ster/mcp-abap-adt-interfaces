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
  master_system?: string;
  responsible?: string;
  type_kind?: DataElementTypeKind;
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

export interface IReadDataElementParams {
  data_element_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateDataElementParams {
  data_element_name: string;
  description?: string;
  package_name?: string;
  transport_request?: string;
  type_kind?: DataElementTypeKind;
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

export interface IDeleteDataElementParams {
  data_element_name: string;
  transport_request?: string;
}
