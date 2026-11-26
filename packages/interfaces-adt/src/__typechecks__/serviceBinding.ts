// Compile-only assertions. If these stop compiling, the types regressed.
//
// The service binding was the last object type with an aggregate interface of
// its own. It declared eight members: four that no implementation has any more
// — `getODataV2ServiceBinding`, `getODataV4ServiceBinding`, `publishODataV2`,
// `unpublishODataV2`, because a protocol is a parameter and not a method name —
// and four that were a chain step exposed to callers, two operations glued
// together by an `And`, and two nothing called.
//
// What is asserted here is what replaced it: **nothing**. A binding is described
// by the atoms, composed; a consumer names the half they need, structurally,
// without any type belonging to a particular object.

import type { IAdtHeaders } from '../adt/IAdtContentTypes';
import type {
  IAdtActivatable,
  IAdtCreatable,
  IAdtDeletable,
  IAdtLockFreeUpdatable,
  IAdtMetadataReadable,
  IAdtReadable,
  IAdtResponse,
  IServiceBindingConfig,
  IServiceBindingPublicationConfig,
} from '../index';

const headers: IAdtHeaders = {
  accept: 'application/xml',
  contentType: 'application/xml',
};

const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

/**
 * The three fields a publication cannot proceed without: which object, which
 * state, and the protocol that selects the endpoint. Named once, as the write's
 * required keys (`TRequired`, 32.0.0) — a binding's write demands them whether
 * the caller holds the whole surface or only the publishing half, and spelling
 * them twice is how the two drift apart.
 */
type PublicationKeys =
  | 'bindingName'
  | 'desiredPublicationState'
  | 'serviceType';

/**
 * What a caller who needs the whole surface writes — spelled from atoms, not
 * named by the package. Nothing here is binding-specific except the config.
 *
 * The write takes the publication shape here too. Composing every capability is
 * how a caller ends up holding the binding through the *widest* type in the
 * package, so if `update` were flattened to `Partial` anywhere it would be
 * here, and `whole.update({})` would compile for the caller who reached for
 * everything.
 */
type WholeBinding = IAdtCreatable<IServiceBindingConfig, void> &
  IAdtReadable<IServiceBindingConfig, string, 'bindingName'> &
  IAdtMetadataReadable<IServiceBindingConfig, string, 'bindingName'> &
  IAdtLockFreeUpdatable<
    IServiceBindingPublicationConfig,
    void,
    PublicationKeys
  > &
  IAdtDeletable<IServiceBindingConfig, void, 'bindingName'> &
  IAdtActivatable<IServiceBindingConfig, string, 'bindingName'>;

declare const whole: WholeBinding;

// @ts-expect-error the whole surface is not a wider write: a publication still
// says which object, which state and which protocol
void whole.update({}, { headers });

void whole.update(
  {
    bindingName: 'ZAC_SRVB01',
    // @ts-expect-error `unchanged` is no publication: there is no request for it
    desiredPublicationState: 'unchanged',
    serviceType: 'odatav4',
  },
  { headers },
);

void whole.update(
  {
    bindingName: 'ZAC_SRVB01',
    desiredPublicationState: 'published',
    serviceType: 'odatav4',
  },
  { headers },
);

/**
 * And the half of it somebody actually needs. Publishing a binding is an update
 * — `desiredPublicationState` is a field of its config — so the caller who only
 * publishes takes `IAdtUpdatable` and nothing else, and an implementation that
 * only publishes is a legitimate one.
 *
 * It takes the same {@link PublicationKeys} the whole surface does,
 * because since 37.0.0 the atom no longer flattens what an implementation
 * demands — and the demand does not depend on how much of the object the caller
 * happens to hold.
 */
type PublishingOnly = IAdtLockFreeUpdatable<
  IServiceBindingPublicationConfig,
  void,
  PublicationKeys
>;

const _publisher: PublishingOnly = {
  update: async () => answered(undefined),
};
void _publisher;

const _noProtocol = {
  bindingName: 'ZAC_SRVB01',
  desiredPublicationState: 'published',
} as const;
// @ts-expect-error a publication with no protocol has no endpoint to post to
void _publisher.update(_noProtocol, { headers });

void _publisher.update(
  {
    bindingName: 'ZAC_SRVB01',
    desiredPublicationState: 'published',
    serviceType: 'odatav4',
  },
  { headers },
);

/** A consumer's own reading of what a create answers, named by them. */
interface IBindingSummary {
  readonly name: string;
  readonly published: boolean;
}

declare const mine: IAdtCreatable<IServiceBindingConfig, IBindingSummary>;

async function _mineAnswers(): Promise<IBindingSummary | undefined> {
  const created = await mine.create({} as IServiceBindingConfig, { headers });
  if (!created.ok) return undefined;
  // The create answers one value — the caller's, not a stack of envelopes from
  // every request the implementation made on the way.
  return created.getResult().value;
}
void _mineAnswers;

export type { WholeBinding, PublishingOnly, PublicationKeys, IBindingSummary };
