// Compile-only assertions. If these stop compiling, the types regressed.
//
// The client is implementable by something that is not our class — the whole
// point of publishing the contract — and since 31.0.0 the shapes it answers are
// the implementation's. `AbapGitStatus`, `IAbapGitRepoStatus`,
// `IAbapGitPullResult` and the external-repo shapes left with the other result
// types; what a consumer needs to *call* these members stayed.

import type { IAbapGitLinkArgs, IAdtAbapGitClient } from '../adt/IAdtAbapGit';
import type { IAdtResponse } from '../adt/IAdtResponse';

const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
  getError: () => undefined,
});

/** A consumer's own readings of what abapGit answers. */
interface MyRepo {
  key: string;
  branch: string;
}
type MyClient = IAdtAbapGitClient<
  MyRepo[],
  MyRepo | undefined,
  string[],
  void,
  string
>;

/** One member alone, implemented by something that knows nothing of the rest. */
const _client: Pick<MyClient, 'listRepos'> = {
  listRepos: async () => answered([{ key: 'K', branch: 'main' }]),
};
void _client;

/** The progress callback reports this implementation's status, not ours. */
declare const client: MyClient;
void client.pull({
  package: 'ZPKG',
  onProgress: (status: MyRepo | undefined) => {
    void status?.branch;
  },
});

/** Request arguments stayed: a caller cannot call without them. */
const _link: IAbapGitLinkArgs = {} as IAbapGitLinkArgs;
void _link;

export type { MyClient, MyRepo };
