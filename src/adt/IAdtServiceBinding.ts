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
  bindingName: string;
  packageName: string;
  description: string;
  serviceDefinitionName: string;
  serviceName: string;
  serviceVersion: string;
  bindingVariant: ServiceBindingVariant;
  masterLanguage?: string;
  masterSystem?: string;
  responsible?: string;
  transportRequest?: string;
  runTransportCheck?: boolean;
  activateAfterCreate?: boolean;
}

export interface IReadServiceBindingParams {
  bindingName: string;
  version?: 'active' | 'inactive';
}

export interface IUpdateServiceBindingParams {
  bindingName: string;
  desiredPublicationState: DesiredPublicationState;
  serviceType: GeneratedServiceType;
  serviceName: string;
  serviceVersion?: string;
}

export interface IDeleteServiceBindingParams {
  bindingName: string;
  transportRequest?: string;
}

export interface IServiceBindingConfig {
  bindingName: string;
  packageName?: string;
  description?: string;
  serviceDefinitionName?: string;
  serviceName?: string;
  serviceVersion?: string;
  bindingVariant?: ServiceBindingVariant;
  masterLanguage?: string;
  masterSystem?: string;
  responsible?: string;
  desiredPublicationState?: DesiredPublicationState;
  serviceType?: GeneratedServiceType;
  transportRequest?: string;
  runTransportCheck?: boolean;
}
