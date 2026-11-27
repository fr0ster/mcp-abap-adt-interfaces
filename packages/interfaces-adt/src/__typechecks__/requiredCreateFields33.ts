// Compile-only assertions for 33.0.0. If these stop compiling, the types
// regressed.
//
// **A field the create's request always reads is required in the config.**
// The description of a behaviour definition, a function group, a function
// module, an interface, a metadata extension, a structure and a service
// binding, and the binding's service name, service definition, service
// version and variant: a create without one compiled in 32 and failed at run
// time; it is refused here. Each `@ts-expect-error` below compiled in 32.
//
// The enhancement's type was already required by `IEnhancementConfig`.

import type { IBehaviorDefinitionConfig } from '../adt/IAdtBehaviorDefinition';
import type { IAdtCreatable } from '../adt/IAdtCapabilities';
import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type { IEnhancementConfig } from '../adt/IAdtEnhancement';
import type { IFunctionGroupConfig } from '../adt/IAdtFunctionGroup';
import type { IFunctionModuleConfig } from '../adt/IAdtFunctionModule';
import type { IInterfaceConfig } from '../adt/IAdtInterface';
import type { IMetadataExtensionConfig } from '../adt/IAdtMetadataExtension';
import type { IServiceBindingConfig } from '../adt/IAdtServiceBinding';
import type { IStructureConfig } from '../adt/IAdtStructure';

declare const headers: IAdtHeaders;
const options = { headers };

declare const bdef: IAdtCreatable<IBehaviorDefinitionConfig, unknown>;
declare const fugr: IAdtCreatable<IFunctionGroupConfig, unknown>;
declare const func: IAdtCreatable<IFunctionModuleConfig, unknown>;
declare const intf: IAdtCreatable<IInterfaceConfig, unknown>;
declare const ddlx: IAdtCreatable<IMetadataExtensionConfig, unknown>;
declare const stru: IAdtCreatable<IStructureConfig, unknown>;
declare const srvb: IAdtCreatable<IServiceBindingConfig, unknown>;
declare const enho: IAdtCreatable<IEnhancementConfig, unknown>;

export async function requiredCreateFields(): Promise<void> {
  // @ts-expect-error the description is read by the create
  await bdef.create({ name: 'ZB' }, options);
  await bdef.create({ name: 'ZB', description: 'd' }, options);
  // @ts-expect-error the description is read by the create
  await fugr.create({ functionGroupName: 'ZG' }, options);
  await fugr.create({ functionGroupName: 'ZG', description: 'd' }, options);
  const module = { functionGroupName: 'ZG', functionModuleName: 'ZM' };
  // @ts-expect-error the description is read by the create
  await func.create(module, options);
  await func.create({ ...module, description: 'd' }, options);
  // @ts-expect-error the description is read by the create
  await intf.create({ interfaceName: 'ZI' }, options);
  await intf.create({ interfaceName: 'ZI', description: 'd' }, options);
  // @ts-expect-error the description is read by the create
  await ddlx.create({ name: 'ZX' }, options);
  await ddlx.create({ name: 'ZX', description: 'd' }, options);
  // @ts-expect-error the description is read by the create
  await stru.create({ structureName: 'ZS' }, options);
  await stru.create({ structureName: 'ZS', description: 'd' }, options);

  const binding = {
    bindingName: 'ZSB',
    description: 'd',
    serviceName: 'ZSRV',
    serviceDefinitionName: 'ZSD',
    serviceVersion: '0001',
    bindingVariant: 'ODATA_V4_UI',
  } as const;
  await srvb.create(binding, options);
  const { description: _d, ...noDescription } = binding;
  // @ts-expect-error the description is read by the create
  await srvb.create(noDescription, options);
  const { serviceName: _n, ...noName } = binding;
  // @ts-expect-error the service name is read by the create
  await srvb.create(noName, options);
  const { serviceDefinitionName: _s, ...noDefinition } = binding;
  // @ts-expect-error the service definition is read by the create
  await srvb.create(noDefinition, options);
  const { serviceVersion: _v, ...noVersion } = binding;
  // @ts-expect-error the service version is read by the create
  await srvb.create(noVersion, options);
  const { bindingVariant: _b, ...noVariant } = binding;
  // @ts-expect-error the variant is read by the create
  await srvb.create(noVariant, options);

  // @ts-expect-error the enhancement type is read by the create (already in 32)
  await enho.create({ enhancementName: 'ZE' }, options);
  await enho.create(
    { enhancementName: 'ZE', enhancementType: 'enhoxhh' },
    options,
  );
}
