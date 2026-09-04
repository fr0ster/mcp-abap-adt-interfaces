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
  IAdtReadable,
  IAdtUpdatable,
} from '../adt/IAdtCapabilities';
import type { IAdtResponse } from '../adt/IAdtResponse';

interface Config {
  name: string;
}

/** The smallest thing satisfying the contract, so these stay about shape. */
function answered<T>(value: T): IAdtResponse<T> {
  return { ok: true, getResult: () => ({ value }), getError: () => undefined };
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
const _deleteOnly: IAdtDeletable<Config, void> = {
  delete: async () => answered(undefined),
};
void _deleteOnly;

// @ts-expect-error IAdtUpdatable requires update(); this object has none.
const _deleteOnlyAsUpdatable: IAdtUpdatable<Config, void> = _deleteOnly;
void _deleteOnlyAsUpdatable;

// Each member's value is its own. A create answering the created object's name
// and a read answering its source are different types, and the contract says so
// rather than forcing one shape on both.
const _both: IAdtCreatable<Config, string> &
  IAdtReadable<Config, string, string> = {
  create: async (config) => answered(config.name),
  read: async () => answered('CLASS zcl_x DEFINITION.'),
  readMetadata: async () => answered('<adtcore:objectReference/>'),
};
void _both;

// A create answering a name cannot be read as one answering nothing: the value
// is part of the contract, not a detail under it.
// @ts-expect-error IAdtCreatable<Config, string> is not IAdtCreatable<Config, void>
const _mismatched: IAdtCreatable<Config, void> = _both;
void _mismatched;
