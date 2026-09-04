// Compile-only assertions. If these stop compiling, the types regressed.
//
// The atoms exist so a consumer can take one family and leave the rest, and so
// something written outside this package can stand in for it. Both are asserted
// here rather than assumed: a contract nobody can implement is the failure
// decision 11 names.

/**
 * A consumer's own readings. Since 31.0.0 the contract declares no result
 * shapes, so a file proving the contract is implementable has to bring its own —
 * which is the assertion, not an inconvenience.
 */
interface MyItem {
  name: string;
  type: string;
}
interface MyNode {
  objects: MyItem[];
  childNodes: { objectType: string; nodeId: string }[];
}
interface MyHit {
  name: string;
  type: string;
}
interface MyWhereUsed {
  references: MyHit[];
}
interface MyTypes {
  types: string[];
}

import type {
  IAdtDataPreview,
  IAdtDiscovery,
  IAdtGroupLifecycle,
  IAdtInformationSystem,
  IAdtObjectAccess,
  IAdtPackageBrowsing,
  IAdtRepositoryStructure,
  IAdtResponse,
  IGetNodeContentsOptions,
  IGetSqlQueryParams,
  IGetTableContentsParams,
} from '../index';

/** What a consumer's implementation returns when it succeeded. */
const succeeded = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
  getError: () => undefined,
});

/** One family alone, implemented by something that knows nothing of the others. */
class MyDataPreview implements IAdtDataPreview {
  async getSqlQuery(_p: IGetSqlQueryParams): Promise<IAdtResponse<string>> {
    return succeeded('');
  }
  async getTableContents(
    _p: IGetTableContentsParams,
  ): Promise<IAdtResponse<string>> {
    return succeeded('');
  }
}

/** The whole surface is the intersection — spelled, not named. */
type AllUtilities = IAdtInformationSystem<MyHit[], MyWhereUsed, MyTypes> &
  IAdtRepositoryStructure<MyNode> &
  IAdtPackageBrowsing<MyItem[]> &
  IAdtGroupLifecycle<string> &
  IAdtDataPreview &
  IAdtDiscovery &
  IAdtObjectAccess;

declare const utils: AllUtilities;

/** A caller holding the intersection reaches every family. */
const found = utils.search({ query: 'ZCL_X' });
const contents = utils.getPackageContents('ZPKG');
const rows = utils.getTableContents({ table_name: 'T000' });
const inactive = utils.getInactiveObjects();

/** A caller holding one family reaches only that one. */
declare const preview: IAdtDataPreview;
// @ts-expect-error search belongs to the information system, not data preview
preview.search({ query: 'ZCL_X' });

/**
 * An implementation may take arguments the contract does not name.
 *
 * An extra *optional* parameter is assignable, an extra required one is not.
 * Both directions are asserted, because "it compiled when I tried it" is not a
 * thing anyone can re-run.
 */
class NodeReaderWithExtras implements IAdtRepositoryStructure<MyNode> {
  async fetchNodeStructure(
    _parentType: string,
    _parentName: string,
    _options?: IGetNodeContentsOptions,
    _trace?: boolean,
  ): Promise<IAdtResponse<MyNode>> {
    return succeeded({ objects: [], childNodes: [] });
  }
  async getObjectStructure(
    _t: string,
    _n: string,
  ): Promise<IAdtResponse<string>> {
    return succeeded('');
  }
}

declare const nodes: IAdtRepositoryStructure<MyNode>;
// @ts-expect-error the contract takes an options object; a bare node id is not it
nodes.fetchNodeStructure('DEVC/K', 'ZPKG', '000000');

/**
 * One question, four readings, and the reading is the implementation's — chosen
 * when it was constructed, not at the call. This is what the two members
 * `getPackageContentsList` and `getPackageHierarchy` could not offer: a caller
 * got whichever shape the method name had decided, and the document was gone.
 */
class TreeBrowsing implements IAdtPackageBrowsing<MyNode> {
  async getPackageContents(
    _packageName: string,
  ): Promise<IAdtResponse<MyNode>> {
    return succeeded({ objects: [], childNodes: [] });
  }
}

/** The backup consumer's reading, which 29.0.0 could not express at all. */
class RawBrowsing implements IAdtPackageBrowsing<string> {
  async getPackageContents(): Promise<IAdtResponse<string>> {
    return succeeded('<asx:abap/>');
  }
}

/** Naming no strategy answers what the list member answered before. */
declare const browsing: IAdtPackageBrowsing<MyItem[]>;
const listed: Promise<IAdtResponse<MyItem[]>> =
  browsing.getPackageContents('ZPKG');

/**
 * The question 26.2.0's shape could not answer.
 *
 * A walk asks "which node holds the includes" and follows that id. With bare
 * `childNodeIds` the type is gone and the caller is back at the raw document —
 * which is what this contract exists to prevent, so it is asserted rather than
 * left to be discovered by the next consumer.
 */
async function idOfType(
  structure: IAdtRepositoryStructure<MyNode>,
  wanted: string,
): Promise<string | undefined> {
  const answer = await structure.fetchNodeStructure('PROG/P', 'ZMY_PROGRAM');
  if (!answer.ok) {
    // The contract makes this branch unavoidable, which is the point: a walk
    // cannot silently treat a refusal as a level with nothing under it.
    return undefined;
  }
  return answer
    .getResult()
    .value.childNodes.find(
      (c: MyNode['childNodes'][number]) => c.objectType === wanted,
    )?.nodeId;
}

/**
 * The search strategy: one endpoint, one member, the behaviour chosen by the
 * caller. `mcp-abap-adt` reads `status` and hands the ADT document to a model —
 * that need is served here, with a contract, instead of by a second raw member.
 */
declare const info: IAdtInformationSystem<MyHit[], MyWhereUsed, MyTypes>;

/** Naming no strategy: the parsed hits, as before. */
const hits: Promise<IAdtResponse<MyHit[]>> = info.search({
  query: 'ZCL_*',
});

/** A consumer's own type, chosen once — not `unknown`, and not an envelope. */
interface RawHits {
  xml: string;
}
declare const rawInfo: IAdtInformationSystem<RawHits, MyWhereUsed, MyTypes>;
const raw: Promise<IAdtResponse<RawHits>> = rawInfo.search({ query: 'ZCL_*' });

/** The choice is the implementation's, so the wrong shape cannot be asked for. */
// @ts-expect-error this implementation answers RawHits, not MyHit[]
const wrong: Promise<IAdtResponse<MyHit[]>> = rawInfo.search({
  query: 'ZCL_*',
});

/** No member takes a parser any more. */
// @ts-expect-error search takes the criteria and nothing else
info.search({ query: 'ZCL_*' }, (data: unknown) => String(data));

export {
  idOfType,
  MyDataPreview,
  NodeReaderWithExtras,
  RawBrowsing,
  TreeBrowsing,
  found,
  contents,
  listed,
  rows,
  inactive,
  hits,
  raw,
  wrong,
};
export type { AllUtilities };
