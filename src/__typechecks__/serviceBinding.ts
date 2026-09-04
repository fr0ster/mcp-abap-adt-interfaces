// Compile-only assertions. If these stop compiling, the types regressed.
//
// The service binding is where the duplication was worst: the contract extended
// eight capability atoms and declared eight more members doing the same things
// on the same endpoints, answering the transport envelope. What is asserted here
// is what replaced that — the atoms alone for CRUD, composed rather than
// inherited, and one member per thing that has no atom.

import type {
  IAdtActivatable,
  IAdtCreatable,
  IAdtReadable,
  IAdtResponse,
  IAdtServiceBinding,
  IServiceBindingConfig,
  IServiceBindingResults,
} from '../index';

const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

/**
 * What a caller who needs the whole surface writes.
 *
 * Spelled, not named: a consumer that only publishes bindings takes the half it
 * needs, and an implementation that only publishes is a legitimate one.
 */
type WholeBinding = IAdtServiceBinding<MyReadings> &
  IAdtCreatable<IServiceBindingConfig, void> &
  IAdtReadable<IServiceBindingConfig, string, string> &
  IAdtActivatable<IServiceBindingConfig, string>;

/** The publishing half alone, which the old shape could not express. */
type PublishingOnly = Pick<IAdtServiceBinding<MyReadings>, 'publishODataV2'>;

const _publisher: PublishingOnly = {
  // this implementation reads a publication as nothing to read
  publishODataV2: async () => answered(undefined),
};
void _publisher;

/** A consumer's own readings, chosen once, keyed rather than positional. */
interface IBindingSummary {
  name: string;
  published: boolean;
}

/** Composed, not extended — the rule this package holds itself to. */
type MyReadings = IServiceBindingResults & {
  bindingTypes: string[];
  generation: IBindingSummary;
  odata: string;
  publication: undefined;
  classification: string;
};

declare const mine: IAdtServiceBinding<MyReadings>;

async function _mineAnswers() {
  const types = await mine.getServiceBindingTypes();
  const generated = await mine.createAndGenerateServiceBinding({
    name: 'ZSB',
    package: 'ZLOCAL',
  } as never);

  if (!types.ok || !generated.ok) return undefined;

  const names: string[] = types.getResult().value;
  const summary: IBindingSummary = generated.getResult().value;
  return { names, summary };
}
void _mineAnswers;

/**
 * The chain answers one value.
 *
 * It made six requests and handed back six envelopes until 30.0.0. What an
 * implementation does on the way to an answer is its own business, and reaches
 * a caller only if it fails.
 */
declare const binding: IAdtServiceBinding<MyReadings>;
const _oneValue: Promise<IAdtResponse<IBindingSummary>> =
  binding.createAndGenerateServiceBinding({} as never);
void _oneValue;

// @ts-expect-error createServiceBinding was one endpoint under two names; the atom is the survivor
void binding.createServiceBinding;

export type { WholeBinding, PublishingOnly, MyReadings };
