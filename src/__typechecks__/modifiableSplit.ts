// Compile-only assertions. If these stop compiling, the types regressed.
//
// IAdtModifiable used to bundle update+delete with no way to declare one
// without the other. It is now the composite of IAdtUpdatable and
// IAdtDeletable. This file proves the split is shape-preserving for
// IAdtCrud, and that the two atoms are independently satisfiable — a
// handler with only one no longer has to (mis)claim the other.

import type {
  IAdtCreatable,
  IAdtCrud,
  IAdtDeletable,
  IAdtModifiable,
  IAdtReadable,
  IAdtUpdatable,
} from '../adt/IAdtCapabilities';

interface Config {
  name: string;
}
interface State {
  name: string;
  errors: string[];
}

/** Assertion helper: instantiating with `false` is a compile error. */
type Assert<T extends true> = T;

// The four-atom intersection is exactly IAdtCrud — the split changed nothing
// about the shape a handler that implements everything presents.
type FourAtoms = IAdtCreatable<Config, State> &
  IAdtReadable<Config, State> &
  IAdtUpdatable<Config, State> &
  IAdtDeletable<Config, State>;

type _CrudUnchanged = [
  Assert<IAdtCrud<Config, State> extends FourAtoms ? true : false>,
  Assert<FourAtoms extends IAdtCrud<Config, State> ? true : false>,
];

// A handler declaring only update() satisfies IAdtUpdatable...
const _updateOnly: IAdtUpdatable<Config, State> = {
  update: async (config) => ({ name: config.name ?? '', errors: [] }),
};
void _updateOnly;

// ...but not IAdtModifiable: delete() is missing.
// @ts-expect-error IAdtModifiable requires delete(); this object has none.
const _updateOnlyAsModifiable: IAdtModifiable<Config, State> = _updateOnly;
void _updateOnlyAsModifiable;

// And the reverse: a handler declaring only delete() satisfies IAdtDeletable...
const _deleteOnly: IAdtDeletable<Config, State> = {
  delete: async (config) => ({ name: config.name ?? '', errors: [] }),
};
void _deleteOnly;

// ...but not IAdtModifiable: update() is missing.
// @ts-expect-error IAdtModifiable requires update(); this object has none.
const _deleteOnlyAsModifiable: IAdtModifiable<Config, State> = _deleteOnly;
void _deleteOnlyAsModifiable;
