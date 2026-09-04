// Compile-only assertions. If these stop compiling, the types regressed.

import type {
  AbapGitStatus,
  IAbapGitLinkArgs,
  IAbapGitPullResult,
  IAdtAbapGitClient,
} from '../adt/IAdtAbapGit';

// A documented status code is a valid AbapGitStatus.
const _status: AbapGitStatus = 'A';
void _status;

// The union is intentionally open (trailing `| string`): SAP may return a
// status this package does not enumerate, and that is still a valid
// AbapGitStatus, not a type error.
const _forwardCompatible: AbapGitStatus = 'definitely-not-a-status';
void _forwardCompatible;

// The client interface is implementable by something that is not our class —
// which is the whole point of publishing it.
const _client: Pick<IAdtAbapGitClient, 'listRepos'> = {
  listRepos: async () => ({
    ok: true,
    getResult: () => ({ value: [] }),
    getError: () => undefined,
  }),
};
void _client;

const _link: IAbapGitLinkArgs = {} as IAbapGitLinkArgs;
const _pull: IAbapGitPullResult = {} as IAbapGitPullResult;
void _link;
void _pull;
