/**
 * Service Binding ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtAnalyseOptions, IAnalyse } from './IAdtObject';
import type { IAdtError, IAdtResponse } from './IAdtResponse';

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
}

/** Which service group to read: the binding, and the service it exposes. */
export interface IServiceGroupParams {
  /** The binding, as the URL addresses it. */
  objectname: string;
  /** Which protocol's service group to read. */
  serviceType: GeneratedServiceType;
  servicename?: string;
  serviceversion?: string;
  srvdname?: string;
}

type WithAnalyse<E extends IAdtError, O = unknown> = O &
  IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> };
type WithoutAnalyse<O = unknown> = O & IAdtAnalyseOptions;

/**
 * The binding types the system offers — a catalogue, not a binding: the same
 * answer whichever binding asks. Measured on premise and on the cloud
 * (2026-10-10): a `nameditem:namedItemList` of six entries.
 */
export interface IAdtServiceBindingTypes<TTypes> {
  getServiceBindingTypes<E extends IAdtError>(
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TTypes, E>>;
  getServiceBindingTypes(
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TTypes>>;
}

/**
 * The service group a binding publishes: its URL prefix, its services and
 * whether they are published. A read of that object — it is what is read
 * after a publication to learn its outcome, not a job and not a generation.
 * Measured on premise and on the cloud (2026-10-10).
 */
export interface IAdtServiceGroupReadable<TGroup> {
  getServiceGroup<E extends IAdtError>(
    params: IServiceGroupParams,
    options: WithAnalyse<E>,
  ): Promise<IAdtResponse<TGroup, E>>;
  getServiceGroup(
    params: IServiceGroupParams,
    options?: WithoutAnalyse,
  ): Promise<IAdtResponse<TGroup>>;
}
