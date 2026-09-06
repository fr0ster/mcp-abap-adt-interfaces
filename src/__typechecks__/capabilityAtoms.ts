// Compile-only assertions. If these stop compiling, the types regressed.
//
// The wide composites are gone: there is no `IAdtCrud`, `IAdtModifiable`,
// `IAdtObject` or `IAdtSourceObject`. A handler declares the atoms it honours,
// and each atom names what its own member answers — a create does not answer
// what a read answers, and a contract that made them share one type was saying
// something untrue about ADT.
//
// This file proves the two properties that replaces them: each atom is
// independently satisfiable, and one cannot stand in for another.

import type {
  IAdtCreatable,
  IAdtDeletable,
  IAdtLockable,
  IAdtReadable,
  IAdtUpdatable,
  IAdtVersionable,
} from '../adt/IAdtCapabilities';
import type { IAdtError, IAdtResponse } from '../adt/IAdtResponse';
import { AdtObjectErrorCodes } from '../index';

interface Config {
  name: string;
}

/** The smallest thing satisfying the contract, so these stay about shape. */
// Parameterised in the failure type as well, because the members are: since
// decision 25 a member answers the failure its `analyse` named, and an
// implementation has to be able to say so. The success half never mentions `E`,
// so this needs no cast — it is the same object either way.
function answered<T, E extends IAdtError = IAdtError>(
  value: T,
): IAdtResponse<T, E> {
  return { ok: true, getResult: () => ({ value }) };
}

// A handler that only updates satisfies IAdtUpdatable and nothing else.
const _updateOnly: IAdtUpdatable<Config, void> = {
  update: async () => answered(undefined),
};
void _updateOnly;

// @ts-expect-error IAdtDeletable requires delete(); this object has none.
const _updateOnlyAsDeletable: IAdtDeletable<Config, void> = _updateOnly;
void _updateOnlyAsDeletable;

// And the reverse.
// Deleting and asking whether it can be deleted are one capability: almost
// anything created can be deleted, and what varies is whether it can be deleted
// *now* — which only the server knows. So `IAdtDeletable` carries both, and an
// implementation that offers one offers the other.
const _deleteOnly: IAdtDeletable<Config, void, string> = {
  delete: async () => answered(undefined),
  checkDeletion: async () => answered('<del:checkResponse/>'),
};
void _deleteOnly;

// @ts-expect-error IAdtUpdatable requires update(); this object has none.
const _deleteOnlyAsUpdatable: IAdtUpdatable<Config, void> = _deleteOnly;
void _deleteOnlyAsUpdatable;

// The check answers its own value, not the deletion's. They read different
// documents — `del:isDeletable` against `del:isDeleted` — and the third type
// parameter is what keeps a contract from saying they are interchangeable.
const _checkAnswersItsOwn: Promise<IAdtResponse<string>> =
  _deleteOnly.checkDeletion({ name: 'Z' });
void _checkAnswersItsOwn;

// Each member's value is its own. A create answering the created object's name
// and a read answering its source are different types, and the contract says so
// rather than forcing one shape on both.
const _both: IAdtCreatable<Config, string> &
  IAdtReadable<Config, string, string> = {
  // Annotated, where before it was inferred: a member with two call signatures
  // gives an implementation no single one to be contextually typed from. That
  // is the cost of the overloads, and it is one type annotation.
  create: async (config: Config) => answered(config.name),
  read: async () => answered('CLASS zcl_x DEFINITION.'),
  readMetadata: async () => answered('<adtcore:objectReference/>'),
};
void _both;

// A create answering a name cannot be read as one answering nothing: the value
// is part of the contract, not a detail under it.
// @ts-expect-error IAdtCreatable<Config, string> is not IAdtCreatable<Config, void>
const _mismatched: IAdtCreatable<Config, void> = _both;
void _mismatched;

/**
 * The promised code is readable from the contract, without a cast.
 *
 * `getVersions` documents `UNSUPPORTED_OPERATION` for a type with no version
 * resource. Until 30.0.0 that promise was made by a member that threw, so the
 * only way to keep it was `(error as { code?: string }).code` — which is what
 * this assertion exists to prevent coming back.
 */
/** A consumer's own version entry — the contract declares none since 31.0.0. */
interface MyVersion {
  version: string;
  contentUri: string;
}

async function _readsThePromisedCode(
  versionable: IAdtVersionable<{ className: string }, MyVersion[], string>,
): Promise<'unsupported' | 'other' | 'fine'> {
  const answer = await versionable.getVersions({ className: 'ZCL_X' });
  if (answer.ok) return 'fine';
  const failure: IAdtError = answer.getError();
  return failure.code === AdtObjectErrorCodes.UNSUPPORTED_OPERATION
    ? 'unsupported'
    : 'other';
}
void _readsThePromisedCode;

/** A lock answers; it does not throw. */
async function _lockAnswers(
  lockable: IAdtLockable<{ className: string }>,
): Promise<string | undefined> {
  const answer = await lockable.lock({ className: 'ZCL_X' });
  return answer.ok ? answer.getResult().value : undefined;
}
void _lockAnswers;
