/**
 * DDL-source ADT operation parameter interfaces (snake_case, low-level).
 * Cover the generic DDL-source endpoint (`/sap/bc/adt/ddic/ddl/sources/`):
 * CDS views, AMDP table functions, and other DDL sources.
 */

export interface ICreateDdlParams {
  ddl_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  ddl_source?: string;
  master_system?: string;
  responsible?: string;
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

export interface IDeleteDdlParams {
  ddl_name: string;
  transport_request?: string;
}
