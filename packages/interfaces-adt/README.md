# @mcp-abap-adt/interfaces-adt
[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)

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
- Since 30.0.0 the text elements of a program, a class or a function group — text symbols, selection texts, list and column headings — are their own contract (`/sap/bc/adt/textelements/…`, lock class `TEXT`): `IAdtTextElementsReadable` reads one part, `IAdtTextElementsUpdatable` writes one whole part from a typed document (`ITextSymbol`, `ISelectionText`, `ITextHeadings`), `ITextElementsResults`. The tables gain the API `textElements` (`PROG/PX`, `CLAS/OCX`, kind `text_elements`) on S/4HANA and ABAP cloud: a map over `AdtApiName`, `AdtTypeCode`, `AdtObjectKind`, `CodesOfMain<'PROG'>`, `CodesOfMain<'CLAS'>` or a union derived from the tables — the utility, group activation and where-used codes among them (`AdtUtilityCode`, `AdtGroupActivationCode`, `AdtWhereUsedCode`) — adds the members; the reason for the major. The typed `activateObjects` / `activateObjectsGroup` take the text elements' reference beside the object's. See "Text elements" and "Migrating to 30.0.0".
- Since 30.2.0 the abapGit contracts have key-based members and facts forms: one atom per member (`IAdtAbapGitPullRepo`, `IAdtAbapGitRunLog`, `IAdtAbapGitPush`, … fourteen in all), each generic over its result `T` and its route's facts `F`, answering `IAbapGitStructuredError` by default (status and T100 key, never SAP's text); the new forms of `link` and `checkExternalRepo` take `credentials: IAbapGitCredentials | null`. The legacy members are deprecated and unchanged apart from `credentials?: never` on the options of `link`, `pull` and `checkExternalRepo`; the one edge case that no longer compiles is in the CHANGELOG. See "abapGit: key-based members and facts".
- Since 30.1.0 a settings write is typed by the system kind: on the cloud it requires `isWritableByAMDP` (a cloud write without it reset it to `false`, measured; 30.0.0 refused it on a write), on premise it refuses it (nothing maps it there, Code). `IAdtTableSettingsPatchable.patchMetadata` reads, overlays `ITableSettingsChangesOf<V>` and writes the whole document with `If-Match` (decision 51). What it breaks is in the CHANGELOG. See "A table's technical settings".
- Since 29.0.0 `ITableSettings.translation` is an `ITableTranslation`, the `ts:translation` element's four attributes, where 28.0.0 had a string: a `ts:translation` element written with an attribute missing is refused (400 `00/001`), and an absent element is accepted (both measured on both systems). See "Migrating to 29.0.0".
- Since 28.0.0 a table's technical settings (`TABL/DTT`, `tableSettings` in the on-premise and cloud tables) are their own contract: `ITableSettingsConfig`, `ITableSettingsUpdateConfig` with the full `ITableSettings`, the write atom `IAdtTableSettingsUpdatable` and `ITableSettingsResults`. A map over `AdtApiName`, `AdtTypeCode`, `AdtObjectKind`, `CodesOfMain<'TABL'>` or a union derived from the tables (`AdtApi<V>`, `AdtTypeCodeOf<V>`, `AdtApiWith<V, Op>`, …) adds the new member — the reason for the major. See "A table's technical settings" and "Migrating to 28.0.0".
- Since 27.0.0 `IUtilResults` requires `objectActivation`, the reading of the new atom `IAdtObjectActivation` (`activateObjects`, the synchronous `POST /activation` for several objects); `activate` takes `IAdtActivationOptions` (`preauditRequested`); and `IAnalyse` takes an optional third parameter, `IAdtAnalyseContext`. See "Activation" and "Migrating to 27.0.0".
- Since 25.2.0 `update` and `updateMetadata` take `IAdtUpdateOptions`: `IAdtOperationOptions` with `ifMatch`, the ETag a read answered, sent as `If-Match` so the system refuses a write over a changed document (`412`). Additions only.
- Since 25.1.0 `IAtcResultsReadable` reads the ATC results the system holds: `listResults` (`IAtcResultListOptions`, `createdBy` required) and `getResult` by Display ID. Additions only.
- Since 25.0.2 the on-premise table lists `mainPrograms` for `PROG/I` (25.0.1), and `IIncludeResults` has a required `mainPrograms` slot.
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
- Since 27.3.0 `IAdtError` carries what the connection said about the SAP session — `sessionError` (an `ADT_SESSION_ERROR` code) and `sessionLost` — and `IAdtResult` carries `sessionLost` beside `value`; `ADT_CONNECTION_CAUSES` lists `EPIPE`. Additions only, apart from the list's length. See "A connection failure's cause" and "The SAP session".
- Depends on `@mcp-abap-adt/interfaces-adt-connection` `^5.0.0` (since 27.4.0; `IAdtError.sessionError`, `IAdtError.sessionLost` and `IAdtResult.sessionLost` are its `AdtSessionErrorCode` and `AdtSessionLoss`, the latter first declared in 4.2.0), and on nothing else. Types and constants; no implementation.

## Install

```bash
npm install @mcp-abap-adt/interfaces-adt
```

## What it holds

| directory | files | what |
|---|---|---|
| `adt/` | 44 | the object contracts: capability atoms, the object types, the ADT type tables and their entry shape, `IAdtResponse`, `IAdtError`, the error codes, the transport request's object list |
| `runtime/` | 14 | runtime analysis: the debuggers (`IAbapDebugger`, `IAmdpDebugger`) and `IMemorySnapshots`, `IProfiler`, the trace contracts (`ITraceListing`/`ITraceReading`, `ICrossTrace`, `ISt05Trace`), `IApplicationLog`, `IAtcLog` and the ATC run (`IAtcRunOptions`, `IAtcFindings`) and its results (`IAtcResultsReadable`), `IDdicActivation`, `IGatewayErrorLog`, `IRuntimeDumps`, `ISystemMessages` (the collection only; see the 31.0.0 migration in the CHANGELOG) |
| `execution/` | 3 | class and program execution, with profiling |
| `feeds/` | 2 | the ADT feed contracts |
| `service/` | 1 | service definitions and bindings |
| `shared/` | 1 | what more than one object type needs |

Six directories, all ADT. `connection/` left for `interfaces-adt-connection` in 11.0.0. `sap/`, `auth/`, `token/`, `session/`, `serviceKey/`, `store/`, `validation/` and `Headers.ts` were here until 9.0.0 and are listed above under what left; `__typechecks__/` holds 47 files that compile shapes this contract must and must not accept, and ships in no tarball. Two of them, `abapGit.ts` and `abapGitLegacyCalls.ts`, import `@mcp-abap-adt/interfaces-adt` by name and resolve it through `dist/index.d.ts` (`tsconfig.typecheck-entry.json`), so a standalone `npm run test:check` needs `npm run build` first; the root `npm run check` and CI build first.

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

## Activation

Three members activate, one endpoint each:

| member | request | answer |
|---|---|---|
| `IAdtActivatable.activate` | `POST /activation`, one object | in the body |
| `IAdtObjectActivation.activateObjects` | `POST /activation`, several objects | in the body; read through `IUtilResults.objectActivation` |
| `activateObjectsGroup` (`IAdtGroupLifecycle`, `IAdtTypedGroupLifecycle`) | `POST /activation/runs`, several objects | `202` and the run in `Location`; read through `IUtilResults.activation` |

The two group members take the same references (`IAdtGroupActivationReference<V>`
for the typed atoms). Which endpoint a system offers is in its discovery; the
caller reads it and picks the member. Each member sends one request, with one
exception: when `activate` or `activateObjects` is answered `chkl:messages`
with `activationExecuted="false"` and no message, it reads
`GET /activation/inactiveobjects` once more and hands that answer to the
reading (`IAdtAnalyseContext`, below). `activateObjectsGroup` reads nothing
more: on the runs path that read, after `getActivationResults`, is the
caller's, which holds the references the run was started with.

**The preaudit.** `activate` takes `IAdtActivationOptions`
(`src/adt/IAdtObject.ts`): `IAdtOperationOptions` with `preauditRequested`,
sent as the request's `preauditRequested`; absent, the member's default. The
group members take it as their positional `preauditRequested`. An answer
listing the objects still inactive (`ioc:inactiveObjects`) activated nothing;
sending the activation again with `preauditRequested: false` is the caller's
next call.

**The facts beside the answer.** `IAnalyse` takes an optional third parameter,
`IAdtAnalyseContext`. Its `activation` carries the uris the activation request
named and the answer to one `GET /activation/inactiveobjects`, for an answer
that does not tell by itself whether the objects were activated. Only an
activating member fills it, and only when it read that list. A reading of two
parameters ignores it. `src/__typechecks__/activationOptions.ts`,
`analyseContext.ts` and `objectActivation.ts` hold these shapes.

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

The members that take `headers`: `IAdtAbapGitClient`: `link`, `pull`, `checkExternalRepo`; `IAdtAbapGitLinkNewForm`: `link`; `IAdtAbapGitCheckExternalRepoNewForm`: `checkExternalRepo`; `IAdtAbapGitPullRepo`: `pullRepo`; `IAdtAbapGitPullRepoInDialog`: `pullRepoInDialog`; `IAdtAbapGitBranchInfo`: `getBranchInfo`; `IAdtCreatable`: `create`; `IAdtUpdatable`: `update`; `IAdtMetadataUpdatable`: `updateMetadata`; `IAdtDeletable`: `delete`, `checkDeletion`; `IAdtCheckable`: `check`; `IAdtActivatable`: `activate`; `IFeatureToggleObject`: `checkState`; `IAdtTransportObjectActions`: `removeObject`, `addObject`, `createTask`, `changeTaskType`; `IAdtTransportMoveObjects`: `moveObjects`; `IAbapUnitRunner`: `runSync`; `IAdtWhereUsed`: `getWhereUsed`, `getWhereUsedScope`; `IAdtVirtualFolders`: `getVirtualFoldersContents`; `IAdtRepositoryStructure`: `fetchNodeStructure`; `IAdtGroupLifecycle`: `activateObjectsGroup`, `checkDeletionGroup`, `deleteObjectsGroup`; `IAdtObjectActivation`: `activateObjects`; `IAdtDataPreview`: `getSqlQuery`, `getTableContents`; `ITraceScheduling`: `scheduleTrace`; `IAbapDebugger`: `setBreakpoints`, `getChildVariables`, `getVariables`, `syncBreakpoints`, `setDebuggerSettings`; `IAmdpDebugger`: `getDataPreview`.

The field is on each member's own options, not on `IAdtAnalyseOptions` or
`IAdtOperationOptions`. `src/__typechecks__/headersOnEveryMember.ts` holds this
for every member and every overload.

## A connection failure's cause

An `IAdtError` of `origin: 'connection'` may carry `connectionCause`: the
network code the request was thrown with, when it is one of
`ADT_CONNECTION_CAUSES` — `ECONNREFUSED`, `ECONNRESET`, `ENOTFOUND`,
`EAI_AGAIN`, `ETIMEDOUT`, `EHOSTUNREACH`, `ENETUNREACH`, `EPIPE` (since
27.3.0: a write to a socket the server had reset, on an established
connection) — typed `AdtConnectionCause`. Any other code, or none, leaves the field absent. A
consumer answers "no connection" from the code, without reading `message`.

The list holds no TLS codes: they are `interfaces-auth`'s
(`TLS_FAILURE_CODES`), and this package depends on `interfaces-adt-connection`
alone. The field is optional, so a strategy that does not name the cause still
conforms. `src/__typechecks__/connectionCause.ts` holds these shapes.

An `IAdtError` of `origin: 'connection'` thrown by an RFC call may also carry
`rfc`: what the RFC SDK said, as `interfaces-adt-connection`'s
`IRfcErrorInfo` (`key`, `group`, `code`, `codeString`). A consumer reads the
outcome from `rfc.codeString` (`RFC_CLOSED`, say), never from `message`. The
field is absent for an HTTP failure and for a refusal, and optional, like
`connectionCause`. `src/__typechecks__/rfcField.ts` holds these shapes.

## The SAP session

Since 27.3.0 an answer says, by field, what the connection said about the SAP
session, so a consumer never reads it from `message`:

- `IAdtError.sessionError` — the connection's session error code an
  `origin: 'connection'` failure was thrown with, one of `ADT_SESSION_ERROR`
  (`ADT_NOT_CONNECTED`, `ADT_SESSION_REPLACED`, `ADT_RELEASE_PENDING`), typed
  `AdtSessionErrorCode`. Separate from `code`, the strategy's failure code.
- `IAdtError.sessionLost` and `IAdtResult.sessionLost` — present when the
  request the answer answers was answered with the SAP session replaced
  (`interfaces-adt-connection`'s `sessionLost`, typed `AdtSessionLoss`). The
  answer is SAP's, failure or value; the connection's session is gone with it.

```typescript
if (!answer.ok) {
  const error = answer.getError();
  if (
    error.sessionError === ADT_SESSION_ERROR.NOT_CONNECTED ||
    error.sessionLost !== undefined
  ) {
    // this connection is spent
  }
} else if (answer.getResult().sessionLost !== undefined) {
  // the value stands; the next request needs a new connection
}
```

Each field is optional, `| undefined` for `exactOptionalPropertyTypes`, so an
error or a result built for 27.2.0 still conforms.
`src/__typechecks__/sessionError.ts` and `src/__typechecks__/sessionLost.ts`
hold these shapes.

## abapGit: key-based members and facts (30.2.0)

Every new member is addressed by what SAP gave the caller: a repository's
`key` from `listRepos`, or a remote `url`. Each one answers through the
**facts** contract. A result strategy and an analyser are given
`IAbapGitFactsResponse<F>` (the integer `status` and the route's `facts`), never
the wire document. The default error, `IAbapGitStructuredError`, carries
`facts` (`status`, `messageClass?`, `messageNumber?`, `gitHttpStatus?`), one of
the fixed sentences of `ABAPGIT_ERROR_MESSAGES` in `message` (`refused`,
`refusedWithMessage`, `gitHostRefused`, `noResponse`, `unreadableAnswer`,
`judgedByAnalyser`; the type is `AbapGitErrorMessage`, and no other string
compiles), no `response`, `rfc`, `adtType`, `namespace` or `code`, and a `request` of method and path. A
credential is never part of either.

```ts
import type {
  IAbapGitFactsAnalyse,
  IAbapGitStructuredError,
  IAdtAbapGitPullRepo,
} from '@mcp-abap-adt/interfaces-adt';
import { ADT_NO_FAILURE } from '@mcp-abap-adt/interfaces-adt';

declare const git: IAdtAbapGitPullRepo<MyPull, PullFacts>;

const answer = await git.pullRepo(
  { key: repo.key, branchName: repo.branchName },
  { headers },
);
if (!answer.ok) answer.getError().facts.messageClass; // IAbapGitStructuredError

interface MyError extends IAbapGitStructuredError { readonly retry: boolean }
const mine: IAbapGitFactsAnalyse<PullFacts, MyError> = (verdict, answer) =>
  verdict === ADT_NO_FAILURE ? verdict : { ...verdict, retry: answer?.status === 409 };
const judged = await git.pullRepo(args, { headers, analyse: mine });
if (!judged.ok) judged.getError().retry; // MyError, no cast
```

**The atoms**, one per member, each `IAdtAbapGit…<T, F>`: `T` is the result
the slot's reader gives the caller and `F` the facts the analyser sees. Each
has exactly two overloads, for the caller's error subtype `E` or for the
default, and no wire-typed one, so an `IAnalyse` or an `IResultStrategy` does
not fit.

| Atom | Member | Args | Options |
|---|---|---|---|
| `IAdtAbapGitListReposQuiet` | `listReposQuiet` | none | `IAbapGitQuietOptions` (no credential: `credentials?: never`), optional |
| `IAdtAbapGitLinkNewForm` | `link` | `IAbapGitLinkNewArgs` | `IAbapGitHeaderOptions & IAbapGitNewFormOptions` |
| `IAdtAbapGitCheckExternalRepoNewForm` | `checkExternalRepo` | `IAbapGitExternalRepoArgs` | `IAbapGitHeaderOptions & IAbapGitNewFormOptions` |
| `IAdtAbapGitPullRepo` | `pullRepo` | `IAbapGitPullRepoArgs` | `IAbapGitHeaderOptions & IAbapGitFactsOptions` |
| `IAdtAbapGitPullRepoInDialog` | `pullRepoInDialog` | `IAbapGitPullRepoArgs` | `IAbapGitHeaderOptions & IAbapGitFactsOptions` |
| `IAdtAbapGitBranchInfo` | `getBranchInfo` | `IAbapGitBranchInfoArgs` | `IAbapGitHeaderOptions & IAbapGitFactsOptions` |
| `IAdtAbapGitModifiedObjects`, `IAdtAbapGitStatus`, `IAdtAbapGitStaging`, `IAdtAbapGitCheckRepo` | `getModifiedObjects`, `getStatus`, `getStaging`, `checkRepo` | `IAbapGitRepoKeyArgs` | `IAbapGitFactsOptions`, optional |
| `IAdtAbapGitRunLog` | `getRunLog` | `IAbapGitRunLogArgs` | `IAbapGitFactsOptions`, optional |
| `IAdtAbapGitPush` | `push` | `IAbapGitPushArgs` | `IAbapGitFactsOptions`, optional |
| `IAdtAbapGitFile` | `getFile` | `IAbapGitFileArgs` | `IAbapGitFactsOptions`, optional |
| `IAdtAbapGitSwitchBranch` | `switchBranch` | `IAbapGitSwitchBranchArgs` | `IAbapGitFactsOptions`, optional |

The options do not extend `IAdtAnalyseOptions`, because their `analyse` is an
`IAbapGitFactsAnalyse`. `IAbapGitFactsOptions` takes an optional `credentials`.
`listReposQuiet` sends no credential, so its `IAbapGitQuietOptions` carry `credentials?: never`. `IAbapGitNewFormOptions` requires it: an `IAbapGitCredentials` (`user`,
`password`; a token goes as the password), or `null` for an anonymous call.
`undefined` is neither. A consumer composes its client from the atoms and, for
the new forms, puts them beside the legacy client:
`IAdtAbapGitClient<…> & IAdtAbapGitLinkNewForm<T, F> & …`.

**The legacy members** of `IAdtAbapGitClient` keep their signatures, their
wire-typed callbacks and their result types, and are deprecated:
`getErrorLog` in favour of `getRunLog`, `pull` in favour of `pullRepo`, and the
`remoteUser`/`remotePassword` forms of `link` and `checkExternalRepo` in favour
of the new forms. The options of `link`, `pull` and `checkExternalRepo` carry
`credentials?: never`, and the new args carry `remoteUser?: never` and
`remotePassword?: never`, so the two forms cannot be mixed. Every call that
compiled against 30.1.x still compiles, with one exception: an options
**variable** with an extra, undeclared `credentials` property is now refused,
or, when its value is a credential or `null` and the args fit, it selects the
new form. `src/__typechecks__/abapGitLegacyCalls.ts` holds the legacy calls and
the exception. `src/__typechecks__/abapGit.ts` holds the new forms and what
they refuse. Both import `@mcp-abap-adt/interfaces-adt` by name and compile against the
built package (`tsconfig.typecheck-entry.json`, run by `npm run test:check`).

## Text elements (30.0.0)

The text elements of a program, a class or a function group — text symbols,
selection texts, list and column headings — are a resource of their own,
`/sap/bc/adt/textelements/{programs|classes|functiongroups}/{name}`, one
sub-resource per part (`…/source/symbols`, `…/source/selections`,
`…/source/headings`), each with its media type
`application/vnd.sap.adt.textelements.{part}.v1` (with that `Accept` SAP
answers the part's text; with `*/*`, and with `{part media type}, text/plain,
*/*`, it answered an HTML page, measured on premise), and under their own lock — lock class `TEXT`, taken on the text
elements' address, which the program's or the class's lock does not cover. So
they are not part of `IProgramConfig` or `IClassConfig`, and the tables list
them as the API `textElements` (kind `text_elements`): `PROG/PX` under
`/sap/bc/adt/textelements/programs` and `CLAS/OCX` under
`/sap/bc/adt/textelements/classes`, with `read`, `update`, `lock` and `unlock`,
on S/4HANA and ABAP cloud. SAP_BASIS 7.40's discovery has no such collection,
and its table has no entry. Read and written on premise and on the cloud,
2026-11-19, for a program and a class.

- **What discovery lists** (S/4HANA 2025 and ABAP cloud alike; SAP_BASIS
  7.40 none): three collections — `/sap/bc/adt/textelements/programs`,
  `…/classes`, `…/functiongroups` — each accepting
  `application/vnd.sap.adt.textelements.v1+xml` (the properties document) and
  with no templates. No other kind (interface, function module, include) has
  one. The parts and their media types are not in discovery: they are links
  of the properties document.
- **Which parts an object has.** A class has text symbols only; a program and
  a function group have all three (SAP's handler, `CL_SEDX_ADT_RES_TEXTELEMENT`).
  `ITextElementsPartConfig` and `ITextElementsUpdateConfig` hold this: a class
  with another part does not compile.
- **Read** with `IAdtTextElementsReadable`: `read(config, version?)`, the
  object and its part. `version` is every value SAP's handler maps
  (`get_wb_version`), measured on premise for a program's selection texts:
  - absent, `inactive` and `workingArea` answer the working area — the
    inactive version when there is one, else the active one;
  - `active` answers the last activated version: before the first activation
    only the screen fields' `?...` placeholders, after a change the text as
    activated.
  SAP reads the value case-insensitively, and an unknown or empty value
  answers the working area (measured on premise). On the cloud every value is
  accepted and none distinguished (no inactive version existed, measured
  read-only). The answer is the part's text, CR LF between lines (measured on
  premise and on the cloud):
  - symbols: `@MaxLength:20`, then `001=Text`, one empty line between symbols;
  - selections: every parameter and select option of the program, sorted by
    name, the name upper case and padded to eight (`P_TEST  =Text`), an empty
    line between two entries; a field with no text yet `?...`; a text taken
    from the dictionary after its own `@DDICReference` line, answered as the
    field's label (`ISelectionText.ddicReference`, required). A write takes
    the name padded or not; a text over `SELECTION_TEXT_MAX_LENGTH` (30)
    characters refuses the whole write (`406`, `SEDX_ADT/110`); and a text
    sent with `@DDICReference` is replaced by the label (all measured);
  - headings: `listHeader=…`, an empty line, `columnHeader_1=…` to
    `columnHeader_4=…` — all five, an empty one as `columnHeader_4=`; a write
    deletes a heading sent empty or left out (measured).
  The keys, measured and in SAP's handlers, are constants for a caller (the
  contract checks none): `TEXT_SYMBOL_KEY_MAX_LENGTH` (3 accepted, `0#1` and
  `AB1` included; 4 refused `406` `SEDX_ADT/106`; shorter not measured), `SELECTION_TEXT_NAME_MAX_LENGTH` (8; `406`
  `SEDX_ADT/102`; an unknown name is stored, not checked against the screen),
  `TEXT_HEADING_KEYS` / `TextHeadingKey` (any other key `406`
  `SEDX_ADT/101`).
  `TextElementsDocument` is the parsed shape a reading strategy answers.
- **Write** with `IAdtTextElementsUpdatable`: its `update` takes
  `ITextElementsUpdateConfig` — the object, the part and the part's **whole**
  list — and builds the body from it (decision 50); the options refuse a
  `source` and require the `lockHandle`. **An entry the list leaves out is
  deleted**: create, change and delete are the same write. An empty list
  deletes the part's every entry.
- **The original language only.** SAP reads and writes the texts in the
  object's original language whatever the logon language (a write under
  `sap-language` RU on premise and DE on the cloud landed in the original EN,
  measured). There is no language here, and no translation.
- **The sequence is the caller's:**
  1. `lock` the object's text elements (`IAdtLockable<ITextElementsConfig,
     'objectKind' | 'objectName'>`, stateful);
  2. `read` the part under the lock — what it holds now;
  3. change the list;
  4. `update` with the lock handle (and `transportRequest` as `corrNr`);
  5. `unlock`, on every path;
  6. activate the object **and** its text elements in one activation request,
     through the typed `activateObjects` (`IAdtObjectActivation`) or
     `activateObjectsGroup` (`IAdtTypedGroupLifecycle`) of the variant: the
     object's reference and the text elements' —
     ```ts
     // on premise: a program
     const refs: IAdtGroupActivationReference<'onprem'>[] = [
       { name: 'ZPROG', type: 'PROG/P', uri: '/sap/bc/adt/programs/programs/zprog' },
       { name: 'ZPROG', type: 'PROG/PX', uri: '/sap/bc/adt/textelements/programs/zprog' },
     ];
     // on the cloud: a class — { type: 'CLAS/OC', … } and
     // { type: 'CLAS/OCX', uri: '/sap/bc/adt/textelements/classes/zcl_x' }
     ```
     `PROG/PX` and `CLAS/OCX` are utility codes with `groupActivation` on
     premise and on the cloud (as `DEVC/K` is), not an `activate` of the
     `textElements` API. Naming the object alone ran no activation for the
     text elements (measured on premise for a program and on the cloud for a
     class; each other pairing is unmeasured, `measured: false`). A function
     group's text elements go as `PROG/PX` with
     `/sap/bc/adt/textelements/functiongroups/{group}` (measured on premise).
- **Where-used**, per code (measured read-only, 2026-11-19; SAP's handler
  `CL_RIS_ADT_RES_REFERENCES` refuses no type, and answers `200` with no
  result and "Where-Used List is not supported for &1" where it serves none,
  Code):
  - `PROG/PX`: served on premise and on the cloud —
    `/sap/bc/adt/textelements/programs/{name}` resolves to `PROG/PX` (on
    premise the scope offers `PROG/P` and `PROG/PS`; on the cloud, measured
    for the delivered `RSPARAM`). A function group's text elements resolve
    to `PROG/PX` too (`/sap/bc/adt/textelements/functiongroups/{group}`), so
    they are found through it; `FUGR/PX` is no where-used type.
  - A `PROG/PX` where-used names its `container`, `'program'` or
    `'functionGroup'` (required; no other code takes one), and the address is
    derived from it: `/sap/bc/adt/textelements/programs/{name}` or
    `…/functiongroups/{name}`.
  - `CLAS/OCX`: not served on the on-premise and cloud systems measured
    ("Where-Used List is not supported for Text Element: Class."; the answer
    depends on the system's RIS metadata, Code), so no where-used parameter
    takes it.
  - A part's address (`…/source/symbols`) is not served.
- **On the cloud** the lock answers `MODIFICATION_SUPPORT=NoModification`, and
  the write is accepted and saved all the same (measured).
- **A function group** (measured on premise, 2026-11-19): its text elements
  are at `/sap/bc/adt/textelements/functiongroups/{group}`, the plain group
  name (`…/sapl{group}` answers 404; the earlier 404 on `sutl` was a group
  that does not exist). The properties document names them `FUGR/PX`; after
  a write the inactive list holds the group (`FUGR/F`) and its text elements
  as `PROG/PX`, named `SAPL{GROUP}`; one activation naming the group's URI
  and the text elements' URI, each with `adtcore:name="{GROUP}"`, activates
  both. No release's `typestructure` lists `FUGR/PX`, so it is no code of
  the tables: the contract reads, locks and writes a function group's text
  elements by kind and name, and types them `PROG/PX` under their own URI —
  `{ name: 'ZFG', type: 'PROG/PX', uri:
  '/sap/bc/adt/textelements/functiongroups/zfg' }`, beside `FUGR/F` or alone,
  activates them (measured on premise; the name may be `{GROUP}` or
  `SAPL{GROUP}`, the URI decides).

## A table's technical settings (28.0.0)

A database table's technical settings — data class, size category,
buffering, logging — are a resource of their own,
`/sap/bc/adt/ddic/db/settings/{name}` (`TABL/DTT`, content type
`application/vnd.sap.adt.table.settings.v2+xml`), with their own ETag and
their own lock (ESDICT `TABT`, which the table's lock does not cover). So they
are not part of `ITableConfig` or `ITableResults`, and the tables list them as
the API `tableSettings` (kind `table_settings`) on S/4HANA and ABAP cloud,
with `readMetadata`, `updateMetadata`, `lock` and `unlock`. SAP_BASIS 7.40
does not serve the collection, and its table has no entry.

- **Read** with `IAdtMetadataReadable<ITableSettingsConfig, …>`: the
  document, `ts:tableSettings`. SAP creates default settings when it creates a
  table, so a read right after the create answers them (`version="new"`).
- **Write** with `IAdtTableSettingsUpdatable`: its `updateMetadata` takes
  `ITableSettingsUpdateConfig` — the table's name, its `description` (SAP
  refuses a write without one, SWB_TOOL 019, measured on premise and on the
  cloud) and
  `ITableSettings` — and builds the body from it (decision 49); the options
  refuse a `source` and require the `lockHandle`.
- **An update replaces every setting: read, change, write back.** SAP writes
  the whole DD09L row from the document and resets a field it leaves out, so
  every field the document carries is required (`CL_TABT_WB_PERSIST->move_adt_to_ddv`,
  Code on both systems; a field left out read back reset, measured on both,
  2026-11-19). `translation` is the `ts:translation` element's four attributes
  (`ITableTranslation`: `value`, `isVisible`, `isEditable`, `granularity`,
  since 29.0.0), written back as read. SAP's transformation reads the element
  inside a `tt:cond` (Code): absent, the PUT is accepted (200); present, it
  needs all four — `<ts:translation ts:value=""/>` and `<ts:translation/>`
  were refused 400 `00/001` with an `XML_PATH` property (measured on both).
  The contract keeps the element required. SAP stores `value` alone
  (`move_adt_to_ddv` writes `uebersetz` from `translation-value` only, Code
  on both); the other three are computed on a read. `buffering.areaKeyFields`
  (`SCHFELDANZ`) is written only when the resulting type is `G` (Code on
  both): after a type change away from `G`, and whenever the resulting type
  is not `G`, the count is not kept.
- **`isWritableByAMDP`, per system kind (since 30.1.0).** The cloud's
  `move_adt_to_ddv` writes `allowed_for_amdp_write` from the document (Code,
  cloud), and a cloud PUT without the element reset it to `false` (measured).
  30.0.0 refused it on a write, so every cloud write through the contract
  reset it. Now the write is typed by the variant: `ITableSettingsOf<'cloud'>`
  **requires** it, `ITableSettingsOf<'onprem'>` **refuses** it (neither the
  on-premise transformation nor its `move_adt_to_ddv` maps it, Code), and
  `ITableSettingsUpdateConfig<V>` / `IAdtTableSettingsUpdatable<T, V>` take
  the variant (default: a value of either kind). A cloud read
  (`ITableSettingsReadOf<'cloud'>`) is written back as it is.
  **Activation rule (since 30.1.1):** `true` is accepted by the PUT, but
  activating the table then requires buffering `N`, logging off and no
  replacement object; otherwise activation answers with message DT 771
  "AMDP writes to table &1 not possible (&2)". Code (cloud): `RADTTCHK` FORM
  `chk_writable_amdp_usage` establishes all three conditions. Measured
  (cloud, adt-clients live runs on 2026-11-19): the PUT with the flag on
  was accepted, and activation answered HTTP 200 with DT 771 in two
  separate runs, once with "(Logging activated)" and once with "(Buffering
  allowed)"; the replacement-object case is Code only. On premise (Code):
  message class DT has no 771, and `RADTTCHK` holds no AMDP check.
- **Patch** with `IAdtTableSettingsPatchable<T, V>` (since 30.1.0, decision
  51): `patchMetadata` takes the table and `ITableSettingsChangesOf<V>` — at
  least one setting; `buffering` field by field, with `areaKeyFields` only
  beside type `G` or with the type kept — and then refused before any PUT
  when the type read is not `G`; `translation` by its `value`, the one
  attribute SAP stores; `isWritableByAMDP` on the cloud only — and, under the
  caller's `lockHandle`, reads the working area with its ETag, overlays the
  changes, and writes the whole document with `If-Match`. Every setting not
  named keeps the value read — with one exception: when the resulting
  buffering type is not `G` (a type-only change from `G` to `P`, say), SAP
  clears the area-key count, since it writes `SCHFELDANZ` only for `G`
  (`move_adt_to_ddv`, Code on both). The patch does not block that change:
  the count means nothing for the other types. Its headers name the media type alone
  (`IAdtTableSettingsPatchHeaders`): the implementation sends the PUT's
  `Content-Type` without a charset (`headers.accept` is the literal
  `TABLE_SETTINGS_MEDIA_TYPE`), so no caller's charset reaches the guarded
  write.
- **What the types cannot see.** The per-kind rules are TypeScript's
  structural checks. A caller who widens the variant (a cloud writer used as
  `IAdtTableSettingsUpdatable<T>`, a generic forwarding the default) or
  carries extra keys through a variable, a union or a spread passes values
  the rules would refuse as literals. A shipped implementation writes only
  what SAP persists, and `patchMetadata` is the safe path: it writes back
  what it read.
- **The sequence is the caller's, and its order keeps a concurrent edit:**
  1. `lock` (stateful) — the settings' own lock;
  2. `readMetadata` under the lock — what the settings are now, after any edit
     made before the lock was taken;
  3. change what you mean to change in what was read;
  4. `updateMetadata` with the lock handle (and `transportRequest` as
     `corrNr`), passing the read's ETag as `ifMatch`
     (`IAdtTableSettingsUpdateOptions` keeps it from `IAdtUpdateOptions`), so
     the system can refuse a write over a changed document (`412`). Measured on
     both, with a fresh ETag: `If-Match` and no charset → `200`; the same with
     `; charset=utf-8` → `412` `SADT_RESOURCE/043`; a charset and no
     `If-Match` → `200`. A stale ETag was never measured here;
  5. `unlock`, on every path;
  6. then activate the **table**. Activating `TABL/DT` activated the
     settings, measured on premise and on the cloud; activating `TABL/DTT`
     alone was never measured, and the contract offers no activation of the
     settings. **Judge the activation by its messages, not by
     `activationExecuted` alone.** A PUT of the data class `ZZNOP` (five
     characters, no such class) was answered `200` and stored; activating the
     table then answered `activationExecuted="true"`
     `generationExecuted="false"` with type-`E` messages, and the table and
     its settings stayed inactive (measured on both). On premise: "Activation
     was cancelled." and "Value in field Data Class (value ZZNOP not
     permitted)"; on the cloud: "Value in field Data Class; value ZZNOP not
     permitted" (`DT(609)`). `ZZNOPE` (six characters) was refused by the PUT
     itself, 400 `00/001` at deserialisation, `XML_PATH …dataClassCategory(1)`
     — the field's length (measured on both).

The codes are strings, since a system may define its own: a PUT of the
customer data class `USER` was accepted and read back (measured on both). The
value help lists the standard classes only (`CL_TABT_DATA_CLASS_VH`, `ddclass =
'STD'`, Code). The known values are constants for discovery, not limits:
`TABLE_DATA_CLASSES` — the data class value help's six on
S/4HANA 2025 (`APPL0`, `APPL1`, `APPL2`, `DDIM`, `DFACT`, `DODS`), measured;
`TABLE_SIZE_CATEGORIES` (`'0'`–`'9'`), `TABLE_BUFFERING_ALLOWED` (`N`, `X`,
`A`) and `TABLE_BUFFERING_TYPES` (`P`, `G`, `X`) — SAP's standard domain
values, not measured. Each has its `Known…` type.

## Optional fields take `undefined` (27.4.0)

Under `exactOptionalPropertyTypes`, the optional fields of the object configs
(every `…Config`), `IAdtError`, `IAdtOperationOptions`, `IDebuggerIdentity`,
the options of `getActivationRun` and `getVirtualFoldersContents`, the runtime
readers' options declared here (`IFeedQueryOptions`, the profiler trace
options, `IClassUnitTestRunOptions` with `IUnitTestScope`,
`IUnitTestResultOptions`), `IAdtClientOptions` and `IAdtSystemContext` are
`?: T | undefined`: a caller passes a possibly absent value as it holds it,
with no spread to leave the key out. An absent field and an `undefined` one
mean the same. The CHANGELOG lists each type;
`src/__typechecks__/explicitUndefined.ts` holds the shapes.

## Migrating to 30.0.0

- **Every union that widens**, found by a compile-time probe of each export
  of 29.0.0 against 30.0.0 (every variant `onprem`, `cloud`, `basis740` and
  `'onprem' | 'cloud'`; every operation). No union of `basis740` widened; its
  where-used parameters tighten as every variant's do (below).
  - The API names: `AdtApiName`, `keyof AdtApiTable<R>`, `AdtApi<V>`, and
    `AdtApiWith<V, Op>` / `AdtApiWithIn<T, Op>` for `Op` among `read`,
    `update`, `lock`, `unlock` — gain `textElements`; and with `AdtApiName`
    every `parent` that names an API: `IAdtCodeFacts<R>['parent']`,
    `IAdtCodelessApiEntry<R>['parent']`, and so `AdtApiEntry<R>['parent']`
    (`IAdtCodedApiEntry<R>`'s codes carry it).
  - The codes: `AdtTypeCode`, `AdtTypeCodeOf<V>`, `AdtCodeOf<V>`,
    `AdtCodeOfIn<Tables, V>`, and `AdtTypeCodeWith<V, Op>`, `AdtCodeWith<V, Op>`,
    `AdtCodeWithIn<Tables, V, Op>` for the same four operations — gain
    `'PROG/PX'` and `'CLAS/OCX'`; `CodesOfMain<'PROG'>` gains `'PROG/PX'` and
    `CodesOfMain<'CLAS'>` gains `'CLAS/OCX'`.
  - The kinds: `AdtObjectKind` gains `'text_elements'`.
  - The utility codes: `AdtUtilityCode` gains both codes, and
    `AdtUtilityCodeWith<V, 'groupActivation'>` gains them through the utility
    tables (`IAdtUtilityCodeTables`); so do `AdtGroupActivationCode<V>` and
    `IAdtGroupActivationReference<V>['type']` — what `activateObjects` and the
    typed `activateObjectsGroup` take.
  - Where-used, per code as measured: `AdtWhereUsedCode<V>`, so
    `IAdtWhereUsedParamsOf<V>['object_type']` and
    `IAdtWhereUsedScopeParamsOf<V>['object_type']`, gain `'PROG/PX'` on
    `onprem`, `cloud` and the default `'onprem' | 'cloud'`, as the untyped
    `IGetWhereUsedParams['object_type']` and
    `IGetWhereUsedScopeParams['object_type']` do. `CLAS/OCX` is in none of
    them: the systems measured serve no where-used for it.
  - **`PROG/PX` names its container in a where-used.** `IGetWhereUsedParams`
    and `IGetWhereUsedScopeParams` (and so `IAdtWhereUsedParamsOf<V>` /
    `IAdtWhereUsedScopeParamsOf<V>`) are type aliases now, not interfaces:
    with `object_type: 'PROG/PX'` they require `container: 'program' |
    'functionGroup'` (`TextElementsWhereUsedContainer`), which decides the
    address (`/sap/bc/adt/textelements/programs/{name}` or
    `…/functiongroups/{name}`), and every other code refuses a `container`.
    What a consumer does:
    - a literal with another code compiles as before;
    - a value whose `object_type` is a variable of the whole union (it may be
      `PROG/PX`) needs the `container` when it is `PROG/PX` — narrow the code
      first, or build the `PROG/PX` case apart;
    - `interface X extends IGetWhereUsedParams` (the default, a union) no
      longer compiles (`TS2312`), nor does a generic
      `interface X<C extends …> extends IGetWhereUsedParams<C>` (the type is
      a conditional over `C`): use a type alias with `&`
      (`type X<C extends …> = IGetWhereUsedParams<C> & { … }`), or extend a
      single code's params (`IGetWhereUsedParams<'PROG/P'>` still does);
    - a builder typed by the union — `(code: AdtWhereUsedCode<V>):
      IAdtWhereUsedParamsOf<V> => ({ object_name, object_type: code })`,
      generic in `V` or for one variant — no longer compiles (`TS2322`): the
      code may be `PROG/PX`, which needs its `container`. Generic in `V`,
      exclude it from the input (`code: Exclude<AdtWhereUsedCode<V>,
      'PROG/PX'>`) — branching on `code === 'PROG/PX'` still fails there
      (`TS2322`), since the code stays generic. For one variant the branch
      compiles too (`code === 'PROG/PX' ? { …, container } : { … }`);
    - a value of another code that carries a `container` of its own — say
      `{ object_type: 'PROG/P', container: string }` built for a consumer's
      own use — no longer passes as where-used parameters, on every variant
      `basis740` included (whose where-used has no `PROG/PX` at all): drop
      the field before passing it (`const { container, ...params } = value`);
    - `object_type` and `container` are `readonly`, like the text elements'
      `objectKind` and `part`: code that assigns them on a built value builds
      a new one instead (`{ ...params, object_type: … }`, the container
      stated with it).
  - **An explicit type argument that no longer fits.** `IGetWhereUsedParams`
    and `IGetWhereUsedScopeParams` constrain `C` to every code but
    `CLAS/OCX`, so `IGetWhereUsedParams<AdtTypeCode>` and
    `IGetWhereUsedScopeParams<AdtTypeCode>` (or with `| AdtGroupOnlyCode`)
    stop compiling with `TS2344`: `AdtTypeCode` now holds `CLAS/OCX`. Drop
    the argument and use the default (every code where-used is asked of),
    use the variant's `IAdtWhereUsedParamsOf<V>` /
    `IAdtWhereUsedScopeParamsOf<V>`, or pass
    `Exclude<AdtTypeCode, 'CLAS/OCX'>`. These two are the only exported
    generics where a type argument valid on 29.0.0 is refused on 30.0.0 —
    found by instantiating every exported generic with its 29.0.0
    constraints under 30.0.0's names (generics whose constraint names a
    sibling parameter, such as `AdtCodeOfIn<Tables, V>`, take the caller's
    own tables and were not instantiated).
  - References and answers: `IObjectReference['type']` (default
    `AdtTypeCode`), `IAdtCodedReference<AdtTypeCode>['type']` and
    `IAdtCodedReference<AdtCodeOf<V>>['type']`, and the known-code branch of
    `IAdtAnsweredObject['type']` gain both codes.
  - The tables themselves: `IAdtTypeTables` (a `textElements` entry on
    `onprem` and `cloud`) and `IAdtUtilityCodeTables` (two codes on each).
- **What a consumer does.** A map keyed by any of these
  (`{ [C in AdtTypeCode]: … }`, `Record<AdtObjectKind, …>`, …) adds the new
  keys; a `switch` that relies on exhaustiveness over one (a `never` check in
  its `default`) adds the cases — `textElements` / `'text_elements'` for an
  API or a kind, `'PROG/PX'` and `'CLAS/OCX'` for a code, which is a program's
  or a class's text elements, addressed under `/sap/bc/adt/textelements/…`.
  A consumer that maps a code to an address or a reader handles them, or
  refuses them, there. A consumer reading an `IAdtAnsweredObject` gets
  either code as `type`, typed, where 29.0.0 carried it as `unknownType`, the
  text as it came. Nothing that only passes values through changes.
  The main types (`AdtMainType`) are unchanged: `PROG` and `CLAS` were there.

## Migrating to 29.0.0

- **`translation` is an object.** `ITableSettings.translation` (and so
  `ITableSettingsRead.translation` and `ITableSettingsUpdateConfig.settings.translation`)
  is `ITableTranslation` — `{ value, isVisible, isEditable, granularity }` —
  where it was the `ts:value` string. A settings write built from 28.0.0 sent
  `ts:value` alone and SAP refused it, 400 `00/001` — on premise "The system
  expected the attribute '{…}isVisible'", on the cloud "The attribute
  '{…}isVisible' was expected" (measured, 2026-11-19).
  Pass all four as read: `translation: { value: '', isVisible: false,
  isEditable: false, granularity: '2' }` is what the systems read answered.

## Migrating to 28.0.0

- **An exhaustive map over the type-table unions adds the table settings.**
  `AdtApiName` gains `tableSettings`, `AdtTypeCode` and `CodesOfMain<'TABL'>`
  gain `'TABL/DTT'`, `AdtObjectKind` gains `'table_settings'`. So does every
  union derived from the tables for the on-premise and cloud variants:
  `AdtApi<V>`, `AdtTypeCodeOf<V>`, `AdtCodeOf<V>`, and the projections by
  operation — `AdtApiWith<V, Op>`, `AdtTypeCodeWith<V, Op>`, `AdtCodeWith<V,
  Op>`, `AdtApiWithIn<T, Op>` — wherever `Op` is among `readMetadata`,
  `updateMetadata`, `lock` and `unlock`. A map keyed by any of them, or a
  `switch` relying on exhaustiveness over one, adds the member.

## Migrating to 27.0.0

- **A result set for the utilities adds `objectActivation`.** `IUtilResults`
  now requires it: the reading of what `activateObjects` answers. A set built
  for 26.x stops compiling until it names one, e.g. the strategy that
  keeps the document as it came (`rawDocument` in `@mcp-abap-adt/adt-strategies`).
- Nothing else breaks. An `activate` implementation declaring
  `IAdtOperationOptions` still implements `IAdtActivatable`, and an `IAnalyse`
  of two parameters is still one.

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
