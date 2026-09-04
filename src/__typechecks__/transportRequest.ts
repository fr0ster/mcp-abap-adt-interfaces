// Compile-only assertions. If these stop compiling, the types regressed.
//
// `IAdtRequest` exists so a consumer is not bound to one implementation. The
// case that matters is therefore not "the shipped class fits" — it is that
// something written entirely outside the package fits too, and that a caller
// holding the contract can reach everything the handler is for.

import type { IAdtResponse } from '../adt/IAdtResponse';
import type {
  IAdtCreatable,
  IAdtRequest,
  IListTransportsOptions,
  ITransportConfig,
  ITransportTree,
} from '../index';

/** A success, built by hand — these proofs are about the shape, not the helper. */
function answered<T>(value: T): IAdtResponse<T> {
  return { ok: true, getResult: () => ({ value }), getError: () => undefined };
}

/** A consumer's own handler. Nothing here comes from the implementation. */
class MyOwnRequests implements IAdtRequest {
  async create(config: ITransportConfig): Promise<IAdtResponse<string>> {
    return answered(config.description);
  }
  async read(
    _config: Partial<ITransportConfig>,
  ): Promise<IAdtResponse<string>> {
    return answered('');
  }
  async readMetadata(
    _config: Partial<ITransportConfig>,
  ): Promise<IAdtResponse<string>> {
    return answered('');
  }
  async update(
    _config: Partial<ITransportConfig>,
  ): Promise<IAdtResponse<void>> {
    return answered(undefined);
  }
  async delete(
    _config: Partial<ITransportConfig>,
  ): Promise<IAdtResponse<void>> {
    return answered(undefined);
  }
  async list(
    _options?: IListTransportsOptions,
  ): Promise<IAdtResponse<ITransportTree>> {
    return answered({ attributes: {}, requests: [] });
  }
}

declare const requests: IAdtRequest;

/** The default tree, from the contract alone. */
const tree: Promise<IAdtResponse<ITransportTree>> = requests.list();

/**
 * A consumer's own shape, chosen when the implementation was constructed — the
 * reading `listNodes(parse)` used to take at the call. One member, one reading
 * per implementation, and the type says which.
 */
interface MyShape {
  ids: string[];
}
declare const mineRequests: IAdtRequest<MyShape>;
const mine: Promise<IAdtResponse<MyShape>> = mineRequests.list();

/**
 * The CRUD half is composed, not inherited.
 *
 * `IAdtRequest` declares what is the transport's alone; a caller who also wants
 * to create one spells the atom beside it. That is what "minimal interfaces,
 * composed" buys: an implementation that only lists transports is a legitimate
 * implementation of the listing contract, and a caller who needs both says so in
 * the type instead of being handed eight members because they wanted one.
 */
type Requests = IAdtRequest & IAdtCreatable<ITransportConfig, string>;
declare const both: Requests;
const created: Promise<IAdtResponse<string>> = both.create({
  description: 'x',
});

/** The implementation's reading is the one that comes back. */
// @ts-expect-error this implementation answers MyShape, not ITransportTree
const wrong: Promise<IAdtResponse<ITransportTree>> = mineRequests.list();

/** No member takes a parser any more. */
// @ts-expect-error list takes options and nothing else
requests.list((data: unknown) => String(data));

export { MyOwnRequests, tree, mine, created, wrong };
