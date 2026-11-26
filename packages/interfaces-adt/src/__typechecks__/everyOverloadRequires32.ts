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
  IAdtMessageClassMessageUpdatable,
  IMessageClassMessageConfig,
  IMessageClassMessageRemoval,
  IMessageClassMessageUpsert,
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

/** The parameter lists of a member with four call signatures, in order. */
type Four<F> = F extends {
  (...args: infer A1): unknown;
  (...args: infer A2): unknown;
  (...args: infer A3): unknown;
  (...args: infer A4): unknown;
}
  ? [A1, A2, A3, A4]
  : never;

type MU4 = Four<IAdtMessageClassMessageUpdatable<'w', 'd'>['update']>;
type UpsertId = AdtObjectIdentity<
  IMessageClassMessageConfig,
  'className' | 'msgno' | 'msgtext'
>;
/** Every option an update needs, a required string on the given overload. */
type UpdateOptionsRequired<O> = [
  RequiredString<O, 'classDocument' & keyof O>,
  RequiredString<O, 'classLockHandle' & keyof O>,
  RequiredString<O, 'messageLockHandle' & keyof O>,
] extends [true, true, true]
  ? true
  : false;

export type _MessageUpdateEveryOverload = [
  // Overloads 1 and 3 upsert: address and text required; 2 and 4 remove.
  Assert<Equal<MU4[0][0], IMessageClassMessageUpsert>>,
  Assert<Equal<MU4[2][0], IMessageClassMessageUpsert>>,
  Assert<Equal<MU4[1][0], IMessageClassMessageRemoval>>,
  Assert<Equal<MU4[3][0], IMessageClassMessageRemoval>>,
  Assert<RequiredString<UpsertId, 'className'>>,
  Assert<RequiredString<UpsertId, 'msgno'>>,
  Assert<RequiredString<UpsertId, 'msgtext'>>,
  Assert<RequiredString<IMessageClassMessageRemoval, 'className'>>,
  Assert<RequiredString<IMessageClassMessageRemoval, 'msgno'>>,
  Assert<Equal<IMessageClassMessageRemoval['removeMessage'], true>>,
  // Both handles and the document, on every one of the four.
  Assert<UpdateOptionsRequired<MU4[0][1]>>,
  Assert<UpdateOptionsRequired<MU4[1][1]>>,
  Assert<UpdateOptionsRequired<MU4[2][1]>>,
  Assert<UpdateOptionsRequired<MU4[3][1]>>,
  // The two generic overloads require `analyse`.
  Assert<
    [RequiredKeys<MU4[0][1]>] extends [never]
      ? false
      : 'analyse' extends RequiredKeys<MU4[0][1]>
        ? true
        : false
  >,
  Assert<
    [RequiredKeys<MU4[1][1]>] extends [never]
      ? false
      : 'analyse' extends RequiredKeys<MU4[1][1]>
        ? true
        : false
  >,
];

declare const messageUpdater: IAdtMessageClassMessageUpdatable<'w', 'd'>;
const updateOptions = {
  headers: { accept: 'a', contentType: 'c' },
  classDocument: '<mc:messageClass/>',
  classLockHandle: 'C',
  messageLockHandle: 'M',
};
export async function _messageUpdate(): Promise<void> {
  const upserted = await messageUpdater.update(
    { className: 'ZMSG', msgno: '001', msgtext: 'Text' },
    updateOptions,
  );
  if (upserted.ok) void (upserted.getResult().value satisfies 'w');
  const removed = await messageUpdater.update(
    { className: 'ZMSG', msgno: '001', removeMessage: true },
    updateOptions,
  );
  if (removed.ok) void (removed.getResult().value satisfies 'd');
  const noText = { className: 'Z', msgno: '1' };
  // @ts-expect-error an upsert needs the message's text
  await messageUpdater.update(noText, updateOptions);
  const undefinedText = { className: 'Z', msgno: '1', msgtext: undefined };
  // @ts-expect-error and not an `undefined` one
  await messageUpdater.update(undefinedText, updateOptions);
}
