import type {
  IAdtActivatable,
  IAdtCheckable,
  IAdtCreatable,
  IAdtDeletable,
  IAdtReadable,
  IAdtTransportAware,
  IAdtUpdatable,
  IAdtValidatable,
} from '../adt/IAdtCapabilities';
import type { IAdtResponse } from '../adt/IAdtResponse';
import type {
  IDeleteServiceBindingParams,
  IServiceBindingConfig,
  ServiceBindingVariant,
} from '../adt/IAdtServiceBinding';
import type { IAdtWireResponse } from '../connection/IAbapConnection';

export type ServiceBindingType = 'ODATA' | 'INA' | 'SQL';
export type ServiceBindingVersion = 'V2' | 'V4' | '0001' | '0000' | string;
export type GeneratedServiceType = 'odatav2' | 'odatav4';
export type DesiredPublicationState = 'published' | 'unpublished' | 'unchanged';

export interface IValidateServiceBindingParams {
  objname: string;
  serviceDefinition: string;
  serviceBindingVersion?: string;
  description?: string;
  package?: string;
}

export interface IGetServiceBindingODataParams {
  objectname: string;
  servicename?: string;
  serviceversion?: string;
  srvdname?: string;
}

export interface IPublishODataV2Params {
  servicename: string;
  serviceversion?: string;
}

export interface IUnpublishODataV2Params {
  servicename: string;
  serviceversion?: string;
}

export interface IClassifyServiceBindingParams {
  objectname: string;
  bindtype?: string;
  bindtypeversion?: string;
  repositoryid?: string;
  servicename?: string;
  serviceversion?: string;
}

export interface ITransportCheckServiceBindingParams {
  objectName: string;
  packageName: string;
  description?: string;
  operation?: 'I' | 'U' | 'D';
}

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

export interface ICheckServiceBindingParams {
  bindingName: string;
  version?: 'active' | 'inactive';
}

export interface IActivateServiceBindingParams {
  bindingName: string;
  preauditRequested?: boolean;
}

export interface IGenerateServiceBindingParams {
  serviceType: GeneratedServiceType;
  bindingName: string;
  serviceName: string;
  serviceVersion: string;
  serviceDefinitionName: string;
}

export interface ICreateAndGenerateServiceBindingParams
  extends ICreateServiceBindingParams {}

// Backward compatibility alias
export type ICreateAndGenerateServiceBindingParamsLegacy =
  ICreateAndGenerateServiceBindingParams;

/**
 * A service binding, and what ADT gives one.
 *
 * Until 17.0.0 it extended the wide composite, the full set, and so promised
 * version history and a lock. It has neither: the handler's `getVersions`,
 * `getVersionSource`, `lock` and `unlock` all threw, and `getService()` hands
 * out the same object, so it promised them twice over. The atoms below are what
 * remains, plus the binding's own operations — generating, publishing and
 * classifying a service.
 */
/**
 * One key per distinct answer this contract has, not one per member.
 *
 * Five separate type parameters would make the fourth unnameable without
 * spelling the first three; a record names them, and a consumer overriding one
 * reading writes the key rather than counting positions.
 */
export interface IServiceBindingResults {
  bindingTypes: unknown;
  generation: unknown;
  odata: unknown;
  publication: unknown;
  classification: unknown;
}

/** The shipped default: every answer is the document as it arrived. */
export interface IServiceBindingDocuments extends IServiceBindingResults {
  bindingTypes: string;
  generation: string;
  odata: string;
  publication: string;
  classification: string;
}

/**
 * A service binding.
 *
 * **The eight duplicates are gone.** Until 30.0.0 this interface extended the
 * capability atoms *and* declared `createServiceBinding`, `readServiceBinding`,
 * `updateServiceBinding`, `deleteServiceBinding`, `checkServiceBinding`,
 * `activateServiceBinding`, `validateServiceBinding` and
 * `transportCheckServiceBinding` beside them — the same operations on the same
 * endpoints, twice, distinguished only by the second set answering the transport
 * envelope. That is decision 16 exactly, and it is why nothing could reach those
 * endpoints with a reading of its own: `create` and `createServiceBinding` were
 * one request under two names. The atoms are the survivors.
 *
 * What remains below has no atom, because nothing else does it: the type
 * catalogue, generation, the OData readings, publication and classification.
 */
export interface IAdtServiceBinding<
  R extends IServiceBindingResults = IServiceBindingDocuments,
> {
  /** The binding types this system offers. */
  getServiceBindingTypes(): Promise<IAdtResponse<R['bindingTypes']>>;

  /** Generate the service the binding exposes. */
  generateServiceBinding(
    params: IGenerateServiceBindingParams,
  ): Promise<IAdtResponse<R['generation']>>;

  /**
   * Create the binding and generate its service.
   *
   * A chain rather than a second reading, which is why it survives decision 16 —
   * and it answers **one** value. Until 30.0.0 it handed back six envelopes, one
   * per request it had made along the way; what an implementation does on the
   * way to an answer is its own business, and reaches a caller only if it fails.
   */
  createAndGenerateServiceBinding(
    params: ICreateAndGenerateServiceBindingParams,
  ): Promise<IAdtResponse<R['generation']>>;

  /** The binding read as OData v2. */
  getODataV2ServiceBinding(
    params: IGetServiceBindingODataParams,
  ): Promise<IAdtResponse<R['odata']>>;

  /** The binding read as OData v4. */
  getODataV4ServiceBinding(
    params: IGetServiceBindingODataParams,
  ): Promise<IAdtResponse<R['odata']>>;

  /** Publish an OData v2 binding. */
  publishODataV2(
    params: IPublishODataV2Params,
  ): Promise<IAdtResponse<R['publication']>>;

  /** Withdraw a published OData v2 binding. */
  unpublishODataV2(
    params: IUnpublishODataV2Params,
  ): Promise<IAdtResponse<R['publication']>>;

  /** Classify the binding. */
  classifyServiceBinding(
    params: IClassifyServiceBindingParams,
  ): Promise<IAdtResponse<R['classification']>>;
}
