// Compile-only assertions. If these stop compiling, the types regressed.
//
// **30.2.0 is a minor, and that is a claim about callers' code.** The abapGit
// contracts gained key-based members and the facts forms of `link` and
// `checkExternalRepo`; the legacy members stayed, deprecated, with one additive
// change: the options of `link`, `pull` and `checkExternalRepo` carry
// `credentials?: never`, so a legacy call and a new form can never be mixed.
// Everything a caller wrote against 30.1.x is here and must still compile —
// imported by the package's name, as a consumer imports it.
//
// **It compiles against the built package.** `tsconfig.typecheck-entry.json`
// maps `@mcp-abap-adt/interfaces-adt` to this directory, so the name resolves
// through the manifest's `types` to `dist/index.d.ts`: run it after
// `npm run build` (`npm run test:check` runs both projects).
//
// The one stated exception is pinned at the end: an options *variable* that
// carried an extra, undeclared `credentials` property compiled before (a
// variable is not checked for excess properties) and is now refused.

import type {
  AdtNoFailure,
  IAbapGitExternalRepoCredentials,
  IAbapGitLinkArgs,
  IAbapGitPullArgs,
  IAbapGitUnlinkArgs,
  IAdtAbapGitClient,
  IAdtError,
  IAdtHeaders,
  IAdtResponse,
  IAnalyse,
  IResultStrategy,
} from '@mcp-abap-adt/interfaces-adt';
import { ADT_NO_FAILURE } from '@mcp-abap-adt/interfaces-adt';

const headers: IAdtHeaders = {
  accept: 'application/xml',
  contentType: 'application/xml',
};

/** A custom wire reader — the consumer's own reading of the document. */
interface MyRepo {
  key: string;
  url: string;
}
const readRepos: IResultStrategy<MyRepo[]> = (answer) =>
  String(answer.data) === '' ? [] : [{ key: 'K', url: 'https://h/r' }];
const readLog: IResultStrategy<string> = (answer) => String(answer.data);

type LegacyClient = IAdtAbapGitClient<
  ReturnType<typeof readRepos>,
  ReturnType<typeof readLog>,
  string,
  string
>;
declare const client: LegacyClient;

/** A verdict-only analyser: judges by the library's verdict alone. */
const verdictOnly: IAnalyse = (verdict) => verdict;

/** A wire-reading analyser with its own error subtype. */
interface IMyError extends IAdtError {
  readonly mine: true;
}
const wireReading: IAnalyse<IMyError> = (verdict, answer) =>
  verdict === ADT_NO_FAILURE || answer?.status === 404
    ? ADT_NO_FAILURE
    : { ...verdict, mine: true };

const linkArgs: IAbapGitLinkArgs = {
  package: 'ZPKG',
  url: 'https://h/r',
  remoteUser: 'u',
  remotePassword: 'p',
};
const pullArgs: IAbapGitPullArgs = {
  package: 'ZPKG',
  pullLink: '/sap/bc/adt/abapgit/repos/K/pull',
};
const externalArgs: IAbapGitExternalRepoCredentials = {
  url: 'https://h/r',
  remoteUser: 'u',
};
const unlinkArgs: IAbapGitUnlinkArgs = { repositoryId: 'K' };

// `getErrorLog`, with no callback, with each analyser.
const log0: Promise<IAdtResponse<string>> = client.getErrorLog(
  '/sap/bc/adt/abapgit/repos/K/log/1',
);
const log1: Promise<IAdtResponse<string>> = client.getErrorLog(
  '/sap/bc/adt/abapgit/repos/K/log/1',
  { analyse: verdictOnly },
);
const log2: Promise<IAdtResponse<string, IMyError | IAdtError>> =
  client.getErrorLog('/sap/bc/adt/abapgit/repos/K/log/1', {
    analyse: wireReading,
  });

// `link`, the `remoteUser`/`remotePassword` form, literal and variable args.
const link0: Promise<IAdtResponse<void>> = client.link(linkArgs, { headers });
const link1: Promise<IAdtResponse<void>> = client.link(
  { package: 'ZPKG', url: 'https://h/r', branchName: 'refs/heads/main' },
  { headers, analyse: verdictOnly },
);
const link2: Promise<IAdtResponse<void, IMyError | IAdtError>> = client.link(
  linkArgs,
  {
    headers,
    analyse: wireReading,
  },
);

// `pull` by its link.
const pull0: Promise<IAdtResponse<string>> = client.pull(pullArgs, {
  headers,
});
const pull1: Promise<IAdtResponse<string>> = client.pull(
  { ...pullArgs, branchName: 'refs/heads/main', remoteUser: 'u' },
  { headers, analyse: verdictOnly },
);
const pull2: Promise<IAdtResponse<string, IMyError | IAdtError>> = client.pull(
  pullArgs,
  {
    headers,
    analyse: wireReading,
  },
);

// `checkExternalRepo`, the legacy form.
const ext0: Promise<IAdtResponse<string>> = client.checkExternalRepo(
  externalArgs,
  { headers },
);
const ext1: Promise<IAdtResponse<string>> = client.checkExternalRepo(
  { url: 'https://h/r' },
  { headers, analyse: verdictOnly },
);
const ext2: Promise<IAdtResponse<string, IMyError | IAdtError>> =
  client.checkExternalRepo(externalArgs, { headers, analyse: wireReading });

// The members that did not change at all.
const repos: Promise<IAdtResponse<MyRepo[]>> = client.listRepos();
const unlinked: Promise<IAdtResponse<void, IMyError | IAdtError>> =
  client.unlink(unlinkArgs, { analyse: wireReading });

void [
  log0,
  log1,
  log2,
  link0,
  link1,
  link2,
  pull0,
  pull1,
  pull2,
  ext0,
  ext1,
  ext2,
  repos,
  unlinked,
];

/**
 * A four-parameter implementer written against 30.1.x: its `options`
 * parameters know nothing of `credentials`, and it still satisfies the
 * contract whose options now carry `credentials?: never`.
 */
const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});
class WrittenBefore
  implements IAdtAbapGitClient<MyRepo[], string, string, string>
{
  async link(
    _args: IAbapGitLinkArgs,
    _options: { headers: IAdtHeaders },
  ): Promise<IAdtResponse<void>> {
    return answered(undefined);
  }
  async pull(
    _args: IAbapGitPullArgs,
    _options: { headers: IAdtHeaders },
  ): Promise<IAdtResponse<string>> {
    return answered('');
  }
  async unlink(_args: IAbapGitUnlinkArgs): Promise<IAdtResponse<void>> {
    return answered(undefined);
  }
  async listRepos(): Promise<IAdtResponse<MyRepo[]>> {
    return answered([]);
  }
  async getErrorLog(_logLink: string): Promise<IAdtResponse<string>> {
    return answered('');
  }
  async checkExternalRepo(
    _args: IAbapGitExternalRepoCredentials,
    _options: { headers: IAdtHeaders },
  ): Promise<IAdtResponse<string>> {
    return answered('');
  }
}
void WrittenBefore;

/**
 * The one exception, stated in the CHANGELOG: an options variable carrying an
 * extra `credentials` property. A variable is not checked for excess
 * properties, so this compiled against 30.1.x; `credentials?: never` on the
 * legacy options refuses it now, and the new form does not take legacy args.
 */
const optionsWithExtra = {
  headers,
  credentials: { token: 'secret' },
};
// @ts-expect-error an undeclared `credentials` on legacy options is refused since 30.2.0
void client.link(linkArgs, optionsWithExtra);
// @ts-expect-error the same for `pull`
void client.pull(pullArgs, optionsWithExtra);
// @ts-expect-error and for `checkExternalRepo`
void client.checkExternalRepo(externalArgs, optionsWithExtra);

/**
 * The same through each generic overload: an explicit error type leaves the
 * plain overload out, so each guard is proved on its own.
 */
const analysedWithExtra = {
  headers,
  credentials: { token: 'secret' },
  analyse: wireReading,
};
// @ts-expect-error the generic `link` refuses an undeclared `credentials`
void client.link<IMyError>(linkArgs, analysedWithExtra);
// @ts-expect-error the generic `pull` refuses it
void client.pull<IMyError>(pullArgs, analysedWithExtra);
// @ts-expect-error the generic `checkExternalRepo` refuses it
void client.checkExternalRepo<IMyError>(externalArgs, analysedWithExtra);

/** What an analyser answers is still a verdict, never `undefined`. */
const _verdict: AdtNoFailure = ADT_NO_FAILURE;
void _verdict;
