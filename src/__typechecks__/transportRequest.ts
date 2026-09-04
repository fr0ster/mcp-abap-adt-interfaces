// Compile-only assertions. If these stop compiling, the types regressed.
//
// `IAdtRequest` exists so a consumer is not bound to one implementation. The
// case that matters is therefore not "the shipped class fits" — it is that
// something written entirely outside the package fits too, and that a caller
// holding the contract can reach everything the handler is for.

import type { IAdtResponse } from '../adt/IAdtResponse';
import type {
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
  async list(_options?: IListTransportsOptions): Promise<ITransportTree> {
    return { attributes: {}, requests: [] };
  }
  async listNodes(options?: IListTransportsOptions): Promise<ITransportTree>;
  async listNodes<T>(
    parse: (data: unknown) => T,
    options?: IListTransportsOptions,
  ): Promise<T>;
  async listNodes<T>(
    first?: IListTransportsOptions | ((data: unknown) => T),
    _second?: IListTransportsOptions,
  ): Promise<ITransportTree | T> {
    return typeof first === 'function'
      ? first(undefined)
      : { attributes: {}, requests: [] };
  }
}

declare const requests: IAdtRequest;

/** The default tree, from the contract alone. */
const tree: Promise<ITransportTree> = requests.listNodes();

/** A consumer's own parser, and its own type comes back — not `unknown`. */
interface MyShape {
  ids: string[];
}
const mine: Promise<MyShape> = requests.listNodes(
  (data): MyShape => ({ ids: [String(data)] }),
);

/**
 * The CRUD half is reachable through the contract, not only the class — and it
 * answers `IAdtResponse`, so a caller is made to check before reading.
 */
const created: Promise<IAdtResponse<string>> = requests.create({
  description: 'x',
});

/** A parser returning the wrong shape is refused. */
// @ts-expect-error the parser yields MyShape, not ITransportTree
const wrong: Promise<ITransportTree> = requests.listNodes(
  (data): MyShape => ({ ids: [String(data)] }),
);

export { MyOwnRequests, tree, mine, created, wrong };
