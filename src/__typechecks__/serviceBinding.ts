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

import type {
  IAdtActivatable,
  IAdtCreatable,
  IAdtDeletable,
  IAdtMetadataReadable,
  IAdtReadable,
  IAdtResponse,
  IAdtUpdatable,
  IServiceBindingConfig,
} from '../index';

const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

/**
 * What a caller who needs the whole surface writes — spelled from atoms, not
 * named by the package. Nothing here is binding-specific except the config.
 */
type WholeBinding = IAdtCreatable<IServiceBindingConfig, void> &
  IAdtReadable<IServiceBindingConfig, string> &
  IAdtMetadataReadable<IServiceBindingConfig, string> &
  IAdtUpdatable<Partial<IServiceBindingConfig>, void> &
  IAdtDeletable<IServiceBindingConfig, void> &
  IAdtActivatable<IServiceBindingConfig, string>;

/**
 * And the half of it somebody actually needs. Publishing a binding is an update
 * — `desiredPublicationState` is a field of its config — so the caller who only
 * publishes takes `IAdtUpdatable` and nothing else, and an implementation that
 * only publishes is a legitimate one.
 *
 * The config is spelled with the three fields a publication cannot proceed
 * without, because since 37.0.0 the atom no longer flattens them: which object,
 * which state, and the protocol that selects the endpoint. This is the same
 * type `@mcp-abap-adt/adt-clients` calls `IServiceBindingPublicationConfig`.
 */
type PublishingOnly = IAdtUpdatable<
  Partial<IServiceBindingConfig> &
    Required<
      Pick<
        IServiceBindingConfig,
        'bindingName' | 'desiredPublicationState' | 'serviceType'
      >
    >,
  void
>;

const _publisher: PublishingOnly = {
  update: async () => answered(undefined),
};
void _publisher;

// @ts-expect-error a publication with no protocol has no endpoint to post to
void _publisher.update({
  bindingName: 'ZAC_SRVB01',
  desiredPublicationState: 'published',
});

void _publisher.update({
  bindingName: 'ZAC_SRVB01',
  desiredPublicationState: 'published',
  serviceType: 'odatav4',
});

/** A consumer's own reading of what a create answers, named by them. */
interface IBindingSummary {
  readonly name: string;
  readonly published: boolean;
}

declare const mine: IAdtCreatable<IServiceBindingConfig, IBindingSummary>;

async function _mineAnswers(): Promise<IBindingSummary | undefined> {
  const created = await mine.create({} as IServiceBindingConfig);
  if (!created.ok) return undefined;
  // The create answers one value — the caller's, not a stack of envelopes from
  // every request the implementation made on the way.
  return created.getResult().value;
}
void _mineAnswers;

export type { WholeBinding, PublishingOnly, IBindingSummary };
