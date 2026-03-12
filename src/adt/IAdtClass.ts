/**
 * Class ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateClassParams {
  class_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
  superclass?: string;
  final?: boolean;
  abstract?: boolean;
  create_protected?: boolean;
  template_xml?: string;
}

export interface IReadClassParams {
  class_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateClassParams {
  class_name: string;
  description?: string;
  transport_request?: string;
  master_system?: string;
  responsible?: string;
  superclass?: string;
  final?: boolean;
  abstract?: boolean;
}

export interface IDeleteClassParams {
  class_name: string;
  transport_request?: string;
}
