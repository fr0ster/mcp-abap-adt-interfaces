// Compile-only assertions. If these stop compiling, the types regressed.
//
// **These exist because the first version of this contract compiled two calls
// that cannot work.** `createTask` was declared with its whole options
// argument optional, and `removeObject` took `IAbapObjectEntry` whole, where
// `position` is optional. Both were measured against an on-premise system on
// 2026-09-21: the first is refused by the server with an empty user name, the
// second answers `200` and removes nothing. A contract that permits a call
// which cannot work is worse than one that forbids it, so the shapes that are
// now wrong are written down as `@ts-expect-error` — a line that stops failing
// if the requirement is ever loosened again by accident.

import type { IAdtResponse } from '../adt/IAdtResponse';
import type {
  AdtTaskType,
  IAbapObjectEntry,
  IAdtTransportObjectActions,
} from '../index';
import { ADT_TASK_TYPE } from '../index';

/** A consumer's own readings — the contract declares none. */
interface MyEntry {
  name: string;
  position: string;
}
type MyActions = IAdtTransportObjectActions<
  string,
  string,
  { number: string },
  string[],
  MyEntry[],
  string
>;

declare const actions: MyActions;

/** What the positions are read with, and what they are then used for. */
export async function detachTheFirstEntry(task: string): Promise<void> {
  const listed = await actions.readObjects(task);
  if (!listed.ok) return;
  const [entry] = listed.getResult().value;
  if (!entry) return;
  await actions.removeObject(task, {
    name: entry.name,
    type: 'CLAS',
    position: entry.position,
  });
}

/** A task is created for a named user, and the number comes back. */
export const task: Promise<IAdtResponse<{ number: string }>> =
  actions.createTask('E1K900042', { targetUser: 'DEVELOPER' });

/** An entry being added has no position yet, so `addObject` asks for none. */
export const added: Promise<IAdtResponse<string>> = actions.addObject(
  'E1K900042',
  { name: 'ZCL_X', type: 'CLAS' },
);

// @ts-expect-error removeObject needs the position, or the server no-ops
actions.removeObject('E1K900042', { name: 'ZCL_X', type: 'CLAS' });

declare const loose: IAbapObjectEntry;
// @ts-expect-error an entry whose position is optional is not enough either
actions.removeObject('E1K900042', loose);

// @ts-expect-error createTask needs the target user, or the server refuses
actions.createTask('E1K900042');

// @ts-expect-error and naming the options without the user is no better
actions.createTask('E1K900042', {});

/**
 * A task's type is the server's small vocabulary, not a string.
 *
 * `'Q'` is a real CTS type and is refused on a workbench request; `'K'` and
 * `'W'` are REQUEST types and are answered as unknown. Declaring the three
 * that work is what stops a caller discovering the other three from a 400.
 */
export const typed: Promise<IAdtResponse<string>> = actions.changeTaskType(
  'E1K900042',
  'S',
);

// @ts-expect-error a request type is not a task type
actions.changeTaskType('E1K900042', 'K');

// @ts-expect-error nor is a customizing one, which this endpoint refuses
actions.changeTaskType('E1K900042', 'Q');

/**
 * **The vocabulary reaches a consumer, or it is not a contract.**
 *
 * `ADT_TASK_TYPE` and `AdtTaskType` were declared in `IAdtTransport.ts` and
 * left out of this package's entry point — so the import the changelog told a
 * consumer to write did not resolve, and `ADT_TASK_TYPE` was `undefined` in
 * the built package. Nothing caught it: `check-surface.js` reads the *facade*,
 * and these two are deliberately not re-exported there. Found in review.
 *
 * Both are imported from `../index` above for that reason, and not from the
 * file that declares them: this file compiles against the entry point a
 * consumer uses.
 */
export const fromTheConstant: Promise<IAdtResponse<string>> =
  actions.changeTaskType('E1K900042', ADT_TASK_TYPE.developmentCorrection);

/** The named type is the parameter's type, not merely assignable to it. */
export const repair: AdtTaskType = ADT_TASK_TYPE.repair;
export const unclassified: AdtTaskType = ADT_TASK_TYPE.unclassified;

// @ts-expect-error the constant is frozen by `as const`, not a mutable record
ADT_TASK_TYPE.repair = 'S';
