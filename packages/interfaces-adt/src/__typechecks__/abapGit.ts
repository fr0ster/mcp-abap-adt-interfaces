// Compile-only assertions. If these stop compiling, the types regressed.
//
// The client is implementable by something that is not our class — the whole
// point of publishing the contract — and since 31.0.0 the shapes it answers are
// the implementation's. `AbapGitStatus`, `IAbapGitRepoStatus`,
// `IAbapGitPullResult` and the external-repo shapes left with the other result
// types; what a consumer needs to *call* these members stayed.
//
// Imported by the package's name and compiled against the built package:
// `tsconfig.typecheck-entry.json` resolves `@mcp-abap-adt/interfaces-adt`
// through the manifest's `types` to `dist/index.d.ts`, after `npm run build`.

import type {
  IAbapGitLinkArgs,
  IAdtAbapGitClient,
  IAdtError,
  IAdtHeaders,
  IAdtResponse,
} from '@mcp-abap-adt/interfaces-adt';

const headers: IAdtHeaders = {
  accept: 'application/xml',
  contentType: 'application/xml',
};

const answered = <T>(value: T): IAdtResponse<T> => ({
  ok: true,
  getResult: () => ({ value }),
});

/** A consumer's own readings of what abapGit answers. */
interface MyRepo {
  key: string;
  branch: string;
}
type MyClient = IAdtAbapGitClient<MyRepo[], string[], void, string>;

/** One member alone, implemented by something that knows nothing of the rest. */
const _client: Pick<MyClient, 'listRepos'> = {
  listRepos: async () => answered([{ key: 'K', branch: 'main' }]),
};
void _client;

/**
 * A pull is started, not awaited.
 *
 * The link comes from `listRepos`, and what happens after the POST — how long
 * to poll `listRepos`, whether to give up, what to do then — is written by the
 * caller, because it is about their application rather than about ADT.
 */
declare const client: MyClient;
void client.pull(
  {
    package: 'ZPKG',
    pullLink: '/sap/bc/adt/abapgit/repos/K/pull',
  },
  { headers },
);

// @ts-expect-error a pull cannot be started without the link it posts to
void client.pull({ package: 'ZPKG' });

/**
 * One request per member since 11.0.0: each is addressed by what `listRepos`
 * reported, and none looks a package up in the list first.
 */
void client.unlink({ repositoryId: 'K' });
void client.getErrorLog('/sap/bc/adt/abapgit/repos/K/log');

// @ts-expect-error unlink is addressed by the repository's key, not its package
void client.unlink({ package: 'ZPKG' });

// @ts-expect-error getRepo left: it filtered listRepos, which is a reading
void client.getRepo('ZPKG');

/** Request arguments stayed: a caller cannot call without them. */
const _link: IAbapGitLinkArgs = {} as IAbapGitLinkArgs;
void _link;

export type { MyClient, MyRepo };

// ---------------------------------------------------------------------------
// 30.2.0 — the key-based members and the facts forms.
//
// Each is its own atom, generic over the result its slot's reader gives (`T`)
// and the facts its route's reducer gives (`F`) separately: the analyser sees
// `F`, the caller reads `T`. None has a wire-typed overload — the analyser is
// handed the facts, never the document — and the default error keeps `.facts`.

import type {
  IAbapGitCredentials,
  IAbapGitFactsAnalyse,
  IAbapGitFactsResponse,
  IAbapGitFactsResultStrategy,
  IAbapGitStructuredError,
  IAdtAbapGitBranchInfo,
  IAdtAbapGitCheckExternalRepoNewForm,
  IAdtAbapGitCheckRepo,
  IAdtAbapGitFile,
  IAdtAbapGitLinkNewForm,
  IAdtAbapGitListReposQuiet,
  IAdtAbapGitModifiedObjects,
  IAdtAbapGitPullRepo,
  IAdtAbapGitPullRepoInDialog,
  IAdtAbapGitPush,
  IAdtAbapGitRunLog,
  IAdtAbapGitStaging,
  IAdtAbapGitStatus,
  IAdtAbapGitSwitchBranch,
  IAnalyse,
  IResultStrategy,
} from '@mcp-abap-adt/interfaces-adt';
import { ADT_NO_FAILURE } from '@mcp-abap-adt/interfaces-adt';

/** What a route's reducer gives (the analyser's view). */
interface RunFacts {
  readonly objects: readonly { readonly name: string }[];
}
/** What the slot's reader gives (the caller's view) — another type on purpose. */
interface RunView {
  readonly count: number;
}

/** The caller's own error subtype, carried through the generic overload. */
interface IMyGitError extends IAbapGitStructuredError {
  readonly mine: true;
}
const myAnalyse: IAbapGitFactsAnalyse<RunFacts, IMyGitError> = (
  verdict,
  answer,
) =>
  verdict === ADT_NO_FAILURE || answer?.facts.objects.length === 0
    ? ADT_NO_FAILURE
    : { ...verdict, mine: true };

type NewClient = IAdtAbapGitListReposQuiet<RunView, RunFacts> &
  IAdtAbapGitPullRepo<RunView, RunFacts> &
  IAdtAbapGitPullRepoInDialog<RunView, RunFacts> &
  IAdtAbapGitBranchInfo<RunView, RunFacts> &
  IAdtAbapGitModifiedObjects<RunView, RunFacts> &
  IAdtAbapGitStatus<RunView, RunFacts> &
  IAdtAbapGitStaging<RunView, RunFacts> &
  IAdtAbapGitCheckRepo<RunView, RunFacts> &
  IAdtAbapGitRunLog<RunView, RunFacts> &
  IAdtAbapGitPush<RunView, RunFacts> &
  IAdtAbapGitFile<RunView, RunFacts> &
  IAdtAbapGitSwitchBranch<RunView, RunFacts>;
declare const git: NewClient;

/** The legacy client and the new forms of `link` / `checkExternalRepo`, side by side. */
type BothForms = IAdtAbapGitClient<MyRepo[], string, void, string> &
  IAdtAbapGitLinkNewForm<RunView, RunFacts> &
  IAdtAbapGitCheckExternalRepoNewForm<RunView, RunFacts>;
declare const both: BothForms;

const credentials: IAbapGitCredentials = { user: 'u', password: 'p' };
const pullRepoArgs = { key: 'K', branchName: 'refs/heads/main' } as const;
const newLinkArgs = {
  package: 'ZPKG',
  url: 'https://h/r',
  branchName: 'refs/heads/main',
} as const;

async function inference(): Promise<void> {
  // Error-subtype inference: `getError()` is the caller's type, no cast.
  const run = await git.getRunLog(
    { key: 'K', appLogKey: 'L' },
    { analyse: myAnalyse },
  );
  if (!run.ok) {
    const mine: true = run.getError().mine;
    void mine;
  } else {
    const count: number = run.getResult().value.count;
    void count;
  }

  const pulled = await git.pullRepo(pullRepoArgs, {
    headers,
    analyse: myAnalyse,
  });
  if (!pulled.ok) void (pulled.getError().mine satisfies true);

  const pushed = await git.push(
    {
      key: 'K',
      staged: [],
      comment: {
        text: 'commit',
        author: { name: 'A', email: 'a@h' },
        committer: { name: 'C', email: 'c@h' },
      },
    },
    { analyse: myAnalyse },
  );
  if (!pushed.ok) void (pushed.getError().mine satisfies true);

  const linked = await both.link(newLinkArgs, {
    headers,
    credentials,
    analyse: myAnalyse,
  });
  if (!linked.ok) void (linked.getError().mine satisfies true);
  else void (linked.getResult().value satisfies RunView);

  // The no-analyser overload: the default error keeps its facts.
  const quiet = await git.listReposQuiet();
  if (!quiet.ok) {
    const error: IAbapGitStructuredError = quiet.getError();
    const status: number = error.facts.status;
    const messageClass: string | undefined = error.facts.messageClass;
    const path: string | undefined = error.request?.path;
    void [status, messageClass, path];
  }

  // `null` is the anonymous new form; it answers the new form's `T`.
  const anonymous = await both.checkExternalRepo(
    { url: 'https://h/r' },
    { headers, credentials: null },
  );
  if (anonymous.ok) void (anonymous.getResult().value satisfies RunView);

  // The edge case's other half: an options variable whose `credentials` is a
  // credential, with args that fit, selects the new form.
  const variableOptions = { headers, credentials };
  const selected = await both.link(newLinkArgs, variableOptions);
  if (selected.ok) void (selected.getResult().value satisfies RunView);

  // A key-based member without headers takes no options at all.
  void git.getStatus({ key: 'K' });
  void git.getFile({ key: 'K', filename: 'a.xml', version: 'remote' });
  void git.switchBranch({ key: 'K', branch: 'main', create: false });
  void git.getBranchInfo(
    { url: 'https://h/r', branch: 'main', package: 'ZPKG' },
    { headers, credentials },
  );
}
void inference;

/** A facts reader is handed the facts answer, not the wire document. */
const reader: IAbapGitFactsResultStrategy<RunView, RunFacts> = (
  answer: IAbapGitFactsResponse<RunFacts>,
) => ({ count: answer.facts.objects.length });
void reader;

// --- What is refused -------------------------------------------------------

// @ts-expect-error both forms mixed, literal: legacy args with a credential
void both.link({ ...newLinkArgs, remoteUser: 'u' }, { headers, credentials });

const legacyLinkArgs: IAbapGitLinkArgs = {
  package: 'ZPKG',
  url: 'https://h/r',
  branchName: 'refs/heads/main',
  remoteUser: 'u',
};
const newFormOptions = { headers, credentials };
// @ts-expect-error both forms mixed, variables: legacy args, new-form options
void both.link(legacyLinkArgs, newFormOptions);

// Only `remoteUser?: never` refuses this one: an un-annotated variable is not
// checked for excess properties, and every other field fits the new form.
const mixedArgs = { ...newLinkArgs, remoteUser: 'u' };
// @ts-expect-error both forms mixed, variables: new-form args with `remoteUser`
void both.link(mixedArgs, newFormOptions);

// @ts-expect-error `credentials: undefined` is not a new form — the field is required
void both.link(newLinkArgs, { headers, credentials: undefined });

const legacyExternalArgs = { url: 'https://h/r', remoteUser: 'u' };
const anonymousOptions = { headers, credentials: null };
// @ts-expect-error `credentials: null` on a legacy call
void both.checkExternalRepo(legacyExternalArgs, anonymousOptions);

const wireAnalyse: IAnalyse = (verdict) => verdict;
// @ts-expect-error an `IAnalyse` (wire-reading) on `pullRepo`
void git.pullRepo(pullRepoArgs, { headers, analyse: wireAnalyse });
// @ts-expect-error an `IAnalyse` on `pullRepo`, through the generic overload
void git.pullRepo<IMyGitError>(pullRepoArgs, { headers, analyse: wireAnalyse });

const wireReader: IResultStrategy<RunView> = () => ({ count: 0 });
// @ts-expect-error an `IResultStrategy` is not a facts reader
const _asFacts: IAbapGitFactsResultStrategy<RunView, RunFacts> = wireReader;
void _asFacts;

// @ts-expect-error a missing `headers` on an H member
void git.pullRepoInDialog(pullRepoArgs, {});
// @ts-expect-error an H member takes its options
void git.getBranchInfo({ url: 'https://h/r', branch: 'main', package: 'ZPKG' });

void git.push({
  key: 'K',
  staged: [],
  // @ts-expect-error `push` without `comment.committer`
  comment: { text: 'commit', author: { name: 'A', email: 'a@h' } },
});

// @ts-expect-error `switchBranch` without `create`
void git.switchBranch({ key: 'K', branch: 'main' });

// @ts-expect-error `getFile` with `version: 'head'`
void git.getFile({ key: 'K', filename: 'a.xml', version: 'head' });

// @ts-expect-error `pullRepo` without `branchName`
void git.pullRepo({ key: 'K' }, { headers });

// @ts-expect-error `listReposQuiet` sends no credential, so it takes none
void git.listReposQuiet({ credentials });

// --- No free text through `rfc` --------------------------------------------
//
// `IAdtError.rfc` carries the RFC SDK's `key`, free text the SDK fills. A
// facts error keeps the status and the T100 key only, so it carries no `rfc`.
declare const factsError: IAbapGitStructuredError;
// @ts-expect-error a facts error has no `rfc` to read text from
void factsError.rfc?.key;
declare const sdkRfc: NonNullable<IAdtError['rfc']>;
const withRfc = {
  origin: 'connection' as const,
  message: 'fixed words',
  facts: { status: 0 },
  rfc: sdkRfc,
};
// @ts-expect-error a facts error cannot be built carrying `rfc`
const _withRfc: IAbapGitStructuredError = withRfc;
void _withRfc;

// --- `credentials` is required on the standalone new forms ------------------
//
// Without the legacy client beside them, no legacy overload can take a call
// that leaves `credentials` out.
declare const linkOnly: IAdtAbapGitLinkNewForm<RunView, RunFacts>;
declare const externalOnly: IAdtAbapGitCheckExternalRepoNewForm<
  RunView,
  RunFacts
>;
// @ts-expect-error the new `link` without `credentials`
void linkOnly.link(newLinkArgs, { headers });
// @ts-expect-error the new `checkExternalRepo` without `credentials`
void externalOnly.checkExternalRepo({ url: 'https://h/r' }, { headers });
