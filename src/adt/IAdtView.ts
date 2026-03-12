/**
 * CDS View ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateViewParams {
  view_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  ddl_source?: string;
  master_system?: string;
  responsible?: string;
}

export interface IReadViewParams {
  view_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateViewParams {
  view_name: string;
  ddl_source: string;
  transport_request?: string;
  lock_handle?: string;
}

export interface IDeleteViewParams {
  view_name: string;
  transport_request?: string;
}
