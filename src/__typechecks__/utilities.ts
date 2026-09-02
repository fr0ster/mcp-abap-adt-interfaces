// Compile-only assertions. If these stop compiling, the types regressed.
//
// The atoms exist so a consumer can take one family and leave the rest, and so
// something written outside this package can stand in for it. Both are asserted
// here rather than assumed: a contract nobody can implement is the failure
// decision 11 names.

import type {
  IAdtDataPreview,
  IAdtDiscovery,
  IAdtGroupLifecycle,
  IAdtInformationSystem,
  IAdtObjectAccess,
  IAdtPackageBrowsing,
  IAdtRepositoryStructure,
  IAdtResponse,
  IGetSqlQueryParams,
  IGetTableContentsParams,
  IRepositoryNodeContents,
  ISearchResult,
} from '../index';

/** One family alone, implemented by something that knows nothing of the others. */
class MyDataPreview implements IAdtDataPreview {
  async getSqlQuery(_p: IGetSqlQueryParams): Promise<IAdtResponse> {
    return { status: 200, statusText: 'OK', data: '', headers: {} };
  }
  async getTableContents(_p: IGetTableContentsParams): Promise<IAdtResponse> {
    return { status: 200, statusText: 'OK', data: '', headers: {} };
  }
}

/** The whole surface is the intersection — spelled, not named. */
type AllUtilities = IAdtInformationSystem &
  IAdtRepositoryStructure &
  IAdtPackageBrowsing &
  IAdtGroupLifecycle &
  IAdtDataPreview &
  IAdtDiscovery &
  IAdtObjectAccess;

declare const utils: AllUtilities;

/** A caller holding the intersection reaches every family. */
const found = utils.search({ query: 'ZCL_X' });
const tree = utils.getPackageHierarchy('ZPKG');
const rows = utils.getTableContents({ table_name: 'T000' });
const inactive = utils.getInactiveObjects();

/** A caller holding one family reaches only that one. */
declare const preview: IAdtDataPreview;
// @ts-expect-error search belongs to the information system, not data preview
preview.search({ query: 'ZCL_X' });

/**
 * An implementation may take arguments the contract does not name.
 *
 * `fetchNodeStructure` drops `withShortDescriptions`: nothing has ever read a
 * description out of that document, so the contract cannot express the flag's
 * effect and does not ask for it. The shipped implementation still accepts one,
 * and that has to keep satisfying the contract — an extra *optional* parameter
 * is assignable, an extra required one is not. Both directions are asserted,
 * because "it compiled when I tried it" is not a thing anyone can re-run.
 */
class NodeReaderWithExtras implements IAdtRepositoryStructure {
  async fetchNodeStructure(
    _parentType: string,
    _parentName: string,
    _nodeId?: string,
    _withShortDescriptions?: boolean,
  ): Promise<IRepositoryNodeContents> {
    return { objects: [], childNodeIds: [] };
  }
  async getObjectStructure(_t: string, _n: string): Promise<IAdtResponse> {
    return { status: 200, statusText: 'OK', data: '', headers: {} };
  }
}

declare const nodes: IAdtRepositoryStructure;
// @ts-expect-error the contract takes three arguments; the flag is not one of them
nodes.fetchNodeStructure('DEVC/K', 'ZPKG', '000000', true);

/**
 * The search strategy: one endpoint, one member, the behaviour chosen by the
 * caller. `mcp-abap-adt` reads `status` and hands the ADT document to a model —
 * that need is served here, with a contract, instead of by a second raw member.
 */
declare const info: IAdtInformationSystem;

/** No parser: the parsed hits, as before. */
const hits: Promise<ISearchResult[]> = info.search({ query: 'ZCL_*' });

/** A parser: the consumer's own type, not `unknown` and not an envelope. */
interface RawHits {
  xml: string;
}
const raw: Promise<RawHits> = info.search({ query: 'ZCL_*' }, (data) => ({
  xml: String(data),
}));

/** A parser yielding the wrong shape is refused. */
// @ts-expect-error the parser yields RawHits, not ISearchResult[]
const wrong: Promise<ISearchResult[]> = info.search(
  { query: 'ZCL_*' },
  (data): RawHits => ({ xml: String(data) }),
);

export {
  MyDataPreview,
  NodeReaderWithExtras,
  found,
  tree,
  rows,
  inactive,
  hits,
  raw,
  wrong,
};
export type { AllUtilities };
