// Compile-only assertions for 32.0.0. If these stop compiling, the types
// regressed.
//
// **Every overload of every identifying member, one field at a time.** A call
// that compiles proves one overload; these read each overload's own parameter
// types, so a regression in either one shows. The config of each overload must
// be exactly `AdtObjectIdentity<TConfig, TRequired>`; each required field must
// be required and a `string` (no `undefined`); each required option likewise;
// and a lock-free write must refuse a lock handle.

import type {
  AdtObjectIdentity,
  IAdtActivatable,
  IAdtCheckable,
  IAdtDeletable,
  IAdtEnhancementHost,
  IAdtIncludeEnhancementHost,
  IAdtLockable,
  IAdtLockFreeMetadataUpdatable,
  IAdtLockFreeUpdatable,
  IAdtMainProgramsReadable,
  IAdtMetadataReadable,
  IAdtMetadataUpdatable,
  IAdtReadable,
  IAdtTransportAware,
  IAdtUpdatable,
  IAdtValidatable,
  IAdtVersionable,
} from '../adt/IAdtCapabilities';
import type {
  IFeatureToggleConfig,
  IFeatureToggleObject,
  IFeatureToggleObjectResults,
} from '../adt/IAdtFeatureToggle';
import type {
  IAdtMessageClassMessageLockable,
  IAdtMessageClassMessageWritable,
  IMessageClassMessageConfig,
} from '../adt/IAdtMessageClass';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

/** The parameter lists of a member with two call signatures, in order. */
type Two<F> = F extends {
  (...args: infer A1): unknown;
  (...args: infer A2): unknown;
}
  ? [A1, A2]
  : never;

/** The keys of `T` a value must carry. */
type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

/** `K` is required in `T`, and its type is exactly `string`. */
type RequiredString<T, K extends keyof T> = [K] extends [RequiredKeys<T>]
  ? Equal<T[K], string>
  : false;

/** The config of both overloads is exactly the identity. */
type BothConfigs<F, I, P extends number = 0> =
  Two<F> extends [infer A1 extends unknown[], infer A2 extends unknown[]]
    ? [Equal<A1[P], I>, Equal<A2[P], I>] extends [true, true]
      ? true
      : false
    : false;

/** Option `K` is a required string on both overloads. */
type BothOptionRequired<F, K extends PropertyKey, P extends number> =
  Two<F> extends [infer A1 extends unknown[], infer A2 extends unknown[]]
    ? K extends keyof A1[P] & keyof A2[P]
      ? [RequiredString<A1[P], K>, RequiredString<A2[P], K>] extends [
          true,
          true,
        ]
        ? true
        : false
      : false
    : false;

/** Option `K` is absent on both overloads: `never`, so only `undefined` fits. */
type BothOptionRefused<F, K extends PropertyKey, P extends number> =
  Two<F> extends [infer A1 extends unknown[], infer A2 extends unknown[]]
    ? K extends keyof A1[P] & keyof A2[P]
      ? [Equal<A1[P][K], undefined>, Equal<A2[P][K], undefined>] extends [
          true,
          true,
        ]
        ? true
        : false
      : false
    : false;

/** A config with a name, a parent and a sent field, all optional in itself. */
interface Cfg {
  name?: string | undefined;
  parent?: string | undefined;
  sent?: string | undefined;
  other?: string | undefined;
}
type K = 'name' | 'parent' | 'sent';
type Id = AdtObjectIdentity<Cfg, K>;

export type _TheIdentityItself = [
  Assert<RequiredString<Id, 'name'>>,
  Assert<RequiredString<Id, 'parent'>>,
  Assert<RequiredString<Id, 'sent'>>,
  Assert<Equal<Id['other'], string | undefined>>,
];

type R = IAdtReadable<Cfg, string, K>;
type MR = IAdtMetadataReadable<Cfg, string, K>;
type EH = IAdtEnhancementHost<Cfg, string, string, K>;
type IEH = IAdtIncludeEnhancementHost<Cfg, string, string, K>;
type MP = IAdtMainProgramsReadable<Cfg, string, K>;
type D = IAdtDeletable<Cfg, string, K>;
type V = IAdtValidatable<Cfg, string, K>;
type C = IAdtCheckable<Cfg, string, K>;
type A = IAdtActivatable<Cfg, string, K>;
type L = IAdtLockable<Cfg, K>;
type VR = IAdtVersionable<Cfg, string, string, K>;
type T = IAdtTransportAware<Cfg, string, K>;
type U = IAdtUpdatable<Cfg, string, K, 'source'>;
type MU = IAdtMetadataUpdatable<Cfg, string, K, 'source'>;
type UT = IAdtUpdatable<Cfg, string, K>;
type LFU = IAdtLockFreeUpdatable<Cfg, string, K, 'source'>;
type LFMU = IAdtLockFreeMetadataUpdatable<Cfg, string, K, 'source'>;

export type _EveryIdentifyingOverload = [
  Assert<BothConfigs<R['read'], Id>>,
  Assert<BothConfigs<MR['readMetadata'], Id>>,
  Assert<BothConfigs<EH['readEnhancementElements'], Id>>,
  Assert<BothConfigs<EH['readEnhancementOptions'], Id>>,
  Assert<BothConfigs<IEH['readEnhancementElements'], Id>>,
  Assert<BothConfigs<IEH['readEnhancementOptions'], Id>>,
  Assert<BothConfigs<MP['readMainPrograms'], Id>>,
  Assert<BothConfigs<D['delete'], Id>>,
  Assert<BothConfigs<D['checkDeletion'], Id>>,
  Assert<BothConfigs<V['validate'], Id>>,
  Assert<BothConfigs<C['check'], Id>>,
  Assert<BothConfigs<A['activate'], Id>>,
  Assert<BothConfigs<L['lock'], Id>>,
  Assert<BothConfigs<L['unlock'], Id>>,
  Assert<BothConfigs<VR['getVersions'], Id>>,
  Assert<BothConfigs<T['readTransport'], Id>>,
  Assert<BothConfigs<U['update'], Id>>,
  Assert<BothConfigs<MU['updateMetadata'], Id>>,
  Assert<BothConfigs<LFU['update'], Id>>,
  Assert<BothConfigs<LFMU['updateMetadata'], Id>>,
];

export type _EveryWriteOption = [
  // A locked write needs its handle and, where named, its source.
  Assert<BothOptionRequired<U['update'], 'lockHandle', 1>>,
  Assert<BothOptionRequired<U['update'], 'source', 1>>,
  Assert<BothOptionRequired<MU['updateMetadata'], 'lockHandle', 1>>,
  Assert<BothOptionRequired<MU['updateMetadata'], 'source', 1>>,
  // One that names no source still needs the handle.
  Assert<BothOptionRequired<UT['update'], 'lockHandle', 1>>,
  // A lock-free write refuses the handle and still needs its source.
  Assert<BothOptionRefused<LFU['update'], 'lockHandle', 1>>,
  Assert<BothOptionRequired<LFU['update'], 'source', 1>>,
  Assert<BothOptionRefused<LFMU['updateMetadata'], 'lockHandle', 1>>,
  Assert<BothOptionRequired<LFMU['updateMetadata'], 'source', 1>>,
];

// ── The feature toggle's own members ────────────────────────────────────────

type FT = IFeatureToggleObject<IFeatureToggleObjectResults>;
type FTId = AdtObjectIdentity<IFeatureToggleConfig, 'featureToggleName'>;
export type _FeatureToggle = [
  Assert<BothConfigs<FT['switchOn'], FTId>>,
  Assert<BothConfigs<FT['switchOff'], FTId>>,
  Assert<BothConfigs<FT['getRuntimeState'], FTId>>,
  Assert<BothConfigs<FT['checkState'], FTId>>,
  Assert<BothConfigs<FT['readSource'], FTId>>,
];

// ── A message's locks: one request each, addressed by class and number ──────

type ML = IAdtMessageClassMessageLockable;
type MId = AdtObjectIdentity<IMessageClassMessageConfig, 'className' | 'msgno'>;
export type _MessageLocks = [
  Assert<BothConfigs<ML['lockMessage'], MId>>,
  Assert<BothConfigs<ML['lockClassForMessage'], MId>>,
  Assert<BothConfigs<ML['unlockMessages'], MId>>,
];

declare const messageWriter: IAdtMessageClassMessageWritable<'w', 'd'>;
const writeOptions = {
  headers: { accept: 'a', contentType: 'c' },
  classDocument: '<mc:messageClass/>',
  classLockHandle: 'C',
  messageLockHandle: 'M',
};
export async function _messageWrite(): Promise<void> {
  const upserted = await messageWriter.write(
    { className: 'ZMSG', msgno: '001', msgtext: 'Text' },
    writeOptions,
  );
  if (upserted.ok) void (upserted.getResult().value satisfies 'w');
  const removed = await messageWriter.write(
    { className: 'ZMSG', msgno: '001', remove: true },
    writeOptions,
  );
  if (removed.ok) void (removed.getResult().value satisfies 'd');
  const { classLockHandle: _c, ...withoutClassHandle } = writeOptions;
  // @ts-expect-error the write takes both handles
  await messageWriter.write({ className: 'Z', msgno: '1' }, withoutClassHandle);
  const { messageLockHandle: _m, ...withoutMessageHandle } = writeOptions;
  const message = { className: 'Z', msgno: '1' };
  // @ts-expect-error the message handle too
  await messageWriter.write(message, withoutMessageHandle);
  const { classDocument: _d, ...withoutDocument } = writeOptions;
  // @ts-expect-error and the class's document it writes into
  await messageWriter.write({ className: 'Z', msgno: '1' }, withoutDocument);
  // @ts-expect-error a message is addressed by its class and number
  await messageWriter.write({ className: 'Z' }, writeOptions);
}
