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
import type { IAdtOperationOptions } from '../adt/IAdtObject';
import type {
  IDeleteServiceBindingParams,
  IServiceBindingConfig,
  IServiceBindingState,
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
 * Until this release it extended `IAdtObject`, the full set, and so promised
 * version history and a lock. It has neither: the handler's `getVersions`,
 * `getVersionSource`, `lock` and `unlock` all threw, and `getService()` hands
 * out the same object, so it promised them twice over. The atoms below are what
 * remains, plus the binding's own operations — generating, publishing and
 * classifying a service.
 */
export interface IAdtServiceBinding
  extends IAdtCreatable<IServiceBindingConfig, void>,
    IAdtReadable<IServiceBindingConfig, string, string>,
    IAdtUpdatable<IServiceBindingConfig, void>,
    IAdtDeletable<IServiceBindingConfig, void>,
    IAdtValidatable<IServiceBindingConfig, IServiceBindingState>,
    IAdtCheckable<IServiceBindingConfig, IServiceBindingState>,
    IAdtActivatable<IServiceBindingConfig, IServiceBindingState>,
    IAdtTransportAware<IServiceBindingConfig, IServiceBindingState> {
  getServiceBindingTypes(): Promise<IAdtWireResponse>;
  validateServiceBinding(
    params: IValidateServiceBindingParams,
  ): Promise<IAdtWireResponse>;
  transportCheckServiceBinding(
    params: ITransportCheckServiceBindingParams,
  ): Promise<IAdtWireResponse>;
  createServiceBinding(
    params: ICreateServiceBindingParams,
  ): Promise<IAdtWireResponse>;
  readServiceBinding(
    params: IReadServiceBindingParams,
  ): Promise<IAdtWireResponse>;
  updateServiceBinding(
    params: IUpdateServiceBindingParams,
  ): Promise<IAdtWireResponse>;
  checkServiceBinding(
    params: ICheckServiceBindingParams,
  ): Promise<IAdtWireResponse>;
  activateServiceBinding(
    params: IActivateServiceBindingParams,
  ): Promise<IAdtWireResponse>;
  deleteServiceBinding(
    params: IDeleteServiceBindingParams,
  ): Promise<IAdtWireResponse>;
  generateServiceBinding(
    params: IGenerateServiceBindingParams,
  ): Promise<IAdtWireResponse>;
  createAndGenerateServiceBinding(
    params: ICreateAndGenerateServiceBindingParams,
  ): Promise<{
    createResult: IAdtWireResponse;
    inactiveCheckResult: IAdtWireResponse;
    activationResult?: IAdtWireResponse;
    readResult: IAdtWireResponse;
    generatedInfoResult: IAdtWireResponse;
    activeCheckResult?: IAdtWireResponse;
  }>;
  getODataV2ServiceBinding(
    params: IGetServiceBindingODataParams,
  ): Promise<IAdtWireResponse>;
  getODataV4ServiceBinding(
    params: IGetServiceBindingODataParams,
  ): Promise<IAdtWireResponse>;
  publishODataV2(params: IPublishODataV2Params): Promise<IAdtWireResponse>;
  unpublishODataV2(params: IUnpublishODataV2Params): Promise<IAdtWireResponse>;
  classifyServiceBinding(
    params: IClassifyServiceBindingParams,
  ): Promise<IAdtWireResponse>;
}

/**
 * The same lie in a second place, until this release: this was `IAdtObject` over the
 * binding's config, so a consumer naming it got version history and a lock that
 * do not exist. It now points at {@link IAdtServiceBinding}.
 *
 * It is an alias, and this package has three of them here. Whether they stay is
 * a separate decision from making them true, which is what this release does.
 */
export type AdtServiceBindingType = IAdtServiceBinding;

// Backward compatibility aliases
export type IAdtService = IAdtServiceBinding;
export type IAdtServiceOperationOptions = IAdtOperationOptions;
