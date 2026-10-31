# @mcp-abap-adt/interfaces-adt

ADT contracts: object operations, runtime analysis, execution, feeds and service bindings. The ABAP connection they are sent through is [`interfaces-adt-connection`](../interfaces-adt-connection).

## TL;DR

- **Only ADT.** The test is who imports this package: `@mcp-abap-adt/adt-clients` and whatever replaces its objects, and nobody else. Measured against every repository in development before 11.0.0 — the only others reaching in were `gcts-client` and `cloud-llm-hub`, for `IAbapConnection`, `IAbapRequestOptions` and `IAdtResponse`. Since 11.0.0 the first two come from `interfaces-adt-connection`; `IAdtResponse` is still here.
- What it holds: ADT object operations for 31 object types, the ADT type tables per release variant, runtime analysis, execution, feeds, service bindings, `IAdtResponse` and the error codes. **The ABAP connection** — `IAbapConnection`, `IAdtWireResponse`, its capability atoms, `ITimeoutConfig` — is [`interfaces-adt-connection`](../interfaces-adt-connection) since 11.0.0, and is not re-exported here.
- **What left, and where.** Every HTTP header name, the HTTP frame and `HttpError` → [`interfaces-network`](../interfaces-network). Cloud ALM → [`interfaces-calm`](../interfaces-calm). `XmlNode` → [`interfaces-utils`](../interfaces-utils). Authentication in general — credentials, OAuth grants, tokens, interactive login, SAML assertions, `AUTH_TYPE_JWT`/`BASIC` → [`interfaces-auth`](../interfaces-auth). Everything naming SAP or BTP — `ISapConfig`, `SapAuthType`, `SapConnectionType`, `IConfig`, `IConnectionConfig`, `IAuthorizationConfig`, `ICertificateMaterialLoader`, `IServiceKeyStore`, `ISessionStore`, `ITokenProviderResult`, the two validation results and `AUTH_TYPE_XSUAA` with its union → [`interfaces-auth-sap`](../interfaces-auth-sap). Of those, `IConfig`, `IConnectionConfig`, `IServiceKeyStore`, `ISessionStore` and `ITokenProviderResult` moved on to [`interfaces-auth-broker`](../interfaces-auth-broker) in `interfaces-auth-sap` 2.0.0. `ISessionState` and `ISessionStorage` are deleted, not moved.
- `IAdtWireResponse` extends `IHttpWireResponse` from `-network` and keeps the headers ADT sends (`sap-adt-location`, both spellings of `content-location`). It lives in `interfaces-adt-connection` since 11.0.0, name and shape unchanged.
- Since 14.0.0 `IDebuggerIdentity` is a union by `debuggingMode` (required), `attach` takes the identity, `condition` is for line breakpoints only, and `IAbapDebugger` gains `TSettings` and five members. The CHANGELOG has the migration note.
- Since 15.0.0 `skipCount` is gone from breakpoints (the server ignores it) and `clientId` pairs an answer row with its request. The CHANGELOG has the migration note.
- Since 15.1.0 the plain class and program run take `debuggee` (`IDebuggeeIds`): the terminal id and IDE id a terminal-mode listener catches the run by.
- Since 23.1.0 the ABAP Unit run registry: `ABAP_UNIT_RUN_TYPES`, every `osl:object type` value a run may name, what a run of it runs and on what evidence; `AbapUnitRunObjectType` (its keys), `AbapUnitRunTarget` (an object or a package) and the generic runner contract `IAbapUnitRunner`. Additions only. See "The ABAP Unit run registry".
- Since 23.0.4 the tables list `read`, `source` and `update` for `FUGR/F` (S/4HANA and ABAP cloud), and `IFunctionGroupResults` has a required `updated` slot.
- Since 23.0.3 the tables list `updateMetadata` for `SRVB/SVB`, and `IServiceResults` has a required `metadataUpdated` slot.
- Since 23.0.2 the tables list `updateMetadata` for `DCLS/DL`, `DDLX/EX`, `BDEF/BDO`, `SRVD/SRV`, `DSFD/SCF`, `XSLT/VT`, `TABL/DT` and `TABL/DS` (and `PROG/I` on S/4HANA), and their results contracts have a required `metadataUpdated` slot.
- Since 23.0.1 `IClassResults`, `IInterfaceResults`, `IProgramResults`, `IFunctionModuleResults` and `IDdlResults` have a required `metadataUpdated` slot — the answer of `updateMetadata`, which the tables list for these codes; a results set built for them adds it.
- Since 23.0.0, a program and an include on ABAP cloud list only what a delivered one answers (no create, change, transport, run or profile), and a feature toggle is only read there (see "Migrating to 23.0.0"); since 22.0.0, and `updateMetadata` is listed where it was measured. Beside that, additions only: intersecting helpers (`AdtCodeOf<V>`, `AdtCodeWith<V, Op>`, `AdtServingVariantsIn`, `AdtPerformingVariantsIn`; the default `AdtModernVariant` gets what both newer tables serve), utility code tables per variant (`ADT_UTILITY_CODES_*`: the group-only `VIEW/DV`, `DEVC/K` in a modern group activation and in 7.40's node structure), group references per operation with the typed atoms `IAdtTypedGroupLifecycle` and `IAdtTypedWhereUsed`, and `IAdtTypeStructure` with its `IUtilResults.typeStructure` slot. See "Intersections, group-only codes and group references".
- Since 21.0.0 the object type codes are the library's own tables — `ADT_TYPES_ONPREM` (S/4HANA 2025), `ADT_TYPES_CLOUD` (ABAP cloud), `ADT_TYPES_BASIS_740` (SAP_BASIS 7.40 SP04), keyed by API — and every code in a contract is an `AdtTypeCode` drawn from them. `AdtObjectTypeLower`, `AdtObjectType`, `AdtSourceObjectTypeLower` and `AdtSourceObjectType` are removed, and with them the codes no release lists. An identifying atom takes the parent's field as its last type parameter (`TParent`, default `never`, which leaves the config `Partial<TConfig>` as before), and `IObjectReference<C>` requires `parentName` for a code with a parent. A code read from an answer is an `IAdtAnsweredObject`. See "The ADT type tables" and "Migrating to 21.0.0".
- Since 20.2.0 every object's result-set contract (`IClassResults`, `IProgramResults`, … 30 in all, `IMessageClassMessageResults<TRead, TWritten, TDeleted>` among them) and `IServiceBindingPublicationConfig` are declared here, in the object's own `IAdtX.ts`: the slot map an implementation is constructed with, each slot an `IResultStrategy<unknown>`. A consumer composes its client contract from these and the atoms. Additions only.
- Since 20.1.0 `IAdtObjectProperties` reads one repository object's properties from `/informationsystem/objectproperties/values?uri=`, any object uri (a transaction by its `vit` workbench uri); its own atom, not part of `IAdtInformationSystem`.
- Since 20.0.0 `IAdtClientOptions` has no `enableAcceptCorrection`: correcting a refused format is the consumer's own. See "Migrating to 20.0.0".
- Since 19.0.0 a member whose request sets both `Accept` and `Content-Type` takes the pair as `options.headers: IAdtHeaders`, **required**, and sends exactly that pair; a member whose request sets one of them or neither is unchanged. See "A request's own headers" and "Migrating to 19.0.0".
- Since 15.3.0 `IAdtTransportMoveObjects` moves entries from one task to another, each identified by its position in the source.
- Since 15.2.0 `IAdtTransportSortAndCompress` sorts and compresses a task's object list, the remedy SAP names when `removeObject` is refused for a duplicated entry.
- Since 13.0.0 `IResultStrategy`, `IAnalyse` and `IAdtFailure.response` hand over an `IAdtWireResponse` whose `data` is `unknown`, not `any` (`interfaces-adt-connection` 2.0.0): narrow it before reading. The CHANGELOG has the migration note.
- Depends on `@mcp-abap-adt/interfaces-adt-connection` ^3.0.0, and on nothing else. Types and constants; no implementation.

## Install

```bash
npm install @mcp-abap-adt/interfaces-adt
```

## What it holds

| directory | files | what |
|---|---|---|
| `adt/` | 43 | the object contracts: capability atoms, the object types, the ADT type tables and their entry shape, `IAdtResponse`, `IAdtError`, the error codes, the transport request's object list |
| `runtime/` | 14 | runtime analysis: the debuggers (`IAbapDebugger`, `IAmdpDebugger`) and `IMemorySnapshots`, `IProfiler`, the trace contracts (`ITraceListing`/`ITraceReading`, `ICrossTrace`, `ISt05Trace`), `IApplicationLog`, `IAtcLog` and the ATC run (`IAtcRunOptions`, `IAtcFindings`), `IDdicActivation`, `IGatewayErrorLog`, `IRuntimeDumps`, `ISystemMessages` |
| `execution/` | 3 | class and program execution, with profiling |
| `feeds/` | 2 | the ADT feed contracts |
| `service/` | 1 | service definitions and bindings |
| `shared/` | 1 | what more than one object type needs |

Six directories, all ADT. `connection/` left for `interfaces-adt-connection` in 11.0.0. `sap/`, `auth/`, `token/`, `session/`, `serviceKey/`, `store/`, `validation/` and `Headers.ts` were here until 9.0.0 and are listed above under what left; `__typechecks__/` holds 31 files that compile shapes this contract must and must not accept, and ships in no tarball.

The contract rules — what a member answers, how a strategy is supplied, how a contract is built — are in [`docs/architecture/ARCHITECTURE.md`](../../docs/architecture/ARCHITECTURE.md). Domain-by-domain documentation with examples used to sit in the facade's README; the facade is deleted, and each package documents its own contracts.

**There is no facade to stay compatible with.** It was pinned to its 44.0.0 surface in both directions — nothing from that release could disappear from it and nothing could appear without being written down — and `tools/check-surface.js`, `surface-44.0.0.txt`, `baseline-44.0.0.json` and `surface-added.txt` existed to enforce exactly that. The facade is deleted in its 52.0.0 (decision 34), so the property is gone along with the files that proved it; git holds them. What `check-surface.js` still asks is the half that never depended on it: is each symbol declared in the package `tools/package-map.json` assigns it to.

## The ADT type tables

What the library serves, per release variant, is declared here as three `as
const` tables — constants, written by hand:

| table | variant | release |
|---|---|---|
| `ADT_TYPES_ONPREM` | `'onprem'` | S/4HANA 2025 on-premise |
| `ADT_TYPES_CLOUD` | `'cloud'` | ABAP cloud |
| `ADT_TYPES_BASIS_740` | `'basis740'` | SAP_BASIS 7.40 SP04 |

**Keyed by API, not by code.** The key is the client's factory name (`class`
for `getClass()`, `functionModule`, `request` for `getRequest()`), because one
code serves two APIs (`CLAS/OC`: `class` and `behaviorImplementation`;
`TABL/DS`: `structure` and `appendStructure`) and one API several codes
(`enhancement`: `ENHO/XHH`, `ENHO/XHB`, `ENHS/XSB`). An entry holds:

- `kind` — the object's kind in the tools' one vocabulary (`function_module`);
  two APIs on one code share it;
- `collection` — the ADT collection its resource lives in, the parent's for an
  API addressed under a parent;
- `codes` — for each code: `main` (its main type, below), `parent` (the
  parent API, or `null`),
  `nameMaxLength`, `operations` and `evidence`, the corpus case of the
  release's `typestructure` answer that lists the code
  (`system-description-basis-740--07-typestructure`); and, where a code lives
  elsewhere than its API, its own `collection` — the enhancement codes under
  `/sap/bc/adt/enhancements/enhoxhh`, `/enhoxhb` and `/enhsxsb`.

The local class includes and the transport request have no code the library
sends: their entries have `codes: {}`, and their `parent`, `operations` and
`evidence` on the entry — the case that lists the parent's code, or for the
request the release's `typestructure` case. A coded entry names at least one
code: `IAdtTypeTables` takes each table as `AdtCheckedTable<T>`, which refuses
an empty `codes` that `satisfies` cannot see.

**Operations** come from one closed vocabulary, `AdtOperation`: `create`,
`read`, `source`, `readMetadata`, `update`, `updateMetadata`, `lock`,
`unlock`, `activate`, `check`, `validate`, `versions`, `deletionCheck`,
`delete`, `transport`; the families of one API (`readEnhancementElements`,
`readEnhancementOptions`, `activateTestClasses`, `checkCdsTestDoubles`, the
feature toggle's `switchOn`, `switchOff`, `getRuntimeState`, `checkState`, the
service binding's `getServiceBindingTypes`, `getServiceGroup`, the transport
request's `list` … `changeTaskType`); `run` and `profile` for the executors;
and `unitTestRun`, `unitTestRunSync`, `unitTestStatus`, `unitTestResult` for
the ABAP Unit runners' four members, which 7.40 serves apart. `source` says the object has a source the
library reads; `AdtSourceTypeCode` is drawn from it.

**What is not in a table is not served.** An API whose every member the 7.40
client refuses is absent from `ADT_TYPES_BASIS_740`, and an operation it
refuses is absent from its code — 7.40 has no `deletionCheck`, no `transport`,
no `run`. On ABAP cloud a program and an include are only SAP's own: they
list what a delivered one answers — reads, checks, the deletion check, the
enhancement reads and a program's ABAP Unit runs. A read is listed where the
release's discovery has its endpoint; an operation that changes an object where
the release offers it (its discovery, and a measurement), and not where a
measurement on the release refused it. `typestructure`'s `USER_AUTHORIZATIONS`
is one user's on one system — the type accessible there and the user allowed
to create it — so it explains a refusal, it does not fill a table. A system's
own refusal (an authorization, a setting) is its answer at run time.
The entry shape (`AdtApiTable<R>`) refuses a misspelt field, an
operation outside the vocabulary, an API with no factory and another release's
evidence at compile time.

**Derived types**, all from the tables:

| type | what |
|---|---|
| `AdtVariant` | `'onprem' \| 'cloud' \| 'basis740'` |
| `AdtApi<V>` | the APIs of variant `V` |
| `AdtTypeCode` | every code of any table |
| `AdtTypeCodeOf<V>` | the codes of variant `V` |
| `AdtApiWith<V, Op>` | the APIs of `V` one code of which performs every operation of `Op` (`AdtApiWithIn<T, Op>` over any table) |
| `AdtTypeCodeWith<V, Op>` | the codes of `V` whose facts list `Op` |
| `AdtObjectKind` | every kind |
| `AdtSourceTypeCode` | the codes with `source` |
| `AdtParentedTypeCode` | the codes with a parent API: `FUGR/FF`, `FUGR/I` |
| `AdtMainTypeOf<C>` | the main type of code `C`: `'ENHO'` of `'ENHO/XHH'` |
| `AdtMainType` | every main type of any table (`AdtMainTypeOfVariant<V>` per variant) |
| `CodesOfMain<M>` | the codes of main type `M` |
| `AdtSearchType` | every search name of any release's list (`AdtSearchTypeOf<V>` the names every variant of `V` takes) |

A map a consumer keeps over the codes is typed by them, and the compiler then
asks for every code and refuses any other:

```ts
const label: { readonly [C in AdtTypeCode]: string } = { 'CLAS/OC': 'Class', /* … every code */ };
```

**Proved against the systems elsewhere.** This package holds no code, so it
holds no test against the releases: the conformance check in
`@mcp-abap-adt/adt-clients` reads each release's recorded `typestructure`,
`discovery` and, on the newer releases, `urimapper` answers. It fails on a code
not listed, a parent or a name length that disagrees, a collection not
advertised, and an address built for a sample object that differs from the
`urimapper` answer for it. It holds the capabilities too: `run` on a code that
does not list `EXECUTE`, or `profile` without `PROFILE`, is a conflict; a
`create` on a code without `CREATE` is listed apart, since ADT creates those
through their own collection; and a code listing `CREATE` that no entry
creates goes into the coverage. `src/__typechecks__/` holds the tables
recorded cell for cell — per variant, API and code, the parent and the exact
set of operations — as an exact equality, so a table edit is made twice, on
purpose.

**An answered code.** A code read from an ADT answer is an
`IAdtAnsweredObject`: `{ type: AdtTypeCode }` when the tables know it,
`{ unknownType: string }` with the text as sent when they do not. The two are
exclusive.

**Parents.** The atoms that identify an object take the parent's field as
their last type parameter, `TParent extends keyof TConfig = never`, and their
`config` is `AdtObjectIdentity<TConfig, TParent>`: with `never` that is
`Partial<TConfig>` itself — the same type as before 21.0.0, so a contract
written then, or code generic in `TConfig`, is unchanged — and otherwise every
field optional but `TParent`, which is required. A contract whose API has a
parent passes it: `functionGroupName` for a function module and a function
include, `className` for a local class include and a message class message.

```ts
type ModuleRead = IAdtReadable<IFunctionModuleConfig, string, 'functionGroupName'>;
// read({ functionModuleName }) does not compile; read({ functionGroupName, functionModuleName }) does
```

`IObjectReference<C extends AdtTypeCode = AdtTypeCode>` requires `parentName`
when `[C] extends [AdtParentedTypeCode]` — `IObjectReference<'FUGR/FF'>` —
and leaves it optional otherwise, the default included, so a reference built
from a code typed `AdtTypeCode` compiles and an interface can extend it.

### Main types and search names (24.0.0)

A code's **main type** is its TADIR object type, the `R3TR <type>` before the
`/`: `ENHO` of `ENHO/XHH`, `DEVC` of `DEVC/K`, `TABL` of `TABL/DS`. Every code
entry states its own as `main`; the table's `satisfies` refuses an entry
without one, and `AdtCheckedTable<T>` one whose `main` is not its own key's
(per key: the main type of a neighbouring code is refused too).
`AdtMainTypeOf<C>` is the main type of a code, `CodesOfMain<M>` the codes of a
main type (`CodesOfMain<'ENHO'>` is `'ENHO/XHB' | 'ENHO/XHH'`),
`AdtMainType` every main type of any table and `AdtMainTypeOfVariant<V>` a
variant's. **A main type is not an address:** `TABL` is `TABL/DT` or
`TABL/DS`, and every parameter that builds an address — read, write,
metadata, a URI, where-used, the group operations — takes a code.

**The search filter takes the release's search names.**
`ISearchObjectsParams.objectType` is an `AdtSearchType`: a name of the quick
search's object types list
(`/sap/bc/adt/repository/informationsystem/objecttypes`), held per variant in
`ADT_SEARCH_TYPES_ONPREM`, `ADT_SEARCH_TYPES_CLOUD` (written from the recorded
lists: each name with the code it selects, `type`, or `group: true`) and
`ADT_SEARCH_TYPES_BASIS_740` (7.40 has no list: each name with the codes its
recorded search's hits carry, `answered`); `IAdtSearchObjectsParamsOf<V>` takes only the
names every variant of `V` takes (`AdtSearchTypeOf<V>`). Measured
2026-10-29, read only:

- on S/4HANA 2025 and ABAP cloud, identically, a name selects what the list
  says — `STRU` only `TABL/DS`, `DTAB` only `TABL/DT`, `TABL` both, a group
  (`ABAP_TEST_COCKPIT`) its members — and an unknown name is refused `400`;
- a code is no filter value: one equal to an item's `type` selects as that
  item, any other as the text before its `/` (`ENHO/XHH` answers as `ENHO`,
  with other first hits under `maxResults`), and an unknown code answers
  nothing, silently;
- SAP_BASIS 7.40 has no list (`404`); `DEVC`, `CLAS`, `INTF`, `PROG`, `FUGR`,
  `FUNC`, `DDLS`, `MSAG`, `TABL`, `ENHO` and `ENHS` select there, and the
  aliases (`STRU`, `DTAB`, `REPO`, `INCL`, `BADI`) and an unknown name answer
  no hits, silently.

Every main type of a variant's table is a search name of that variant
(`src/__typechecks__/mainTypes.ts`), so a search for a code's objects sends
its entry's `main` (`ADT_TYPES_ONPREM.package.codes['DEVC/K'].main`), and a
subtype with an alias its alias (`STRU`). A subtype without one (`ENHO/XHH`)
cannot be searched alone: the caller filters the hits.

### Intersections, group-only codes and group references (22.0.0)

**A union of variants.** `AdtTypeCodeOf<V>`, `AdtTypeCodeWith<V, Op>` and
`AdtApiWith<V, Op>` read a union of variants as one union table: the APIs all
of them serve, and for those the codes and operations any of them lists. The
intersecting helpers ask every variant: `AdtCodeOf<V>` and `AdtCodeWith<V, Op>`
are the codes every variant of `V` lists (with `Op`), and
`AdtServingVariantsIn<IAdtTypeTables, A>` and
`AdtPerformingVariantsIn<IAdtTypeTables, A, Op>` name the variants that serve
an API or perform an operation on one of its codes — what a client's gates
need. For `AdtModernVariant`, `'onprem' | 'cloud'`, that is what both tables
serve. `AdtCodeOfIn` and `AdtCodeWithIn` take any set of tables.

**Utility codes.** `ADT_UTILITY_CODES_ONPREM`, `_CLOUD` and `_BASIS_740` hold
what `getUtils()` takes beyond the API tables, with its operations
(`AdtUtilityOperation`), whether they were measured, and the evidence:

| code | where | operations | measured |
|---|---|---|---|
| `VIEW/DV` | every release, `/sap/bc/adt/ddic/views` | group activation, group deletion, where-used | no |
| `DEVC/K` | S/4HANA 2025, ABAP cloud | group activation | no |
| `DEVC/K` | SAP_BASIS 7.40 SP04 | node structure | yes |

`VIEW/DV` is a **group-only code** (`AdtGroupOnlyCode`): no API serves it, so
it is no `AdtTypeCode`. `IObjectReference<'VIEW/DV'>` and
`IGetWhereUsedParams<'VIEW/DV'>` name it; the defaults do not.

**Group references.** `IAdtGroupActivationReference<V>`,
`IAdtGroupDeletionCheckReference<V>`, `IAdtGroupDeletionReference<V>` and
`IAdtWhereUsedParamsOf<V>` take only the codes their operation sends on `V`
— no message class in an activation, no package in a 7.40 one, no function
include in where-used — and require `parentName` for `FUGR/FF` and `FUGR/I`.
`IAdtTypedGroupLifecycle` and `IAdtTypedWhereUsed` declare the members over
them, beside `IAdtGroupLifecycle` and `IAdtWhereUsed`: a contract composed of
both takes typed references and the 21.0.0 `IObjectReference[]` alike.

**The type structure.** `IAdtTypeStructure.getTypeStructure({ headers })`
posts to `/sap/bc/adt/repository/typestructure`; its reading is
`IUtilResults.typeStructure`, optional so a 21.0.0 set is still one.

## The ABAP Unit run registry

`ABAP_UNIT_RUN_TYPES` (`adt/AbapUnitRunTypes.ts`, since 23.1.0) holds every
`osl:object type` value an ABAP Unit run (`POST /sap/bc/adt/abapunit/runs`)
may name: the 23 codes `GET /sap/bc/adt/abapunit/metadata` lists, and the
short types `CLAS`, `PROG`, `FUGR`, `FUNC` and `DDLS` a run was measured to
take. The type a run takes, `AbapUnitRunObjectType`, is the union of its
keys. A type the endpoint does not run is not refused — the start answers
`201` and the result is an empty `<aunit:runResult/>` — so only the compiler
can catch a wrong one.

Each entry says what a run of it runs (`runs`) and why it is there
(`evidence`):

| `runs` | meaning |
|---|---|
| `'ownTests'` | the test classes the object holds |
| `'assignedTests'` | test classes assigned to it elsewhere (a CDS view's `"! @testing <view>"` classes); they run only when the run's scope sets `foreignTests: true` |

| `evidence` | meaning | codes |
|---|---|---|
| `'recorded'` | a run was measured to run its tests on every release where such an object can be made (S/4HANA 2025 and ABAP cloud, 2026-10-29; `PROG/I` on S/4HANA 2025, 2026-10-31, as ABAP cloud cannot hold a report's include) | `CLAS`, `CLAS/OC`, `CLAS/OCL`, `PROG`, `PROG/P`, `PROG/I`, `FUGR`, `FUGR/F`, `FUNC`; `DDLS`, `DDLS/DF` with assigned tests |
| `'metadata'` | the metadata answer lists it; no run of it was measured | the other codes of the 23 |
| `'metadataRunEmpty'` | the metadata lists it, and a run naming an object by it answered empty | `FUGR/FF` (a function module), `DEVC/K` (a package runs only as a package target) |

For a code on the metadata's evidence, `runs` follows its flags:
`ownTests="true"` is own tests, otherwise assigned tests. The flags
themselves, `coverage` among them, are the recorded metadata answer's, not
copied here.

**The two targets.** `AbapUnitRunTarget` is a discriminated union on `kind`:

- `{ kind: 'object', name, type }` — one object, sent as an
  `osl:flatObjectSet` with one `osl:object`;
- `{ kind: 'package', name, includeSubpackages }` — one package, sent as an
  `osl:packageSet` with `<osl:package name includeSubpackages>`, the one form
  measured to run a package's tests. It carries no `type`.

**The runner.** `IAbapUnitRunner<TRun, TStatus, TResult>` (`adt/IAdtUnitTest.ts`)
is `IAdtRunnable<AbapUnitRunTarget, TRun, IClassUnitTestRunOptions>` — `run`
starts a run of a target and answers the started run — with
`ITestRunInformation`'s `getStatus` and `getResult`, and `runSync(uris, options)`:
the objects named by ADT URIs (at least one) run on
`/sap/bc/adt/abapunit/testruns`, the synchronous runner and the only one
SAP_BASIS 7.40 has, answering the finished result. `runSync`'s request sets
both `Accept` and `Content-Type`, so it takes the required `options.headers`
(see "A request's own headers"). The scope, risk levels and durations are the
caller's options, as for the per-object runners.

`src/__typechecks__/abapUnitRuns.ts` records the registry entry for entry and
holds the run type to its keys and the two targets apart.

## Enhancements and their hosts

`EnhancementType` accepts `enhoxhb` (BAdI implementation, ENHO/XHB), `enhoxhh`
(source code plugin, ENHO/XHH), and `enhsxsb` (BAdI enhancement spot, ENHS/XSB).
The ABAP Cloud trial refuses the `enhoxhh` collection (403 on create and read;
no content type in its discovery). Class enhancements (`enhoxh`) and plain
spots (`enhsxs`) answered 500 on reads on S/4HANA on-premise (2026-10-15) and on premise +
trial in mcp-abap-adt `5046d8a6` (2026-10-02), which also measured Eclipse
opening them in SAP GUI. The trial discovery lists no content type for either.
Callers migrating from 16.0 must remove those calls; the removed subtypes now
cause compile errors.

Creating ENHO/XHH needs `IEnhancementConfig.enhancedObject` (`uri`, `type`,
`name`, and `program`, the main program name), `enhancementOption` (the full
option name), and `enhancementMode` (`S` for static or `D` for dynamic).

`IAdtEnhancementHost<TConfig, TElements, TOptions>` is the capability atom for
classes, programs and function groups that host enhancements; neither member
takes `context`. `readEnhancementElements` reads
`…/source/main/enhancements/elements`. `readEnhancementOptions` reads
`…/enhancements/options`, the places that can be enhanced and the full option
names used to create plugins.

`IAdtIncludeEnhancementHost<TConfig, TElements, TOptions>` is the independent
atom for an include's elements and options, with the same two members. Both
reads take optional `context` naming the include's main program (`SAPLSVIM`
for an include of function group SVIM). Without it, both reads answered 400
ED/258 "No main program for include … found" (S/4HANA on-premise, 2026-10-15). Context stays
optional because an include with a single main program is unmeasured.
Both atoms accept per-call `analyse` and return `IAdtResponse`.

## The transport request's object list

`IAdtTransportObjectActions` and `IAbapObjectEntry` (`adt/IAdtTransport.ts`, since 1.2.0) declare what can be done to a request's object list and to its tasks: `removeObject`, `addObject`, `createTask`, `readActionLog`, `readObjects`.

They exist because deleting an ABAP object does not free its name. The CTS object-directory entry stays on the request that carried it, and until it is detached a create of the same name is refused with `CTS_WBO_API 019` — **even when that same request is passed as `corrNr`**. Without a way to detach one, the ways out are releasing the whole request, shipping everything else in it, or SE09 by hand.

Two of the signatures say things a capture cannot. 1.2.0 was declared from captures of Eclipse ADT, and Eclipse sends every attribute on every call, so nothing in a capture could show which of them the server needs. The first run against an on-premise system, 2026-09-21, found two that it does:

| call | what the server does |
|---|---|
| `createTask` without `tm:targetuser` | refused — `400 SCTS_ADT_MSG 009`, *"User&nbsp;&nbsp;does not exist in the system (or locked)"*: two spaces, because the owner resolved to an empty name |
| `removeObject` without `tm:position` | `200` with the usual echo document and **nothing removed** — 22 entries asked for by `pgmid`/`type`/`name` alone, 22 still on the task afterwards |

So `createTask` requires `targetUser` and `removeObject` requires `position`, and `readObjects` was added because otherwise the second would require a value this package offers no way to obtain — leaving a caller to parse a transport document themselves for a `tm:position`. It is its own member because it answers its own thing: entries, each with its position as a value, rather than a document. What an implementation sends to get them is its own business; the contract says what must come back.

`addObject` still takes an entry without a position — one that does not exist yet has none.

## A request's own headers

Since 19.0.0 a member whose request sets **both** `Accept` and `Content-Type`
takes them as the pair `options.headers`, typed `IAdtHeaders`
(`{ accept, contentType }`), and the field is **required**: the member sends
exactly the pair it is given and supplies nothing itself. Both fields are
required, so a partial pair does not compile. Because the field is required,
so is the options parameter, and a positional parameter before it that was
optional is now `T | undefined`.

A member whose request sets only one of the two, or neither, is unchanged: it
takes no `headers`. An existing single field, `IReadOptions.accept`, stays as
it is. A member that takes `headers` carries no separate `accept` or
`contentType` beside it.

Which request sets what was read from `@mcp-abap-adt/adt-clients`. For a chain,
the main write counts (the message class message's create and update: the
PUT). Where a member's implementations disagree, the majority decides.

The members that take `headers`: `IAdtAbapGitClient`: `link`, `pull`, `checkExternalRepo`; `IAdtCreatable`: `create`; `IAdtUpdatable`: `update`; `IAdtMetadataUpdatable`: `updateMetadata`; `IAdtDeletable`: `delete`, `checkDeletion`; `IAdtCheckable`: `check`; `IAdtActivatable`: `activate`; `IFeatureToggleObject`: `checkState`; `IAdtTransportObjectActions`: `removeObject`, `addObject`, `createTask`, `changeTaskType`; `IAdtTransportMoveObjects`: `moveObjects`; `IAbapUnitRunner`: `runSync`; `IAdtWhereUsed`: `getWhereUsed`, `getWhereUsedScope`; `IAdtVirtualFolders`: `getVirtualFoldersContents`; `IAdtRepositoryStructure`: `fetchNodeStructure`; `IAdtGroupLifecycle`: `activateObjectsGroup`, `checkDeletionGroup`, `deleteObjectsGroup`; `IAdtDataPreview`: `getSqlQuery`, `getTableContents`; `ITraceScheduling`: `scheduleTrace`; `IAbapDebugger`: `setBreakpoints`, `getChildVariables`, `getVariables`, `syncBreakpoints`, `setDebuggerSettings`; `IAmdpDebugger`: `getDataPreview`.

The field is on each member's own options, not on `IAdtAnalyseOptions` or
`IAdtOperationOptions`. `src/__typechecks__/headersOnEveryMember.ts` holds this
for every member and every overload.

## Migrating to 24.0.0

- **The search filter takes a search name, not a code.**
  `ISearchObjectsParams.objectType` was `AdtTypeCode`; it is `AdtSearchType`.
  Where a code was passed, pass the search name: the main type from the table
  entry's `main` (`ADT_TYPES_ONPREM.package.codes['DEVC/K'].main`, `'DEVC'`),
  or the alias of a subtype (`'STRU'` for `TABL/DS`, `'DTAB'` for `TABL/DT`).
  A code passed before selected as its main type, unless it was an item's own
  `type`, so the main type keeps what such a search answered.
- **A table built against `AdtApiTable` carries `main` on every code**, equal
  to `AdtMainTypeOf` of the code (`'ENHO'` for `'ENHO/XHH'`).

## Migrating to 23.0.4

- **A results set for a function group adds `updated`.** `IFunctionGroupResults`
  now requires it, for the function pool's main source the group now writes. A
  set built for 23.0.3 stops compiling until it names one.

## Migrating to 23.0.3

- **A results set for a service binding adds `metadataUpdated`.**
  `IServiceResults` now requires it, as 23.0.2 did for nine other types. A set
  built for 23.0.2 stops compiling until it names one.

## Migrating to 23.0.2

- **A results set for an access control, a metadata extension, a behaviour
  definition, a service definition, a scalar function, a transformation, a
  table, a structure or an include adds `metadataUpdated`.** Their results
  contracts now require it, as 23.0.1 did for the class and its siblings. A
  set built for 23.0.1 stops compiling until it names one. The type tables
  only gain `updateMetadata` for these codes; nothing that compiled stops
  compiling for that.

## Migrating to 23.0.1

- **A results set for a class, an interface, a program, a function module or
  a DDL source adds `metadataUpdated`.** `IClassResults`, `IInterfaceResults`,
  `IProgramResults`, `IFunctionModuleResults` and `IDdlResults` now require
  it — the strategy for what `updateMetadata` answers, as
  `IFunctionGroupResults` already did. A set built for 23.0.0 stops compiling
  until it names one, e.g. the same strategy its `updated` uses, or one of its
  own for the metadata document. Nothing else changes.

## Migrating to 23.0.0

- **ABAP cloud: a delivered program is not transported, run or profiled.**
  `ADT_TYPES_CLOUD` no longer lists `transport`, `run` or `profile` for
  `PROG/P`: on a delivered program the transport answers `404`, and a run or a
  profiled run is refused ("You are not authorized to execute this object",
  measured 2026-10-28). Code gated on the cloud variant, or on the
  intersecting helpers over `AdtModernVariant`, that reads a program's
  transport or runs or profiles a program stops compiling.
- **ABAP cloud: a feature toggle is only read.** `ADT_TYPES_CLOUD` lists for
  `FTG2/FT` `read`, `source`, `readMetadata`, `check`, `deletionCheck`,
  `getRuntimeState` and `checkState`: the create answers `403` (the cloud's
  `typestructure` gives the measuring user no `CREATE` for it). Code gated
  on the cloud variant, or on the intersecting helpers over
  `AdtModernVariant`, that creates, changes, locks, activates, deletes or
  switches a feature toggle stops compiling.
- `deletionCheck` is listed again for `PROG/P` and `PROG/I` on ABAP cloud;
  nothing that compiled stops compiling for it.

## Migrating to 22.0.0

- **ABAP cloud: no program or include of one's own.** `ADT_TYPES_CLOUD` no
  longer lists `create`, `update`, `lock`, `unlock`, `activate`, `validate`,
  `deletionCheck` or `delete` for `PROG/P` and `PROG/I`: the cloud refuses to
  create either (`403`, S_DEVELOP). Code gated on the cloud variant, or on the
  intersecting helpers over `AdtModernVariant` (`AdtCodeWith`,
  `AdtPerformingVariantsIn` — what both newer tables serve), that creates or
  changes a program or an include stops compiling. The union helpers
  (`AdtApiWith`, `AdtTypeCodeWith`) over `AdtModernVariant` still name the
  program, since on-premise creates one. A function include (`FUGR/I`) is
  unchanged. (23.0.0 lists `deletionCheck` again.)
- Nothing else breaks: every other change is an addition (see the
  CHANGELOG).

## Migrating to 21.0.0

Every break is a type error; nothing a correct call sends changes.

- **The four unions are gone.** Replace `AdtObjectType` with `AdtTypeCode` and
  `AdtSourceObjectType` with `AdtSourceTypeCode`, or with the variant's own
  `AdtTypeCodeOf<V>` / `AdtTypeCodeWith<V, 'source'>` where the variant is
  known. The lower-case spellings and the friendly names (`'class'`,
  `'functionmodule'`, `'view'`, …) are no codes: pass the upper-case code
  (`'CLAS/OC'`, `'FUGR/FF'`, `'DDLS/DF'`).
- **The codes no release lists do not compile.** `INTF/IF` is `INTF/OI`;
  `STRU/DT` and `STRU/DS` are `TABL/DS`; `DOMA/DM` is `DOMA/DD`; `BDEF/BD` is
  `BDEF/BDO`; `BIMP/BIM`, `BIMP/` and `BIMPL/` are `CLAS/OC`; `DSFD/DSF` is
  `DSFD/SCF`, `DSFI/DSF` is `DSFI/SFI`, `SUSO/O` is `AUTH`; a function module
  is `FUGR/FF` and a function group `FUGR/F`, so `FUNC` and `FUGR/FC` go; bare
  `SCGR` and the other bare codes (`FUGR`, `DTEL`) are none — `AUTH` is the
  one bare code a table holds.
- **A table type is `TTYP/DA` where any code is taken.** `TTYP/DF`, `TTYP/TT`
  and `TTYP/ST` become `TTYP/DA` in `readObjectMetadata`, `supportsSourceCode`,
  a reference, a where-used or a search parameter. A table type has no source,
  so `TTYP/DA` is no `AdtSourceTypeCode`: a `readObjectSource` or
  `getObjectSourceUri` of a table type has no replacement — read its document
  with `readObjectMetadata`.
- **Every code parameter takes these codes:** `IObjectReference.type`,
  `readObjectSource`, `getObjectSourceUri` (`AdtSourceTypeCode`),
  `readObjectMetadata`, `supportsSourceCode`, `fetchNodeStructure`'s
  `parentType`, `getObjectStructure`'s `objectType`, the where-used
  parameters' `object_type` and `ISearchObjectsParams.objectType`
  (`AdtTypeCode`).
- **A parent is named by the contract.** A contract composing the identifying
  atoms for a function module or a function include passes
  `'functionGroupName'` as their `TParent`, for a local class include or a
  message class message `'className'`; a caller of that contract then names
  the parent. A contract that passes nothing is unchanged. An
  `IObjectReference<'FUGR/FF'>` or `IObjectReference<'FUGR/I'>` names
  `parentName`.
- **An implementation** declaring an identifying member as
  `(config: Partial<TConfig>, …)` still satisfies the atom — it accepts more.
- **A result** that carries a code read from an answer is typed
  `IAdtAnsweredObject`: switch on `type`, and handle `unknownType` for a code
  the tables do not hold.
- **The tables are new.** `ADT_TYPES_ONPREM`, `ADT_TYPES_CLOUD`,
  `ADT_TYPES_BASIS_740` and the types derived from them are additions; see "The
  ADT type tables".

## Migrating to 20.0.0

`IAdtClientOptions.enableAcceptCorrection` is removed, so code that sets it
stops compiling; drop the field. The contract carries how headers are passed —
`headers: IAdtHeaders` with the call, where a member takes it — and correcting
a format the server refused is the consumer's own: read the formats the `406`
or `415` names (`@mcp-abap-adt/adt-clients` exports the parsers for both) and
call again with the matching `headers`. Nothing else changed.

## Migrating to 19.0.0

- Pass `headers: { accept, contentType }` in the options of every member
  listed in "A request's own headers". A call that relied on the member's own
  headers no longer compiles; the headers the implementation used to send are
  now the caller's to give.
- Their options parameter is now required. Where a positional parameter before
  it was optional, pass `undefined` explicitly: `IAdtCheckable.check` (`status`), `IFeatureToggleObject.checkState` (`opts`), `IAdtGroupLifecycle.activateObjectsGroup` (`preauditRequested`) and `deleteObjectsGroup` (`transportRequest`).
- Every other member is unchanged.
- An implementation reads `options.headers` and sends it as given.

## Migrating to 18.0.0

An implementer of `IAdtEnhancementHost` drops `context`. An include host
implements `IAdtIncludeEnhancementHost`. A caller passing `context` to a
class, program or function-group host removes it.

## Migrating to 17.0.0

`EnhancementType` no longer has `enhoxh` or `enhsxs`, so code passing either
stops compiling. Reads of both answered 500 wherever they were measured (see
"Enhancements and their hosts" and the CHANGELOG), so remove those calls. To
create an ENHO/XHH, set `enhancedObject`, `enhancementOption` and
`enhancementMode` on `IEnhancementConfig`. The new `IAdtEnhancementHost` is
additive. Nothing else changed.

## Migrating to 16.0.0

`IAdtClientOptions.signal` and `IAdtError.refusal` (15.4.0) are gone, with the
per-request signal of `@mcp-abap-adt/interfaces-adt-connection` 3.0.0: ABAP
cannot cancel or roll back a request, and a session closed with a logoff
releases its locks (measured, see the CHANGELOG). Drop both from your code and
move to `@mcp-abap-adt/interfaces-adt-connection` `^3.0.0`; nothing else
changed.

## Migrating to 13.0.0

`IAdtWireResponse` comes from `interfaces-adt-connection` ^2.0.0, where its
`data` defaults to `unknown` instead of `any`. Install that version beside this
one (one copy only), then, wherever a result strategy, an `analyse` function or
`IAdtFailure.response` reads the answer, narrow it or name it:

```diff
- const strategy: IResultStrategy<string> = (answer) => answer.data;
+ const strategy: IResultStrategy<string> = (answer) =>
+   typeof answer.data === 'string' ? answer.data : '';
```

A stub of `makeAdtRequest` in a test is covered in `interfaces-adt-connection`'s
2.0.0 migration note.

## Migrating to 11.0.0

Each member is one request, addressed by a value the server already gave you.

```ts
// Transport requests: name the saved search.
- await requests.list();
+ const configs = await searches.searchConfigurations();   // IAdtTransportSearchConfigurations
+ await requests.list({ configUri: /* the one you choose */ });

// abapGit: take the key and the log link from listRepos.
- await git.unlink({ package: 'ZPKG' });
- await git.getErrorLog('ZPKG');
- await git.getRepo('ZPKG');
+ await git.unlink({ repositoryId: repo.key });
+ await git.getErrorLog(repo.logLink);
+ // getRepo is gone: read listRepos and take the entry you want.

// Feature toggles: one result type per answer.
- IFeatureToggleObject<MyState>
+ IFeatureToggleObject<{ switched: void; runtimeState: MyState; checkState: MyCheck; source: string }>
```

**The connection moved.** Import it from its own package; nothing here
re-exports it.

```ts
- import type { IAbapConnection, IAdtWireResponse } from '@mcp-abap-adt/interfaces-adt';
+ import type { IAbapConnection, IAdtWireResponse } from '@mcp-abap-adt/interfaces-adt-connection';
```

The same holds for `IAbapRequestOptions`, the capability atoms
(`ISessionLifecycleAware`, `ICriticalSection`, `IRequestProfiling`,
`IDeferredResponseConnection`), `ADT_SESSION_ERROR`/`AdtSessionErrorCode` and
`ITimeoutConfig`. A connector depends on that package alone.

`IAdtAbapGitClient` lost its second type parameter with `getRepo`. Decision 37
in `docs/architecture/DECISIONS.md` says why a member no longer looks up what a
caller can pass.

## Migrating to 10.0.0

Every member that answers an `IAdtResponse` takes the error strategy with the
call now — `options` carrying `analyse`. A **caller** changes nothing: the new
parameter is optional, and a call without it compiles as before. What changes is
that a caller *can* pass one everywhere:

```ts
const answer = await utils.deleteObjectsGroup(objects, transport, {
  analyse: analyseDeletion,   // reads del:isDeleted and every del:message
});
```

An **implementation** changes each member it offers from the list in the
changelog: accept the options, and hand `analyse` to whatever turns the answer
into an `IAdtResponse`.

```ts
// before
lock(config: Partial<TConfig>): Promise<IAdtResponse<string>>;
// after — the pair every atom has
lock<E extends IAdtError>(
  config: Partial<TConfig>,
  options: IAdtAnalyseOptions<E> & { analyse: IAnalyse<E> },
): Promise<IAdtResponse<string, E>>;
lock(config: Partial<TConfig>, options?: IAdtAnalyseOptions): Promise<IAdtResponse<string>>;
```

An implementation that keeps the old one-parameter signature still type-checks —
TypeScript accepts a function with fewer parameters — and silently drops the
caller's strategy. Test that it is honoured; the contract cannot.

Three signatures changed shape rather than growing a parameter:

- `IAdtRunnable.run` always has a second parameter; a flavour without options
  gets `options?: IAdtAnalyseOptions`.
- `ViewArgs` always yields one, so `ITraceReading.read` on a view without
  options takes `options?: IAdtAnalyseOptions`.
- `ITraceListing<TEntry, TOptions, TList = TEntry[]>` — `list` answers `TList`.
  Existing instantiations keep their meaning.

An implementation also stops interpreting on its own: with no `analyse`, it
answers what the transport saw, and a refusal SAP wrote inside a 200 is a
document until a strategy reads it. Decision 36 in the repository's
`docs/architecture/DECISIONS.md` says why the error strategy travels with the
call while the result strategy is given at construction.

## Migrating to 9.0.0

Nothing changed shape. Every break is an import moving to the package that
declares the name now, so `tsc` finds all of them and none of them silently.

```ts
// Authentication in general — 32 names, among them:
- import type { IAuthProvider, ITokenProvider, ITokenRefresher } from '@mcp-abap-adt/interfaces-adt';
+ import type { IAuthProvider, ITokenProvider, ITokenRefresher } from '@mcp-abap-adt/interfaces-auth';

// Authentication that names SAP or BTP — 16 names, among them:
- import type { ISapConfig, IConnectionConfig, ISessionStore } from '@mcp-abap-adt/interfaces-adt';
+ import type { ISapConfig, IConnectionConfig, ISessionStore } from '@mcp-abap-adt/interfaces-auth-sap';
  // since interfaces-auth-sap 2.0.0, IConnectionConfig and ISessionStore are @mcp-abap-adt/interfaces-auth-broker
- import { AUTH_TYPE_XSUAA, AUTH_TYPES } from '@mcp-abap-adt/interfaces-adt';
+ import { AUTH_TYPE_XSUAA, AUTH_TYPES } from '@mcp-abap-adt/interfaces-auth-sap';
+ import { AUTH_TYPE_JWT, AUTH_TYPE_BASIC } from '@mcp-abap-adt/interfaces-auth';   // not re-exported

// An HTTP failure, and a parsed node:
- import type { HttpError, XmlNode } from '@mcp-abap-adt/interfaces-adt';
+ import type { HttpError } from '@mcp-abap-adt/interfaces-network';
+ import type { XmlNode } from '@mcp-abap-adt/interfaces-utils';

// And one arriving here, from interfaces-network:
- import type { ITimeoutConfig } from '@mcp-abap-adt/interfaces-network';
+ import type { ITimeoutConfig } from '@mcp-abap-adt/interfaces-adt';
```

**Three names are not anywhere.** `ISessionState` and `ISessionStorage` are
deleted — cookies, a CSRF token and a cookie store are HTTP session state, which
no package's subject names and which no repository under development imports; a
consumer that wants them declares them, since what a cookie jar holds is an
implementation's business. `AuthTypeEnum` was an alias of `AuthType`, and one
contract with two names is something a consumer has to guess between: take
`AuthType` from `interfaces-auth-sap`.

**Ranges, so an install resolves one copy of each package.** A range one major
behind is what npm answers by silently nesting a second copy, so a consumer on
this release takes `interfaces-network@^2.0.0` and the current major of whichever
of `interfaces-auth`, `interfaces-auth-sap` and `interfaces-utils` it imports
from — at the time of writing `interfaces-auth@^2.0.0`, `interfaces-auth-sap@^1.0.1`
and `interfaces-utils@^1.1.0`.

Decision 35 in the repository's `docs/architecture/DECISIONS.md` says why each
name went where it did, and why the accepting package stopped deciding it.

## Migrating to 7.0.0

Two changes.

```ts
// 1. The write's body goes in the options, and only there. Six configs —
//    domain, data element, package, table type, function group, transport
//    request — no longer declare `source`.
- await domain.updateMetadata({ domainName, source: edited }, { lockHandle });
+ await domain.updateMetadata({ domainName }, { source: edited, lockHandle });

// 2. The task types are a constant, so nobody repeats the letters.
- await actions.changeTaskType(task, 'S');
+ await actions.changeTaskType(task, ADT_TASK_TYPE.developmentCorrection);
```

A `check` or `validate` keeps taking its source in the config: it compiles
text the server does not hold yet and has no options channel to take it from,
which is the one job a `source` on a config still has. The six types above
have no such member, so nothing read theirs but the write.

`'S'` still compiles, and so does a declaration that spells the union out:
`AdtTaskType` is an alias for those three values, and TypeScript compares
types structurally, so the two are mutually assignable. **The second change
breaks nothing at the type level** — it is here because the letters now have
one home, not because a caller must react to it. The break in 7.0.0 is the
first change, the six configs. `ADT_TASK_TYPE` and `AdtTaskType` are exported from this package and
**not** from the `@mcp-abap-adt/interfaces` facade: everything the facade
forwards is deprecated in favour of importing from the package that declares
it, so a new symbol there would be born deprecated.

Decision 33 in the repository's `docs/architecture/DECISIONS.md` says why the
body has one channel, and what measurement decided which configs keep the
field.

## Migrating to 2.0.0

Three changes, all of them in `IAdtTransportObjectActions`. An implementation or a caller on 1.2.0 does this:

```ts
// 1. Name the fifth type parameter: what readObjects answers.
type Actions = IAdtTransportObjectActions<
  string, string, { number: string }, string[],
  MyEntry[]                      // ← new
>;

// 2. Read the position rather than leaving it out.
const listed = await actions.readObjects(task);      // ← new member
const entry = listed.ok
  ? listed.getResult().value.find((o) => o.name === 'ZCL_X')
  : undefined;
if (entry) await actions.removeObject(task, { ...entry });

// 3. Name the user the task is for.
await actions.createTask(request, { targetUser: 'DEVELOPER' });
```

Both old call shapes compile against 1.2.0 and cannot work: `createTask(n)` throws where an implementation reads `options.targetUser`, and `removeObject(n, { name, type })` answers a success while removing nothing. That is why this is a major rather than a deprecation — there is no window in which the old shape does something useful.

`src/__typechecks__/transportObjectActions.ts` holds both wrong shapes as `@ts-expect-error`, so a future loosening stops compiling instead of shipping.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade is **deleted** as of its 52.0.0, which was never published — npm still serves 51.0.0, with every symbol re-exported and deprecated, to anyone pinned to it. There is nothing further to move to: take the package that declares the name.

## Licence

`LGPL-3.0-only`.
