/**
 * Service Binding ADT operation parameter interfaces (snake_case, low-level)
 */

export type ServiceBindingType = 'ODATA' | 'INA' | 'SQL';
export type ServiceBindingVersion = 'V2' | 'V4' | '0001' | '0000' | string;
export type GeneratedServiceType = 'odatav2' | 'odatav4';
export type DesiredPublicationState = 'published' | 'unpublished' | 'unchanged';

export interface ICreateServiceBindingParams {
  binding_name: string;
  package_name: string;
  description: string;
  service_definition_name: string;
  service_name: string;
  service_version: string;
  binding_type: ServiceBindingType;
  binding_version: ServiceBindingVersion;
  binding_category?: '0' | '1' | string;
  master_language?: string;
  master_system?: string;
  responsible?: string;
  transport_request?: string;
}

export interface IReadServiceBindingParams {
  binding_name: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateServiceBindingParams {
  binding_name: string;
  desired_publication_state: DesiredPublicationState;
  service_type: GeneratedServiceType;
  service_name: string;
  service_version?: string;
}

export interface IDeleteServiceBindingParams {
  binding_name: string;
  transport_request?: string;
}
