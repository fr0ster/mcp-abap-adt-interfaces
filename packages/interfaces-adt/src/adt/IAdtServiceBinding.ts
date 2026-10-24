/**
 * Service Binding ADT operation parameter interfaces (snake_case, low-level)
 */

import type { IAdtAnalyseOptions, IAnalyse } from './IAdtObject';
import type { IAdtError, IAdtResponse, IResultStrategy } from './IAdtResponse';

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

/**
 * One strategy per member of a service binding implementation.
 *
 * A record rather than fourteen positional type parameters — the fourteenth
 * would be unnameable without spelling the thirteen before it, and a consumer
 * overriding one reading writes the key. `IServiceBindingResults` in the
 * contract names five of these; the rest belong to the capability atoms.
 */
export interface IServiceResults {
  /** What the create answers: the binding's own document. */
  readonly created: IResultStrategy<unknown>;
  /** What a read answers: the binding document, active or inactive. */
  readonly source: IResultStrategy<unknown>;
  /** The same document, read as metadata — a binding has no second resource. */
  readonly metadata: IResultStrategy<unknown>;
  /** What a check run answers: `chkl:messages`, whose `E` entries are the verdict. */
  readonly check: IResultStrategy<unknown>;
  /** What activation answers. */
  readonly activation: IResultStrategy<unknown>;
  /** What the pre-create transport check answers. */
  readonly validation: IResultStrategy<unknown>;
  /** What the deletion answers. */
  readonly deletion: IResultStrategy<unknown>;
  /** What a deletion check answers: `del:checkResponse`. */
  readonly deletionCheck: IResultStrategy<unknown>;
  /** What a publication change answers. */
  readonly updated: IResultStrategy<unknown>;
  /** What the transport check answers. */
  readonly transport: IResultStrategy<unknown>;
  /** The binding types this system offers. */
  readonly bindingTypes: IResultStrategy<unknown>;
  /** What generating the service answers. */
  /** What an OData v2 or v4 read of the binding answers. */
  readonly odata: IResultStrategy<unknown>;
  /** What publishing or withdrawing answers. */
  readonly publication: IResultStrategy<unknown>;
  /** What classifying the binding answers. */
}

/**
 * What a caller must name to change a binding's publication, **in the signature
 * they call**.
 *
 * `Partial<IServiceBindingConfig>` is what `IAdtUpdatable` gives every other
 * type, and for a binding it is too loose in two ways a compiler could catch:
 * `serviceType` is optional there, and `desiredPublicationState` still admits
 * `'unchanged'`. Both compiled and then threw before reaching the wire, which
 * is a demand made where the caller cannot see it.
 */
export type IServiceBindingPublicationConfig =
  Partial<IServiceBindingConfig> & {
    /** Which binding. Without it there is no object to publish. */
    bindingName: string;
    /** `unchanged` is not one of them: there is no request that changes nothing. */
    desiredPublicationState: 'published' | 'unpublished';
    /** Selects the endpoint, `odatav2` or `odatav4`. */
    serviceType: GeneratedServiceType;
  };
