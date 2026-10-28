// Compile-only assertions. If these stop compiling, the types regressed.
//
// A client contract is the consumer's, not this package's: it names the
// factories the consumer calls and the atoms each one answers. This file
// composes a two-factory contract from the atoms and the result-set contracts
// of this package alone — no `@mcp-abap-adt/adt-clients` — and shows that a
// hand-written object satisfies it, and that one missing a member does not.

import type { IAdtLockable, IAdtReadable } from '../adt/IAdtCapabilities';
import type { IClassConfig, IClassResults } from '../adt/IAdtClass';
import type { IProgramConfig, IProgramResults } from '../adt/IAdtProgram';
import type {
  IAdtError,
  IAdtResponse,
  IResultStrategy,
} from '../adt/IAdtResponse';

/** What the consumer asks of a client: two factories, each over its result set. */
interface IClientContract {
  getClass(
    results: IClassResults,
  ): IAdtReadable<IClassConfig, unknown> & IAdtLockable<IClassConfig>;
  getProgram(results: IProgramResults): IAdtReadable<IProgramConfig, unknown>;
}

function answered<T, E extends IAdtError = IAdtError>(
  value: T,
): IAdtResponse<T, E> {
  return { ok: true, getResult: () => ({ value }) };
}

const rawDocument: IResultStrategy<unknown> = (wire) => wire.data;

/** A result set names every slot; this one answers each as it arrived. */
const classResults: IClassResults = {
  created: rawDocument,
  source: rawDocument,
  metadata: rawDocument,
  enhancementElements: rawDocument,
  enhancementOptions: rawDocument,
  check: rawDocument,
  activation: rawDocument,
  validation: rawDocument,
  deletion: rawDocument,
  updated: rawDocument,
  metadataUpdated: rawDocument,
  deletionCheck: rawDocument,
  transport: rawDocument,
  versions: rawDocument,
  versionSource: rawDocument,
};

// A hand-written client satisfies the contract.
const client: IClientContract = {
  getClass: () => ({
    read: async () => answered('CLASS zcl_x DEFINITION.'),
    lock: async () => answered('lock-handle'),
    unlock: async () => answered(undefined),
  }),
  getProgram: () => ({
    read: async () => answered('REPORT zprog.'),
  }),
};
void client;
void client.getClass(classResults);

// @ts-expect-error getProgram is missing: the contract names two factories.
const _missingMember: IClientContract = {
  getClass: client.getClass,
};
void _missingMember;
