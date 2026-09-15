/**
 * Service Definition ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateServiceDefinitionParams {
  service_definition_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
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

// Builder configuration (camelCase)
export interface IServiceDefinitionConfig {
  serviceDefinitionName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  sourceCode?: string; // Service definition source code (CDS service definition syntax)
}
