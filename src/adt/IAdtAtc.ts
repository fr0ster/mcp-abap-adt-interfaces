/**
 * ATC (ABAP Test Cockpit) ADT operation parameter interfaces (snake_case, low-level)
 */

export type AtcObjectType =
  | 'class'
  | 'interface'
  | 'program'
  | 'function_group'
  | 'include'
  | 'package';

export type AtcFindingsFormat = 'xml' | 'checkstyle';

export interface IRunAtcParams {
  object_name: string;
  object_type: AtcObjectType;
  check_variant?: string;
  max_findings?: number;
}

export interface IGetAtcRunStatusParams {
  run_id: string;
  with_long_polling?: boolean;
}

export interface IGetAtcFindingsParams {
  worklist_id: string;
  format?: AtcFindingsFormat;
  include_exempted_findings?: boolean;
}

export interface IListAtcCheckVariantsParams {
  max_item_count?: number;
  name_pattern?: string;
}
