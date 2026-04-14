/**
 * Service Binding ADT operation parameter interfaces (snake_case, low-level)
 */

export type ServiceBindingType = 'ODATA' | 'INA' | 'SQL';
export type ServiceBindingVersion = 'V2' | 'V4' | '0001' | '0000' | string;
export type GeneratedServiceType = 'odatav2' | 'odatav4';
export type DesiredPublicationState = 'published' | 'unpublished' | 'unchanged';

export type ServiceBindingVariant =
  | 'ODATA_V2_UI'
  | 'ODATA_V2_WEB_API'
  | 'ODATA_V4_UI'
  | 'ODATA_V4_WEB_API';
// Future: INA_UI, SQL_WEB_API — see fr0ster/mcp-abap-adt-clients#18

export const SERVICE_BINDING_VARIANT_MAP: Record<
  ServiceBindingVariant,
  {
    bindingType: ServiceBindingType;
    bindingVersion: ServiceBindingVersion;
    bindingCategory: '0' | '1';
    serviceType: GeneratedServiceType;
  }
> = {
  ODATA_V2_UI: {
    bindingType: 'ODATA',
    bindingVersion: 'V2',
    bindingCategory: '0',
    serviceType: 'odatav2',
  },
  ODATA_V2_WEB_API: {
    bindingType: 'ODATA',
    bindingVersion: 'V2',
    bindingCategory: '1',
    serviceType: 'odatav2',
  },
  ODATA_V4_UI: {
    bindingType: 'ODATA',
    bindingVersion: 'V4',
    bindingCategory: '0',
    serviceType: 'odatav4',
  },
  ODATA_V4_WEB_API: {
    bindingType: 'ODATA',
    bindingVersion: 'V4',
    bindingCategory: '1',
    serviceType: 'odatav4',
  },
};

export interface ICreateServiceBindingParams {
  binding_name: string;
  package_name: string;
  description: string;
  service_definition_name: string;
  service_name: string;
  service_version: string;
  binding_variant: ServiceBindingVariant;
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
