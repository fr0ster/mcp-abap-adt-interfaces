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

export { MyDataPreview, found, tree, rows, inactive };
export type { AllUtilities };
