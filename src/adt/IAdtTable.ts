/**
 * Table ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateTableParams {
  table_name: string;
  package_name: string;
  transport_request?: string;
  ddl_code?: string;
  master_system?: string;
  responsible?: string;
}

export interface IReadTableParams {
  table_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateTableParams {
  table_name: string;
  ddl_code: string;
  transport_request?: string;
}

export interface IDeleteTableParams {
  table_name: string;
  transport_request?: string;
}
