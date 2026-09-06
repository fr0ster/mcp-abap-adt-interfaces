import type { ServiceBindingVariant } from '../adt/IAdtServiceBinding';

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

export type ICreateAndGenerateServiceBindingParams =
  ICreateServiceBindingParams;

// Backward compatibility alias
export type ICreateAndGenerateServiceBindingParamsLegacy =
  ICreateAndGenerateServiceBindingParams;

/*
 * `IServiceBindingResults` was here — the readings keyed for the aggregate that
 * has just gone. Nothing parameterises anything any more, so it named five
 * answers nobody asks for. A consumer's readings are their own, and the atoms
 * take them one at a time.
 */

/*
 * `IAdtServiceBinding` was here: a per-object aggregate declaring eight members.
 *
 * It is gone, and it is the last of its kind — no other object type ever had
 * one. It arrived in `bd5926f` with a one-line message and no reasoning, and
 * 31.0.0 did not reach it: that sweep took out result *shapes*, and a
 * method-bearing interface was not in its scope. So it was never kept on
 * purpose; it was never looked at.
 *
 * Four of its members no longer exist in any implementation —
 * `getODataV2ServiceBinding`, `getODataV4ServiceBinding`, `publishODataV2` and
 * `unpublishODataV2` — because a protocol is a parameter, not a method name.
 * The other four are a chain step exposed to callers, two operations glued into
 * one by an `And` in the name, and two members nothing calls.
 *
 * What a consumer needs to *call* a binding stayed: every parameter type above,
 * and the capability atoms, which compose. What an implementation hands back is
 * its own business, and a consumer names it structurally from the atoms.
 */
