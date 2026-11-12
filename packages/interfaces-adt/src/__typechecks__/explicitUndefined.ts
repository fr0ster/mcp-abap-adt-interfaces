// Compile-only assertions. If these stop compiling, the types regressed.
//
// **An optional field takes `undefined`** (27.4.0). Under
// `exactOptionalPropertyTypes` a field declared `name?: T` refuses an explicit
// `undefined`, so a caller holding a possibly absent value had to leave the key
// out by hand; to these contracts an absent field and an `undefined` one mean
// the same. Each field below is declared `?: T | undefined`, and each block
// passes `undefined` to every optional field of one type: a field narrowed back
// to `?: T` stops compiling here.

import type { IAccessControlConfig } from '../adt/IAdtAccessControl';
import type { IAppendStructureConfig } from '../adt/IAdtAppendStructure';
import type { IAuthorizationFieldConfig } from '../adt/IAdtAuthorizationField';
import type { IBehaviorDefinitionConfig } from '../adt/IAdtBehaviorDefinition';
import type { IBehaviorImplementationConfig } from '../adt/IAdtBehaviorImplementation';
import type {
  IClassConfig,
  ILocalDefinitionsConfig,
  ILocalMacrosConfig,
  ILocalTestClassConfig,
  ILocalTypesConfig,
} from '../adt/IAdtClass';
import type {
  IAdtClientOptions,
  IAdtSystemContext,
} from '../adt/IAdtClientOptions';
import type { IDataElementConfig } from '../adt/IAdtDataElement';
import type { IDdlConfig } from '../adt/IAdtDdl';
import type { IDomainConfig } from '../adt/IAdtDomain';
import type { IEnhancementConfig } from '../adt/IAdtEnhancement';
import type { IFeatureToggleConfig } from '../adt/IAdtFeatureToggle';
import type { IFunctionGroupConfig } from '../adt/IAdtFunctionGroup';
import type { IFunctionIncludeConfig } from '../adt/IAdtFunctionInclude';
import type { IFunctionModuleConfig } from '../adt/IAdtFunctionModule';
import type { IIncludeConfig } from '../adt/IAdtInclude';
import type { IInterfaceConfig } from '../adt/IAdtInterface';
import type {
  IMessageClassConfig,
  IMessageClassMessageConfig,
} from '../adt/IAdtMessageClass';
import type { IMetadataExtensionConfig } from '../adt/IAdtMetadataExtension';
import type { IAdtOperationOptions, IAnalyse } from '../adt/IAdtObject';
import type { IAdtObjectConfig } from '../adt/IAdtObjectState';
import type { IPackageConfig } from '../adt/IAdtPackage';
import type { IProgramConfig } from '../adt/IAdtProgram';
import type { IAdtError } from '../adt/IAdtResponse';

import type { IScalarFunctionConfig } from '../adt/IAdtScalarFunction';
import type { IScalarFunctionImplementationConfig } from '../adt/IAdtScalarFunctionImplementation';
import type { IServiceBindingConfig } from '../adt/IAdtServiceBinding';
import type { IServiceDefinitionConfig } from '../adt/IAdtServiceDefinition';
import type { IGetVirtualFoldersContentsParams } from '../adt/IAdtShared';
import type { IStructureConfig } from '../adt/IAdtStructure';
import type { ITableConfig } from '../adt/IAdtTable';
import type { ITableTypeConfig } from '../adt/IAdtTableType';
import type { ITransformationConfig } from '../adt/IAdtTransformation';
import type { ITransportConfig } from '../adt/IAdtTransport';
import type {
  ICdsUnitTestConfig,
  IClassUnitTestRunOptions,
  IUnitTestConfig,
  IUnitTestResultOptions,
  IUnitTestScope,
} from '../adt/IAdtUnitTest';
import type { IAdtGroupLifecycle } from '../adt/IAdtUtilities';
import type { IFeedQueryOptions } from '../feeds/types';
import type { IDebuggerIdentity } from '../runtime/IAbapDebugger';
import type {
  IProfilerTraceDbAccessesOptions,
  IProfilerTraceHitListOptions,
  IProfilerTraceStatementsOptions,
} from '../runtime/IProfiler';

const _IAccessControlConfig: Pick<
  IAccessControlConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'source'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  source: undefined,
};
void _IAccessControlConfig;
const _IAppendStructureConfig: Pick<
  IAppendStructureConfig,
  | 'baseObject'
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'source'
> = {
  baseObject: undefined,
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  source: undefined,
};
void _IAppendStructureConfig;
const _IAuthorizationFieldConfig: Pick<
  IAuthorizationFieldConfig,
  | 'packageName'
  | 'description'
  | 'transportRequest'
  | 'masterSystem'
  | 'responsible'
  | 'fieldName'
  | 'rollName'
  | 'checkTable'
  | 'exitFb'
  | 'abapLanguageVersion'
  | 'search'
  | 'objexit'
  | 'domname'
  | 'outputlen'
  | 'convexit'
  | 'orglvlinfo'
> = {
  packageName: undefined,
  description: undefined,
  transportRequest: undefined,
  masterSystem: undefined,
  responsible: undefined,
  fieldName: undefined,
  rollName: undefined,
  checkTable: undefined,
  exitFb: undefined,
  abapLanguageVersion: undefined,
  search: undefined,
  objexit: undefined,
  domname: undefined,
  outputlen: undefined,
  convexit: undefined,
  orglvlinfo: undefined,
};
void _IAuthorizationFieldConfig;
const _IBehaviorDefinitionConfig: Pick<
  IBehaviorDefinitionConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'implementationType'
  | 'rootEntity'
  | 'source'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  implementationType: undefined,
  rootEntity: undefined,
  source: undefined,
};
void _IBehaviorDefinitionConfig;
const _IBehaviorImplementationConfig: Pick<
  IBehaviorImplementationConfig,
  | 'description'
  | 'packageName'
  | 'transportRequest'
  | 'source'
  | 'implementationCode'
  | 'masterSystem'
  | 'responsible'
> = {
  description: undefined,
  packageName: undefined,
  transportRequest: undefined,
  source: undefined,
  implementationCode: undefined,
  masterSystem: undefined,
  responsible: undefined,
};
void _IBehaviorImplementationConfig;
const _IClassConfig: Pick<
  IClassConfig,
  | 'masterLanguage'
  | 'description'
  | 'packageName'
  | 'transportRequest'
  | 'source'
  | 'testClassCode'
  | 'testClassName'
  | 'localTypesCode'
  | 'definitionsCode'
  | 'macrosCode'
  | 'superclass'
  | 'final'
  | 'createProtected'
  | 'masterSystem'
  | 'responsible'
  | 'classTemplate'
> = {
  masterLanguage: undefined,
  description: undefined,
  packageName: undefined,
  transportRequest: undefined,
  source: undefined,
  testClassCode: undefined,
  testClassName: undefined,
  localTypesCode: undefined,
  definitionsCode: undefined,
  macrosCode: undefined,
  superclass: undefined,
  final: undefined,
  createProtected: undefined,
  masterSystem: undefined,
  responsible: undefined,
  classTemplate: undefined,
};
void _IClassConfig;
const _ILocalTestClassConfig: Pick<
  ILocalTestClassConfig,
  'source' | 'transportRequest'
> = { source: undefined, transportRequest: undefined };
void _ILocalTestClassConfig;
const _ILocalTypesConfig: Pick<
  ILocalTypesConfig,
  'source' | 'transportRequest'
> = { source: undefined, transportRequest: undefined };
void _ILocalTypesConfig;
const _ILocalDefinitionsConfig: Pick<
  ILocalDefinitionsConfig,
  'source' | 'transportRequest'
> = { source: undefined, transportRequest: undefined };
void _ILocalDefinitionsConfig;
const _ILocalMacrosConfig: Pick<
  ILocalMacrosConfig,
  'source' | 'transportRequest'
> = { source: undefined, transportRequest: undefined };
void _ILocalMacrosConfig;
const _IAdtSystemContext: Pick<
  IAdtSystemContext,
  'masterSystem' | 'responsible' | 'masterLanguage'
> = {
  masterSystem: undefined,
  responsible: undefined,
  masterLanguage: undefined,
};
void _IAdtSystemContext;
const _IAdtClientOptions: Pick<
  IAdtClientOptions,
  'masterSystem' | 'responsible' | 'masterLanguage' | 'contentTypes' | 'unicode'
> = {
  masterSystem: undefined,
  responsible: undefined,
  masterLanguage: undefined,
  contentTypes: undefined,
  unicode: undefined,
};
void _IAdtClientOptions;
const _IDataElementConfig: Pick<
  IDataElementConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'dataType'
  | 'length'
  | 'typeKind'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  dataType: undefined,
  length: undefined,
  typeKind: undefined,
};
void _IDataElementConfig;
const _IDdlConfig: Pick<
  IDdlConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'source'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  source: undefined,
};
void _IDdlConfig;
const _IDomainConfig: Pick<
  IDomainConfig,
  'masterLanguage' | 'packageName' | 'transportRequest' | 'description'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
};
void _IDomainConfig;
const _IEnhancementConfig: Pick<
  IEnhancementConfig,
  | 'masterLanguage'
  | 'description'
  | 'packageName'
  | 'transportRequest'
  | 'source'
  | 'enhancementSpot'
  | 'badiDefinition'
  | 'enhancedObject'
  | 'enhancementOption'
  | 'enhancementMode'
> = {
  masterLanguage: undefined,
  description: undefined,
  packageName: undefined,
  transportRequest: undefined,
  source: undefined,
  enhancementSpot: undefined,
  badiDefinition: undefined,
  enhancedObject: undefined,
  enhancementOption: undefined,
  enhancementMode: undefined,
};
void _IEnhancementConfig;
const _IFeatureToggleConfig: Pick<
  IFeatureToggleConfig,
  | 'packageName'
  | 'description'
  | 'transportRequest'
  | 'masterSystem'
  | 'responsible'
  | 'source'
> = {
  packageName: undefined,
  description: undefined,
  transportRequest: undefined,
  masterSystem: undefined,
  responsible: undefined,
  source: undefined,
};
void _IFeatureToggleConfig;
const _IFunctionGroupConfig: Pick<
  IFunctionGroupConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'masterSystem'
  | 'responsible'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  masterSystem: undefined,
  responsible: undefined,
};
void _IFunctionGroupConfig;
const _IFunctionIncludeConfig: Pick<
  IFunctionIncludeConfig,
  'description' | 'transportRequest' | 'source'
> = { description: undefined, transportRequest: undefined, source: undefined };
void _IFunctionIncludeConfig;
const _IFunctionModuleConfig: Pick<
  IFunctionModuleConfig,
  'transportRequest' | 'description' | 'source' | 'masterSystem' | 'responsible'
> = {
  transportRequest: undefined,
  description: undefined,
  source: undefined,
  masterSystem: undefined,
  responsible: undefined,
};
void _IFunctionModuleConfig;
const _IIncludeConfig: Pick<
  IIncludeConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'source'
  | 'onLock'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  source: undefined,
  onLock: undefined,
};
void _IIncludeConfig;
const _IInterfaceConfig: Pick<
  IInterfaceConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'source'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  source: undefined,
};
void _IInterfaceConfig;
const _IMessageClassConfig: Pick<
  IMessageClassConfig,
  'description' | 'packageName' | 'transportRequest' | 'masterLanguage'
> = {
  description: undefined,
  packageName: undefined,
  transportRequest: undefined,
  masterLanguage: undefined,
};
void _IMessageClassConfig;
const _IMessageClassMessageConfig: Pick<
  IMessageClassMessageConfig,
  'msgtext' | 'selfExplanatory' | 'description' | 'transportRequest'
> = {
  msgtext: undefined,
  selfExplanatory: undefined,
  description: undefined,
  transportRequest: undefined,
};
void _IMessageClassMessageConfig;
const _IMetadataExtensionConfig: Pick<
  IMetadataExtensionConfig,
  | 'description'
  | 'packageName'
  | 'transportRequest'
  | 'source'
  | 'masterLanguage'
  | 'masterSystem'
  | 'responsible'
> = {
  description: undefined,
  packageName: undefined,
  transportRequest: undefined,
  source: undefined,
  masterLanguage: undefined,
  masterSystem: undefined,
  responsible: undefined,
};
void _IMetadataExtensionConfig;
const _IAdtObjectConfig: Pick<
  IAdtObjectConfig,
  'packageName' | 'description' | 'transportRequest'
> = {
  packageName: undefined,
  description: undefined,
  transportRequest: undefined,
};
void _IAdtObjectConfig;
const _IPackageConfig: Pick<
  IPackageConfig,
  | 'superPackage'
  | 'description'
  | 'packageType'
  | 'softwareComponent'
  | 'transportLayer'
  | 'transportRequest'
  | 'applicationComponent'
  | 'responsible'
  | 'masterSystem'
  | 'masterLanguage'
  | 'recordChanges'
> = {
  superPackage: undefined,
  description: undefined,
  packageType: undefined,
  softwareComponent: undefined,
  transportLayer: undefined,
  transportRequest: undefined,
  applicationComponent: undefined,
  responsible: undefined,
  masterSystem: undefined,
  masterLanguage: undefined,
  recordChanges: undefined,
};
void _IPackageConfig;
const _IProgramConfig: Pick<
  IProgramConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'application'
  | 'source'
  | 'sessionId'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  application: undefined,
  source: undefined,
  sessionId: undefined,
};
void _IProgramConfig;
const _IAdtError: Pick<
  IAdtError,
  'adtType' | 'namespace' | 'response' | 'request' | 'code'
> = {
  adtType: undefined,
  namespace: undefined,
  response: undefined,
  request: undefined,
  code: undefined,
};
void _IAdtError;
const _IScalarFunctionConfig: Pick<
  IScalarFunctionConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'source'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  source: undefined,
};
void _IScalarFunctionConfig;
const _IScalarFunctionImplementationConfig: Pick<
  IScalarFunctionImplementationConfig,
  | 'engineValue'
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'source'
> = {
  engineValue: undefined,
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  source: undefined,
};
void _IScalarFunctionImplementationConfig;
const _IServiceBindingConfig: Pick<
  IServiceBindingConfig,
  | 'packageName'
  | 'description'
  | 'serviceDefinitionName'
  | 'serviceName'
  | 'serviceVersion'
  | 'bindingVariant'
  | 'masterLanguage'
  | 'masterSystem'
  | 'responsible'
  | 'desiredPublicationState'
  | 'serviceType'
  | 'transportRequest'
> = {
  packageName: undefined,
  description: undefined,
  serviceDefinitionName: undefined,
  serviceName: undefined,
  serviceVersion: undefined,
  bindingVariant: undefined,
  masterLanguage: undefined,
  masterSystem: undefined,
  responsible: undefined,
  desiredPublicationState: undefined,
  serviceType: undefined,
  transportRequest: undefined,
};
void _IServiceBindingConfig;
const _IServiceDefinitionConfig: Pick<
  IServiceDefinitionConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'source'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  source: undefined,
};
void _IServiceDefinitionConfig;
const _IGetVirtualFoldersContentsParams: Pick<
  IGetVirtualFoldersContentsParams,
  | 'objectSearchPattern'
  | 'preselection'
  | 'facetOrder'
  | 'withVersions'
  | 'ignoreShortDescriptions'
> = {
  objectSearchPattern: undefined,
  preselection: undefined,
  facetOrder: undefined,
  withVersions: undefined,
  ignoreShortDescriptions: undefined,
};
void _IGetVirtualFoldersContentsParams;
const _IStructureConfig: Pick<
  IStructureConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'source'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  source: undefined,
};
void _IStructureConfig;
const _ITableConfig: Pick<
  ITableConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'source'
  | 'description'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  source: undefined,
  description: undefined,
};
void _ITableConfig;
const _ITableTypeConfig: Pick<
  ITableTypeConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'rowTypeName'
  | 'description'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  rowTypeName: undefined,
  description: undefined,
};
void _ITableTypeConfig;
const _ITransformationConfig: Pick<
  ITransformationConfig,
  | 'masterLanguage'
  | 'packageName'
  | 'transportRequest'
  | 'description'
  | 'source'
> = {
  masterLanguage: undefined,
  packageName: undefined,
  transportRequest: undefined,
  description: undefined,
  source: undefined,
};
void _ITransformationConfig;
const _ITransportConfig: Pick<
  ITransportConfig,
  'transportType' | 'targetSystem' | 'owner' | 'transportNumber'
> = {
  transportType: undefined,
  targetSystem: undefined,
  owner: undefined,
  transportNumber: undefined,
};
void _ITransportConfig;
const _IUnitTestConfig: Pick<
  IUnitTestConfig,
  | 'source'
  | 'packageName'
  | 'description'
  | 'classTemplate'
  | 'transportRequest'
> = {
  source: undefined,
  packageName: undefined,
  description: undefined,
  classTemplate: undefined,
  transportRequest: undefined,
};
void _IUnitTestConfig;
const _IClassUnitTestRunOptions: Pick<
  IClassUnitTestRunOptions,
  'title' | 'context' | 'scope' | 'riskLevel' | 'duration'
> = {
  title: undefined,
  context: undefined,
  scope: undefined,
  riskLevel: undefined,
  duration: undefined,
};
void _IClassUnitTestRunOptions;
const _ICdsUnitTestConfig: Pick<ICdsUnitTestConfig, 'cdsViewName'> = {
  cdsViewName: undefined,
};
void _ICdsUnitTestConfig;
const _IUnitTestResultOptions: Pick<
  IUnitTestResultOptions,
  'withNavigationUris' | 'format'
> = { withNavigationUris: undefined, format: undefined };
void _IUnitTestResultOptions;
const _IFeedQueryOptions: Pick<
  IFeedQueryOptions,
  'user' | 'maxResults' | 'from' | 'to' | 'query'
> = {
  user: undefined,
  maxResults: undefined,
  from: undefined,
  to: undefined,
  query: undefined,
};
void _IFeedQueryOptions;
const _IProfilerTraceHitListOptions: Pick<
  IProfilerTraceHitListOptions,
  'withSystemEvents'
> = { withSystemEvents: undefined };
void _IProfilerTraceHitListOptions;
const _IProfilerTraceStatementsOptions: Pick<
  IProfilerTraceStatementsOptions,
  'id' | 'withDetails' | 'autoDrillDownThreshold' | 'withSystemEvents'
> = {
  id: undefined,
  withDetails: undefined,
  autoDrillDownThreshold: undefined,
  withSystemEvents: undefined,
};
void _IProfilerTraceStatementsOptions;
const _IProfilerTraceDbAccessesOptions: Pick<
  IProfilerTraceDbAccessesOptions,
  'withSystemEvents'
> = { withSystemEvents: undefined };
void _IProfilerTraceDbAccessesOptions;
const _IAdtOperationOptions: Pick<
  IAdtOperationOptions,
  'source' | 'lockHandle' | 'timeout'
> = { source: undefined, lockHandle: undefined, timeout: undefined };
void _IAdtOperationOptions;
const _IUnitTestScope: Pick<
  IUnitTestScope,
  'ownTests' | 'foreignTests' | 'addForeignTestsAsPreview'
> = {
  ownTests: undefined,
  foreignTests: undefined,
  addForeignTestsAsPreview: undefined,
};
void _IUnitTestScope;

// A nested literal widens with its owner.
const _IAdtErrorRequest: NonNullable<IAdtError['request']> = {
  method: undefined,
  url: undefined,
};
void _IAdtErrorRequest;

// `requestUser?: never` on the terminal mode: absent, and now `undefined` too.
const _terminal: IDebuggerIdentity = {
  debuggingMode: 'terminal',
  terminalId: 'T',
  ideId: 'I',
  requestUser: undefined,
};
void _terminal;

// The inline options of `getActivationRun`, on both overloads.
declare const _groups: IAdtGroupLifecycle<
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown
>;
declare const _analyse: IAnalyse;
void _groups.getActivationRun('R', { withLongPolling: undefined });
void _groups.getActivationRun('R', {
  withLongPolling: undefined,
  analyse: _analyse,
});
