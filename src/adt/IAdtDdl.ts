/**
 * DDL-source ADT operation parameter interfaces (snake_case, low-level).
 * Cover the generic DDL-source endpoint (`/sap/bc/adt/ddic/ddl/sources/`):
 * CDS views, AMDP table functions, and other DDL sources.
 */

export interface ICreateDdlParams {
  ddl_name: string;
  ddl_source?: string;
  package_name: string;
  transport_request?: string;
  description?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface IReadDdlParams {
  ddl_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateDdlParams {
  ddl_name: string;
  ddl_source: string;
  transport_request?: string;
  lock_handle?: string;
}

export interface IUpdateDdlSourceParams {
  ddl_name: string;
  ddl_source: string;
  activate?: boolean;
  lock_handle?: string;
  transport_request?: string;
}

export interface IDeleteDdlParams {
  ddl_name: string;
  transport_request?: string;
}
