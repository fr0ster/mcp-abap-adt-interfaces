/**
 * Service Definition ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateServiceDefinitionParams {
  service_definition_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  source_code?: string;
  master_system?: string;
  responsible?: string;
}

export interface IReadServiceDefinitionParams {
  service_definition_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateServiceDefinitionParams {
  service_definition_name: string;
  source_code: string;
  transport_request?: string;
}

export interface IDeleteServiceDefinitionParams {
  service_definition_name: string;
  transport_request?: string;
}
