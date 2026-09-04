// Compile-only assertions. If these stop compiling, the types regressed.
//
// The runtime contracts answered `Promise<IAdtWireResponse>` until 30.0.0 — the
// transport envelope as the result, which 29.0.0 removed from every ADT contract
// and missed here. Two things are asserted: they answer `IAdtResponse` like
// everything else, and what the answer becomes is the implementation's, chosen
// when it was constructed.

import type {
  IAdtResponse,
  ICrossTrace,
  ICrossTraceResults,
  IRuntimeDumps,
  ISystemMessages,
} from '../index';

const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
  getError: () => undefined,
});

/** Four fields per dump: what an MCP server can afford to spend on a listing. */
interface IDumpSummary {
  id: string;
  at: string;
  program: string;
  message: string;
}

/** A short reading of the list, and the dump itself kept whole. */
class ShortDumps implements IRuntimeDumps<IDumpSummary[], string> {
  readonly kind = 'runtimeDumps' as const;
  async list(): Promise<IAdtResponse<IDumpSummary[]>> {
    return answered([]);
  }
  async listByUser(): Promise<IAdtResponse<IDumpSummary[]>> {
    return answered([]);
  }
  async getById(): Promise<IAdtResponse<string>> {
    return answered('<dump/>');
  }
}
void new ShortDumps();

/** Naming no reading answers the document, so an unchanged consumer compiles. */
declare const dumps: IRuntimeDumps;
const _document: Promise<IAdtResponse<string>> = dumps.getById('D1');
void _document;

/** A caller is made to ask before reading — decision 21, as a type. */
async function _mustAsk(): Promise<string> {
  const answer = await dumps.getById('D1');
  if (!answer.ok) return answer.getError().message;
  return answer.getResult().value;
}
void _mustAsk;

// @ts-expect-error the envelope is not the result any more
const _envelope: Promise<{ status: number }> = dumps.getById('D1');
void _envelope;

/** The keyed record, where five readings would have been five parameters. */
interface MyCrossTrace extends ICrossTraceResults {
  list: string[];
  trace: string;
  records: string;
  recordContent: string;
  activations: string;
}
declare const traces: ICrossTrace<MyCrossTrace>;
const _ids: Promise<IAdtResponse<string[]>> = traces.list();
void _ids;

/**
 * The discriminator survived the inheritance going away.
 *
 * These contracts extended a shared base until 30.0.0, which meant a consumer
 * wanting the listing had to take the kind and vice versa. Each declares what is
 * its own now, and a union still narrows.
 */
declare const anyRuntime: IRuntimeDumps | ISystemMessages;
function _narrow(): string {
  return anyRuntime.kind === 'runtimeDumps' ? 'dumps' : 'messages';
}
void _narrow;

export type { MyCrossTrace, IDumpSummary };
