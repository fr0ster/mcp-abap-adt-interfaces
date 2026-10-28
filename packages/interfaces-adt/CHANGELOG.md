# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [23.0.0] - 2026-10-28

### Changed (breaking)

- **`ADT_TYPES_CLOUD`: a program and an include list what a delivered one
  answers, as measured.** ABAP cloud has no program or include of one's own:
  its discovery gives neither collection an `app:accept`, and the create is
  refused (`403`, S_DEVELOP). Measured on the BTP trial 2026-10-28 on a
  delivered program and include:
  - answered: `read`, `source`, `readMetadata`, `check` and `versions` (the
    program's), `deletionCheck` (its `del:checkResponse`, not deletable), the
    enhancement elements and options, and for a program the ABAP Unit run, its
    status and result, and the synchronous run;
  - refused: `transport` (`404`), `run` and `profile` (`200` with "You are not
    authorized to execute this object" as the body).

  So `PROG/P` lists `read`, `source`, `readMetadata`, `check`, `versions`,
  `deletionCheck`, `readEnhancementElements`, `readEnhancementOptions`,
  `unitTestRun`, `unitTestRunSync`, `unitTestStatus` and `unitTestResult`,
  and `PROG/I` `read`, `source`, `readMetadata`, `deletionCheck` and the two
  enhancement reads. Against 22.0.0 that removes `transport`, `run` and
  `profile` from `PROG/P` — a narrowing, so a major — and adds
  `deletionCheck` to both, which 22.0.0 had dropped by inference. A change of
  an object (`create`, `update`, `updateMetadata`, `lock`, `unlock`,
  `activate`, `delete`) and `validate`, which only prepares a create, stay
  out. `AdtCodeWith<AdtModernVariant, Op>` follows.
- **`ADT_TYPES_CLOUD`: a feature toggle (`FTG2/FT`) is only read.** A table
  lists a read where its release's discovery has the endpoint, and an
  operation that changes an object (`create`, `update`, `updateMetadata`,
  `lock`, `unlock`, `activate`, `delete`, a feature toggle's `switchOn` and
  `switchOff`, and the `validate` that prepares a create) only where its
  release's `typestructure` gives the code, or its parent code, `CREATE` in
  `USER_AUTHORIZATIONS`. ABAP cloud gives `FTG2/FT` none, and the create
  answers `403` (measured on the BTP trial 2026-10-28): it keeps `read`,
  `source`, `readMetadata`, `check`, `deletionCheck`, `getRuntimeState` and
  `checkState`. On S/4HANA 2025 the code has `CREATE` and keeps every
  operation; a system may still refuse one — E19 answers `403` "It is not
  allowed to create/update feature toggles in this system" (`FTG2/035`), a
  setting of that system, which reaches the caller as the system's answer.

## [22.0.0] - 2026-10-28

A major for one change: the ABAP cloud table loses the program and include
operations the cloud refuses (see "Changed (breaking)"). Everything else is
added beside 21.0.0's types: each keeps its meaning, and a type parameter
added to an existing type has the 21.0.0 type as its default.

### Changed (breaking)

- **`ADT_TYPES_CLOUD`: a program and an include change nothing.** ABAP cloud
  refuses to create either (`403`, S_DEVELOP, measured on the BTP trial
  2026-10-28), so `PROG/P` and `PROG/I` no longer list `create`, `update`,
  `lock`, `unlock`, `activate`, `validate`, `deletionCheck` or `delete`.
  What a delivered one answers stays: `read`, `source` and `readMetadata`
  (measured on both), `check` and `versions` for a program (measured),
  and the operations not measured — the enhancement reads, `transport`,
  `run`, `profile` and the unit-test runs — as the release's `typestructure`
  lists them. Leaving out the change operations beyond `create` is an
  inference from the refusal: S_DEVELOP is the change authorization, and an
  object nobody can create has nothing of one's own to change. A function
  include (`FUGR/I`) is unchanged: the cloud creates one (`200`, measured).
  `AdtTypeCodeWith<'cloud', Op>` and `AdtCodeWith<AdtModernVariant, Op>` no
  longer name `PROG/P` or `PROG/I` for those operations, and the cloud table
  is no longer the on-premise one in operations.

### Added

- **`updateMetadata`** on `CLAS/OC`, `INTF/OI`, `FUGR/FF` and `DDLS/DF` in
  `ADT_TYPES_ONPREM` and `ADT_TYPES_CLOUD`, and on `PROG/P` in
  `ADT_TYPES_ONPREM`: the object's whole metadata document, written back with
  the media type it was read with, answers `200` on S/4HANA 2025 and on ABAP
  cloud (measured 2026-10-27). 7.40 is not measured yet and keeps none.

- **Intersecting helpers.** `AdtCodeOf<V>` and `AdtCodeWith<V, Op>`: the codes
  every variant of `V` lists (with `Op`) — the default modern variant,
  `AdtModernVariant` (`'onprem' | 'cloud'`), gets what both newer tables
  serve. `AdtCodeOfIn<Tables, V>` and `AdtCodeWithIn<Tables, V, Op>` are the
  same over any set of tables; `AdtServingVariantsIn<Tables, A>` and
  `AdtPerformingVariantsIn<Tables, A, Op>` name the variants whose table
  serves an API, or one of its codes an operation. `AdtTypeCodeOf`,
  `AdtTypeCodeWith`, `AdtApiWith` and `AdtApiWithIn` are unchanged; their docs
  now state what they answer for a union of variants — the APIs all of them
  serve, and for those the codes and operations any of them lists.
- **Utility code tables**, `ADT_UTILITY_CODES_ONPREM`, `_CLOUD`,
  `_BASIS_740` (`IAdtUtilityCodeTables`, `AdtUtilityCodeTable<R>`,
  `IAdtUtilityCodeFacts<R>`, `AdtUtilityOperation`, `AdtUtilityCodeWith<V,
  Op>`, `AdtUtilityCode`): the codes `getUtils()` takes beyond the API tables,
  each with its operations, whether they were measured, and its evidence.
  - `VIEW/DV`, a DDIC database view, on every release: group activation,
    group deletion and where-used, under `/sap/bc/adt/ddic/views`. No API
    serves it — a **group-only code**, `AdtGroupOnlyCode`,
    `AdtGroupOnlyCodeOf<V>`. Sent, unmeasured.
  - `DEVC/K` in a group activation on the newer releases — sent, unmeasured.
  - `DEVC/K` in `fetchNodeStructure` on 7.40 — measured (the legacy
    `UtilsReaders` cycle). A table of its own rather than a package entry on
    7.40, because an entry would gate `getPackage()` open where every package
    member is refused, and a new `AdtOperation` word would break a 21.0.0
    consumer's exhaustive map over the vocabulary.
- `IObjectReference<C>`, `IGetWhereUsedParams<C>` and
  `IGetWhereUsedScopeParams<C>` take a group-only code as their type
  argument (`IObjectReference<'VIEW/DV'>`). Their defaults are 21.0.0's: a
  bare `IObjectReference` still admits `AdtTypeCode` alone.
- **What each group operation is given:** `AdtGroupActivationCode<V>`,
  `AdtGroupDeletionCheckCode<V>`, `AdtGroupDeletionCode<V>` (no `MSAG/NN`,
  which has no address of its own), `AdtWhereUsedCode<V>` (no `FUGR/I` or
  `MSAG/NN`), and the references over them, `IAdtGroupActivationReference<V>`,
  `IAdtGroupDeletionCheckReference<V>`, `IAdtGroupDeletionReference<V>`,
  `IAdtWhereUsedParamsOf<V>`, `IAdtWhereUsedScopeParamsOf<V>`, built by
  `IAdtCodedReference<C>`: `parentName` required for each parented code, and
  a reference from a code known only by its set compiles when it names its
  parent — inside TypeScript's 25-combination limit.
- `IAdtTypedGroupLifecycle<TActivation, TDeletionCheck, TDeletion, V>` and
  `IAdtTypedWhereUsed<TWhereUsed, TScope, V>`: the group and where-used members
  over those references. New atoms beside `IAdtGroupLifecycle` and
  `IAdtWhereUsed`, with the same member names: an implementation declaring
  both offers both signatures, and a caller passing `IObjectReference[]` is
  unaffected. Adding the signatures to the 21.0.0 atoms instead would have
  made every implementation of them stop compiling.
- `IAdtTypeStructure<TTypeStructure>`: `getTypeStructure({ headers })`,
  `POST /sap/bc/adt/repository/typestructure`, an atom of its own like
  `IAdtObjectProperties`, and `IUtilResults.typeStructure`, its reading —
  optional, so a 21.0.0 result set is still one.

## [21.0.0] - 2026-10-27

### Added

- **The ADT type tables**, one per release variant: `ADT_TYPES_ONPREM`
  (S/4HANA 2025 on-premise), `ADT_TYPES_CLOUD` (ABAP cloud) and
  `ADT_TYPES_BASIS_740` (SAP_BASIS 7.40 SP04), `as const`, keyed by API — the
  client's factory name. Each entry holds its `kind`, its `collection` and its
  `codes`; each code its `parent` API, `nameMaxLength`, `operations` and
  `evidence`, the corpus case of the release's `typestructure` answer, and,
  where it lives elsewhere than its API, its own `collection` (the enhancement
  codes: `/sap/bc/adt/enhancements/enhoxhh`, `/enhoxhb`, `/enhsxsb`). The
  local class includes and the transport request are entries with
  `codes: {}`, their `parent`, `operations` and `evidence` on the entry. An
  API the 7.40 client refuses whole is absent from its table, and an operation
  it refuses is absent from its code.
- The operations' closed vocabulary, `AdtOperation`. The ABAP Unit runners'
  four members are four operations, `unitTestRun`, `unitTestRunSync`,
  `unitTestStatus` and `unitTestResult`, because 7.40 serves them apart: there
  `run` and `runSync` are served for a class, a program and a function group,
  only `runSync` for a function module, and `getStatus` and `getResult` for
  none (no run id to poll or fetch).
- The entry shape every table `satisfies` (`AdtApiTable<R>`, `AdtApiEntry<R>`,
  `IAdtCodedApiEntry<R>`, `IAdtCodelessApiEntry<R>`, `IAdtCodeFacts<R>`,
  `AdtApiName`, `AdtOperations`, `AdtCollection`, `AdtTypeEvidence<R>`,
  `AdtCheckedTable<T>`): a misspelt field, an operation outside the
  vocabulary, an API with no factory, another release's evidence, a codeless
  entry without evidence or a coded entry without a code does not compile.
- The variants and the types derived from the tables: `AdtVariant`
  (`'onprem' | 'cloud' | 'basis740'`), `IAdtTypeTables`, `AdtApi<V>`,
  `AdtTypeCode`, `AdtTypeCodeOf<V>`, `AdtApiWith<V, Op>` and
  `AdtApiWithIn<T, Op>` (the APIs one code of which performs every operation
  of `Op` — operations spread across two codes do not count),
  `AdtTypeCodeWith<V, Op>`, `AdtObjectKind`, `AdtSourceTypeCode`,
  `AdtParentedTypeCode`.
- `IAdtAnsweredObject`: `{ type: AdtTypeCode }` or `{ unknownType: string }`,
  exclusive — what a code read from an answer is, so an unknown one reaches the
  consumer as the text ADT sent rather than being dropped.
- `AdtObjectIdentity<TConfig, TParent>`: what an identifying member takes —
  `Partial<TConfig>` itself when `TParent` is `never`, otherwise every field
  optional but `TParent`, which is required.

### Changed (breaking)

- **The identifying atoms take the parent's field as a last type parameter,**
  `TParent extends keyof TConfig = never`: `IAdtReadable`,
  `IAdtMetadataReadable`, `IAdtEnhancementHost`, `IAdtIncludeEnhancementHost`,
  `IAdtDeletable` (after `TChecked`), `IAdtValidatable`, `IAdtCheckable`,
  `IAdtActivatable`, `IAdtLockable`, `IAdtVersionable`, `IAdtTransportAware`.
  Their `config` is `AdtObjectIdentity<TConfig, TParent>`. With the default it
  is `Partial<TConfig>` — the same type as before, so an existing contract and
  code generic in `TConfig` compile unchanged. A contract whose API has a
  parent passes its field: `functionGroupName` for a function module and a
  function include, `className` for the four local class includes and for a
  message class message; its identifying members then require it.
- **`IObjectReference` is generic in its code,**
  `IObjectReference<C extends AdtTypeCode = AdtTypeCode>`: `type` is `C`, and
  `parentName` is required when `[C] extends [AdtParentedTypeCode]` —
  `IObjectReference<'FUGR/FF'>` needs it — and optional otherwise, the default
  included. The condition is not distributive: a reference built from a code
  typed `AdtTypeCode` compiles, and an interface can extend `IObjectReference`
  (a union of one member per code exceeds TypeScript's 25 combinations and
  cannot be extended). The group operations take `IObjectReference[]`, so a
  caller that wants the parent enforced types its references by code.
- **Every code parameter is a code of the tables:**
  - `IAdtObjectAccess`: `readObjectSource` and `getObjectSourceUri` take an
    `AdtSourceTypeCode` (the codes the library reads a source of);
    `readObjectMetadata` and `supportsSourceCode` an `AdtTypeCode` (any
    object has metadata, and asking whether a code has source is asked of any
    code).
  - `IAdtRepositoryStructure.fetchNodeStructure(parentType)` and
    `getObjectStructure(objectType)` take an `AdtTypeCode`: the node and
    object structures are asked of any object — a package's contents, a
    class's includes, a program's parts — so no narrower set is stated.
  - `IGetWhereUsedScopeParams.object_type` and `IGetWhereUsedParams.object_type`
    are an `AdtTypeCode`: where-used is asked of any object.
  - `ISearchObjectsParams.objectType` is an `AdtTypeCode`: the search filters
    by any code.

### Removed (breaking)

- `AdtObjectTypeLower`, `AdtObjectType`, `AdtSourceObjectTypeLower` and
  `AdtSourceObjectType`. With them go the codes no release lists, which no
  table holds: `INTF/IF`, `STRU/DT`, `STRU/DS`, `TTYP/DF`, `TTYP/TT`,
  `TTYP/ST`, `DOMA/DM`, `BDEF/BD`, `BIMP/BIM`, `BIMP/`, `BIMPL/`, `FUGR/FC`,
  `FUNC`, bare `SCGR`, `DSFD/DSF`, `DSFI/DSF`, `SUSO/O`, the bare `FUGR` and
  `DTEL`, the lower-case spellings and the friendly names.

### Known library defects, entered as served

The tables declare what the library sends, so two members that send a request
known or inferred to fail are entered as served rather than hidden:

- `transformation` `validate` posts to `/sap/bc/adt/xslt/validation`, which
  answers `404` — a known-wrong address.
- `enhancement` `versions` for `ENHO/XHB` and `ENHS/XSB` addresses
  `…/source/main/versions`, which these source-less codes lack — an inferred
  `404`, unmeasured.

### Migration

- Replace `AdtObjectType` with `AdtTypeCode` and `AdtSourceObjectType` with
  `AdtSourceTypeCode` — or `AdtTypeCodeOf<V>` / `AdtTypeCodeWith<V, 'source'>`
  where the variant is known — and pass upper-case codes: `'CLAS/OC'` for
  `'class'`, `'FUGR/FF'` for `'functionmodule'`, `'DDLS/DF'` for `'view'`.
- Replace each dropped code with the one the releases list: `INTF/IF` →
  `INTF/OI`; `STRU/DT`, `STRU/DS` → `TABL/DS`; `DOMA/DM` → `DOMA/DD`;
  `BDEF/BD` → `BDEF/BDO`; `BIMP/BIM`, `BIMP/`, `BIMPL/` → `CLAS/OC`;
  `DSFD/DSF` → `DSFD/SCF`; `DSFI/DSF` → `DSFI/SFI`; `SUSO/O` → `AUTH`;
  `FUNC` → `FUGR/FF` for a module, `FUGR/F` for a group; `FUGR/FC` and `SCGR`
  have no replacement the library serves.
- `TTYP/DF`, `TTYP/TT` and `TTYP/ST` become `TTYP/DA` **where any code is
  taken** — `readObjectMetadata`, `supportsSourceCode`, a reference, a
  where-used or search parameter. A table type has no source: `TTYP/DA` is no
  `AdtSourceTypeCode`, so a `readObjectSource` or `getObjectSourceUri` call
  on a table type has no replacement and goes — read its document with
  `readObjectMetadata`.
- A contract whose API has a parent passes its field to the identifying atoms
  — `IAdtReadable<IFunctionModuleConfig, R, 'functionGroupName'>` — and a
  caller then names it. An `IObjectReference<'FUGR/FF'>` or
  `IObjectReference<'FUGR/I'>` names `parentName`.
- Type a result's code read from an answer as `IAdtAnsweredObject`, and handle
  `unknownType`.
- An implementation that declares `(config: Partial<TConfig>, …)` still
  satisfies every atom; nothing an implementation sends changes.

## [20.2.0] - 2026-10-24

### Added

- The result-set contracts, each in its object's `IAdtX.ts` beside its config,
  under the name `@mcp-abap-adt/adt-clients` gave it: `IClassResults` (one
  interface, also what behavior implementation and the local includes take),
  `IProgramResults`, `IIncludeResults`, `IInterfaceResults`, `IDomainResults`,
  `IDataElementResults`, `IAuthorizationFieldResults`, `IStructureResults`,
  `ITableResults`, `ITableTypeResults`, `IDdlResults`, `IFunctionGroupResults`,
  `IFunctionModuleResults`, `IFunctionIncludeResults`, `IPackageResults`,
  `IMessageClassResults`, `IMessageClassMessageResults<TRead, TWritten,
  TDeleted>` (generics and defaults kept), `IAccessControlResults`,
  `ITransformationResults`, `IServiceDefinitionResults`,
  `IScalarFunctionResults`, `IScalarFunctionImplementationResults`,
  `IUtilResults` (`IAdtUtilities.ts`), `IServiceResults`
  (`IAdtServiceBinding.ts`), `IFeatureToggleResults`,
  `IAppendStructureResults`, `IBehaviorDefinitionResults`,
  `IMetadataExtensionResults`, `IEnhancementResults` and `ITransportResults`
  (`IAdtTransport.ts`). Each is a `readonly` slot map of
  `IResultStrategy<unknown>`: a consumer composes its client contract from these
  and the atoms, so the contract no longer has to be taken from the
  implementation.
- `IServiceBindingPublicationConfig`: what a caller must name to change a
  binding's publication, in the signature they call.

## [20.1.0] - 2026-10-21

### Added

- `IAdtObjectProperties<TProperties>`: `getObjectProperties(objectUri, options?)`
  over `/sap/bc/adt/repository/informationsystem/objectproperties/values?uri=`,
  the uri sent URL-encoded, with the two call signatures every atom has (a
  caller's error strategy, or the library's verdict). Measured on premise
  (SAP_BASIS 816, 2026-10-21): `200`,
  `application/vnd.sap.adt.repository.objproperties.result.v1+xml`, an
  `opr:objectProperties` document; a transaction is named by its workbench uri
  `/sap/bc/adt/vit/wb/object_type/trant/object_name/{name}`, and the
  `/sap/bc/adt/transactions/{name}` uri answers `422`. Its own atom, not part
  of `IAdtInformationSystem`, so no existing implementation has to change.

## [20.0.0] - 2026-10-18

### Removed (breaking)

- `IAdtClientOptions.enableAcceptCorrection`. The contract carries how headers
  are passed — `headers: IAdtHeaders` with the call, on the members whose
  request sets both — and correcting a format the server refused (a `406` or
  `415`) is the consumer's own. `@mcp-abap-adt/adt-clients` 36.0.0 removes accept
  negotiation.

### Migrating from 19.0

Drop `enableAcceptCorrection` from the client options. A consumer that wants a
refused format corrected does it itself: read the formats the server offers
from the `406` or `415` (adt-clients exports the parsers for both), and call
again with the `headers` that match.

## [19.0.0] - 2026-10-18

### Changed (breaking)

- A member whose request sets both `Accept` and `Content-Type` takes them as
  the pair `options.headers: IAdtHeaders`, **required**: both fields, sent
  exactly as given, nothing supplied by the member. Which request sets what was
  read from `@mcp-abap-adt/adt-clients` (the main write of a chain; the majority
  where implementations disagree). The field is on each member's own options,
  not on `IAdtAnalyseOptions` or `IAdtOperationOptions`. The members: `IAdtAbapGitClient`: `link`, `pull`, `checkExternalRepo`; `IAdtCreatable`: `create`; `IAdtUpdatable`: `update`; `IAdtMetadataUpdatable`: `updateMetadata`; `IAdtDeletable`: `delete`, `checkDeletion`; `IAdtCheckable`: `check`; `IAdtActivatable`: `activate`; `IFeatureToggleObject`: `checkState`; `IAdtTransportObjectActions`: `removeObject`, `addObject`, `createTask`, `changeTaskType`; `IAdtTransportMoveObjects`: `moveObjects`; `IAdtWhereUsed`: `getWhereUsed`, `getWhereUsedScope`; `IAdtVirtualFolders`: `getVirtualFoldersContents`; `IAdtRepositoryStructure`: `fetchNodeStructure`; `IAdtGroupLifecycle`: `activateObjectsGroup`, `checkDeletionGroup`, `deleteObjectsGroup`; `IAdtDataPreview`: `getSqlQuery`, `getTableContents`; `ITraceScheduling`: `scheduleTrace`; `IAbapDebugger`: `setBreakpoints`, `getChildVariables`, `getVariables`, `syncBreakpoints`, `setDebuggerSettings`; `IAmdpDebugger`: `getDataPreview`.
- Their options parameter is required, and a positional parameter before it
  that was optional is now `T | undefined`: `IAdtCheckable.check` (`status`), `IFeatureToggleObject.checkState` (`opts`), `IAdtGroupLifecycle.activateObjectsGroup` (`preauditRequested`) and `deleteObjectsGroup` (`transportRequest`).

### Unchanged on purpose

- A member whose request sets only one of the two headers, or neither, takes no
  `headers` and keeps its 18.0.0 signature. `IReadOptions.accept` stays.

### Migrating from 18.0

Pass `headers: { accept, contentType }` in the options of every member listed
above; the headers the implementation used to choose are now the caller's. Pass
`undefined` for a positional parameter that was optional before the options.
Implementations send `options.headers` as given.

## [18.0.0] - 2026-10-15

17.1.0 was tagged but never published and is superseded by 18.0.0.

### Changed (breaking)

- `IAdtEnhancementHost` no longer takes `context` on either member;
  17.0.0 had it on `readEnhancementElements`.

### Added

- `IAdtIncludeEnhancementHost<TConfig, TElements, TOptions>` takes optional
  `context` on both reads, naming the include's main program (`SAPLSVIM` for
  an include of function group SVIM). Without context, both reads answered
  400 ED/258 "No main program for include … found" (E19, 2026-10-15).
  An include with a single main program is unmeasured, so context stays optional.

### Migrating from 17.0

An implementer of `IAdtEnhancementHost` drops `context`. An include host
implements `IAdtIncludeEnhancementHost`. A caller passing `context` to a
class, program or function-group host removes it.

## [17.0.0] - 2026-10-15

### Removed (breaking)

- `EnhancementType` no longer accepts `enhoxh` (class enhancement) or `enhsxs`
  (plain enhancement spot). Reads answered 500 on E19 (2026-10-15) and on
  premise + trial in mcp-abap-adt `5046d8a6` (2026-10-02), which also measured
  Eclipse opening them in SAP GUI. Neither has a content type in trial discovery.
  The remaining subtypes are `enhoxhb` (ENHO/XHB), `enhoxhh` (ENHO/XHH), and
  `enhsxsb` (ENHS/XSB). The ABAP Cloud trial refuses the `enhoxhh` collection
  (403 on create and read; no content type in its discovery).

### Added

- `IAdtEnhancementHost<TConfig, TElements, TOptions>` declares
  `readEnhancementElements` and `readEnhancementOptions`, with per-call analysis
  and optional main program context for an include's elements.
- `IEnhancementConfig.enhancedObject`, `enhancementOption` and `enhancementMode`
  describe the host, full option name and S/D mode needed to create ENHO/XHH.

### Migrating from 16.0

A caller passing `enhoxh` or `enhsxs` now gets a compile error. Remove those
ADT calls and use SAP GUI for these objects: reads answered 500 wherever
measured (see above). When creating ENHO/XHH, supply `enhancedObject`
(including its main program name), the full `enhancementOption` from the
host's options, and `enhancementMode` (`S` or `D`).

## [16.0.0] - 2026-10-12

### Removed (breaking)

- **`IAdtClientOptions.signal` and `IAdtError.refusal`** (added in 15.4.0).
  The per-request signal is gone from the connection contract
  (`@mcp-abap-adt/interfaces-adt-connection` 3.0.0): ABAP cannot cancel or roll
  back a request, and a session's logoff is what releases its locks.
  `refusal` existed to carry an authentication refusal for that work; the
  connection's own error message already names the refusal and its hint.

### Changed

- `@mcp-abap-adt/interfaces-adt-connection` `^3.0.0`.

### Migrating from 15.4

Drop `signal` from client options and any read of `IAdtError.refusal`. Code
written for 15.3 compiles unchanged, apart from the dependency range.

## [15.4.0] - 2026-10-12

### Added

- **`IAdtClientOptions.signal?: AbortSignal | (() => AbortSignal | undefined) | undefined`**
  — read at each request and handed to the connection as the request's own
  signal (`IAbapRequestOptions.signal`, interfaces-adt-connection 2.1.0): once
  it aborts, nothing more of that request is sent. A function answers the
  signal of the request being sent, so one client serves several callers. A
  release that undoes a step (an unlock after a lock) is sent without it.
- **`IAdtError.refusal?: unknown`** — the authentication refusal the request
  failed with, as the connection threw it: the thrown value's own `refusal`
  (`AuthRefusedError`) or `error` (`AuthProviderFailure`), unchanged; read it
  with `@mcp-abap-adt/auth-errors`' `classify`. Never present for an answer of
  SAP (a `403` with an ADT message is an ADT error, not a refusal).

### Changed

- `@mcp-abap-adt/interfaces-adt-connection` `^2.1.0` (the request's signal and
  `ADT_REQUEST_ERROR`).

## [15.3.0] - 2026-10-12

### Added

- **`IAdtTransportMoveObjects<TMoved>`**: `moveObjects(sourceTask,
  targetNumber, objects, options?)`, the transport organizer's *Move Objects*.
  Addressed at the source task, the target named in the request, each entry by
  its `position` in the source. Captured from Eclipse ADT 3.60.3 and measured on
  premise (BASIS 816), 2026-10-12: one and two entries per call answered `200`
  with the entries echoed, and re-reading both tasks showed them moved. A
  contract of its own, so no implementation of `IAdtTransportObjectActions`
  breaks.

## [15.2.0] - 2026-10-12

### Added

- **`IAdtTransportSortAndCompress<TCompressed>`**: `sortAndCompress(taskNumber,
  options?)`, the transport organizer's *Sort and compress* of a task's object
  list. A task holding the same entry twice refuses `removeObject` on one copy
  with TR292, *"sort and compress first"*; ADT discovery lists no action for
  it, and Eclipse ADT 3.60.3 calls it. Measured on premise (BASIS 816),
  2026-10-12: `200`, no body, and the task read back held each object once. A
  contract of its own, so no implementation of `IAdtTransportObjectActions`
  breaks.

## [15.1.0] - 2026-10-12

### Added

- **`debuggee?: IDebuggeeIds` on the plain class and program run**
  (`IClassExecuteOptions`, `IProgramExecuteOptions`): the terminal id and IDE id
  a terminal-mode listener catches a run by. They travel in the request's
  `SAP-PASSPORT` header, the way the ADT client sends them; a run URL has no
  parameter for them. Measured on premise (2026-10-12, BASIS 816): a run with the
  ids is caught by the listener with those ids and by no other, and without them
  a terminal-mode listener catches nothing. The ids do not separate the
  breakpoints: `setBreakpoints` under other ids still replaces the SAP user's
  set.

## [15.0.0] - 2026-10-11

### Changed (breaking)

- **`skipCount` is removed from every breakpoint kind.** The server ignores it
  on external breakpoints (measured on premise, 2026-10-11, BASIS 816).
  Migration: drop `skipCount` from the breakpoints you build; it no longer
  compiles.

### Added

- **`clientId?: string` on every breakpoint kind**: the caller's own tag, echoed
  by the server on the breakpoint's row of the answer, placed or refused, so the
  answer pairs with the request whatever order the rows come in. Optional: set
  it to pair answers; unique per request is the caller's responsibility.

### Changed (docs)

- `setBreakpoints` replaces the key's set; it does not add (measured on premise,
  2026-10-11, BASIS 816, also with `validationOnly`). `stopListener` deletes the
  key's breakpoints.
- `syncBreakpoints` and `IDebuggerBreakpointSync` no longer claim to be the
  replacing call: they add an explicit name for the destructive call, `full`
  with an empty set to clear the key, and `partial` scoped to the main programs
  of the named objects.

## [14.0.0] - 2026-10-11

### Changed (breaking)

The ABAP debugger by mode (`adt-clients` #217). Migration:

- **`IDebuggerIdentity` is a union by `debuggingMode`**, required, with no
  default. Add `debuggingMode: 'user'` to every identity you build today;
  `requestUser` exists only in `user` mode. It is now a type union, not an
  interface: `interface X extends IDebuggerIdentity` no longer compiles; use an
  intersection or name a union member. `terminal` mode takes `terminalId`
  and `ideId` and no `requestUser`; no catch in it was measured as of
  2026-10-11.
- **`attach` takes the identity** instead of `requestUser`:
  `attach(identity, debuggeeId, options?)`.
- **`condition` is on line breakpoints only.** Setting it on an exception,
  statement or message breakpoint no longer compiles, which is the point: the
  server evaluates it on a line breakpoint only.
- **`IAbapDebugger` gains a type parameter, `TSettings`**, last, and **five
  required members** that implementations and mocks must add: `syncBreakpoints`,
  `checkListener`, `detachDebugger`, `terminateDebugger`, `setDebuggerSettings`.

### Added

- `skipCount` on every breakpoint kind.
- `IDebuggerLineBreakpoint`, and `IDebuggerBreakpointSync`: replace the
  identity's breakpoints (`full`) or the line breakpoints of the named objects'
  main programs (`partial`; at least one object, line breakpoints only).
- `IDebuggerSettings`: what to change at a stop; a field left out keeps its
  value, except `showDataAging`, which is turned off when left out.

## [13.2.0] - 2026-10-10

### Added

- **The service binding's two reads beyond its lifecycle, as atoms.** Until now
  a binding's handler could only be typed by its implementation, because these
  members had no contract (`adt-clients` #109).
  - `IAdtServiceBindingTypes` — `getServiceBindingTypes`: the binding types the
    system offers, a catalogue (`nameditem:namedItemList`).
  - `IAdtServiceGroupReadable` — `getServiceGroup(params)`: the service group a
    binding publishes, its URL prefix, services and publication state. A read,
    which is what tells a publication's outcome — not a job, not a generation.
  - `IServiceGroupParams`, the read's argument, moves here from
    `adt-clients`, which declared it locally.

  Measured on premise and on SAP BTP ABAP Environment (2026-10-10). Every
  member takes the error strategy with the call; both are in
  `errorStrategyOnEveryMember`.

## [13.1.0] - 2026-10-10

### Added

- **The debugger contracts, measured.** Withdrawn from `@mcp-abap-adt/interfaces`
  in 30.0.0 until they could come back "measured: one member per endpoint";
  they were measured on premise (HTTP and RFC) and on SAP BTP ABAP
  Environment, and come back here.
  - `IAbapDebugger` — the ABAP debugger in user mode: breakpoints, listener,
    attach, stack, variables, steps, watchpoints, a value set, termination,
    and the debuggee's memory (sizes, and a snapshot written).
    `IDebuggerIdentity`, `IDebuggerBreakpoint`, `IDebuggerStepMethod`,
    `IDebuggerStepToLineMethod`, `IAttachOptions`.
  - `IAmdpDebugger` — the AMDP debugger, a protocol of its own: session,
    breakpoints, events, steps, a debuggee ended, stop, and a table
    variable's rows. `IAmdpBreakpoint`, `IAmdpStepMethod`,
    `IStartAmdpDebuggerOptions`, `IGetAmdpDataPreviewOptions`.
  - `IMemorySnapshots` — the memory snapshots the system lists, each view of
    one and the deltas between two. `IMemorySnapshotsListOptions`,
    `ISnapshotRankingListOptions`, `ISnapshotChildrenOptions`,
    `ISnapshotReferencesOptions`.

  What the measurement decided in the shape:
  - **Two sessions.** The ABAP listener holds one; each debuggee caught is
    attached on another, named by its application server. On a system with
    more than one server an attach on the listener's session is refused
    whenever the debuggee runs elsewhere. The AMDP debugger likewise answers
    its events on one session and takes its commands on another.
  - **Run to a line takes the line as an argument.** Without it SAP answers
    400, and on one release (BASIS 758) the program ran to its end in the
    same moment, losing the stop; on BASIS 816 and on SAP BTP ABAP
    Environment it stayed suspended.
  - **Jump to a line is measured too**: it moves the debuggee to the line
    without running what lies between.
  - **The snapshot views take their limit as required.** Without
    `maxNumberOfObjects` or `maxNumberOfReferences` they answer 400.
  - **Every member takes the error strategy with the call** (decision 36),
    and `errorStrategyOnEveryMember` now holds the three contracts to it.
  - Every type parameter is the implementation's, with no default, as in the
    other runtime contracts.

## [13.0.0] - 2026-10-05

### Changed (breaking)

- **Depends on `@mcp-abap-adt/interfaces-adt-connection` ^2.0.0**, whose
  `IAdtWireResponse` defaults its type parameters to `unknown` instead of
  `any`. This package's declarations name `IAdtWireResponse` without type
  arguments in three exported types, so each now hands a consumer an answer
  whose `data` is `unknown`:
  - `IResultStrategy<T>` — `(answer: IAdtWireResponse) => T`
  - `IAnalyse<E>` — its optional `answer` parameter
  - `IAdtFailure.response`

  The emitted `.d.ts` text of these is unchanged; what they resolve to is
  not, which is why this is a major.

### Migrating from 12.x

Install `@mcp-abap-adt/interfaces-adt-connection` ^2.0.0 beside this release
(a single copy: two copies of one interface do not compare equal). In a
result strategy, an `analyse` function, or code reading
`IAdtFailure.response`, narrow `answer.data` before reading it —
`typeof answer.data === 'string'` for an ADT body — or name the type where it
is stored (`IAdtWireResponse<string>`). See that package's 2.0.0 migration
note, which also covers `makeAdtRequest` stubs.

### Changed

- **`ITraceListing.list` names its options type.** The inline
  `[TOptions] extends [void] ? unknown : TOptions` is now the declared
  `ListingOwnOptions<TOptions>` (`Array<TOptions> extends Array<void> ?
  unknown : TOptions`), checked to resolve to the same type for `void`,
  `undefined`, `never`, `any`, `unknown`, an options object, and unions with
  and without `void`. `ITrace.d.ts` changes; what a consumer passes and gets
  does not — nothing to do.
- **Built under a stricter compiler and lint.** The repository's base
  `tsconfig` adds `noImplicitReturns`, `noFallthroughCasesInSwitch`,
  `noImplicitOverride`, `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`, and lint fails on a warning. Only the
  compile-only checks changed (and two unused imports left `index.ts`); no
  other declaration changes.

## [12.0.1] - 2026-10-02

### Changed

- **Built from its own install.** The repository's packages are no longer npm
  workspaces (#116): this package builds and type-checks against its
  `@mcp-abap-adt/*` dependencies as published on the npm registry, never
  against a sibling's source, and carries its own `typescript` and
  `@types/node` as devDependencies. Its contract, its `dependencies` and the
  files it ships are unchanged — nothing to do for a consumer.

## [12.0.0] - 2026-10-02

ATC checks programs and every kind of include, each addressed as what it is.

### Added

- **`AtcObjectType`** gains `program`, `program_include`, `function_include` and
  `class_include`. ATC checks an include as the object that owns it: measured on
  an on-premise and a cloud system, a program include lists its main program in
  the worklist, a function include its function group, a class include its
  class. Each include kind lives at an address of its own; a function include is
  found under its group and not under `/programs/includes/`. A program and a
  program include exist on premise only.
- **`AtcNamedObjectType`** — the kinds a name alone addresses.
- **`AtcClassIncludeKind`** — `definitions`, `implementations`, `macros`,
  `testclasses`.

### Changed

- **`IAtcObjectRef` is a union** that carries what each kind's address needs:
  `{ objectType: AtcNamedObjectType; objectName }`, `{ objectType:
  'function_include'; objectName; functionGroup }`, `{ objectType:
  'class_include'; objectName /* the class */; includeKind }`. An include
  without its owner does not compile.

### Migration

- A reference with one of the seven earlier kinds is unchanged:
  `{ objectType: 'class', objectName: 'ZCL_X' }` still compiles.
- Code that **exhausts** `AtcObjectType` (`Record<AtcObjectType, …>`, a `switch`
  with a `never` check) must handle the four new kinds.
- Code that reads `ref.objectName` across all kinds keeps working. Code that
  needs the owner narrows on `objectType` first: `functionGroup` exists only on
  `function_include`, `includeKind` only on `class_include`.

## [11.1.0] - 2026-10-01

### Added

- **`IFeedQueryOptions.query`** — a feed's `$query` expression, sent as given.
  A runtime feed filters on the attributes its descriptor declares (the dumps
  feed: user, runtime error, exception, object, package, component, the
  responsible people, date/time), combined with `and`/`or`; `user` alone could
  only ever reach one of them. When `query` is present, `user` is not turned
  into a query of its own.

## [11.0.0] - 2026-09-26

One request per member, each addressed by what the server gave the caller
(decision 37), and the ABAP connection in a package of its own (decision 38).

### Added

- **`IAdtTransportSearchConfigurations<TConfigurations>`** — the saved
  transport searches, one member. `IAdtRequest.list` now requires the
  `configUri` this answers.
- **`IFeatureToggleObjectResults`** — one result slot per answer a feature
  toggle gives: `switched`, `runtimeState`, `checkState`, `source`.

### Changed

- **BREAKING: `IListTransportsOptions.configUri` is required**, and so is
  `IAdtRequest.list`'s options. An implementation left without one read the
  configurations and chose; the choice is the caller's.
- **BREAKING: `IAbapGitUnlinkArgs` takes `repositoryId`** — the key
  `listRepos` reports — instead of `package`.
- **BREAKING: `IAdtAbapGitClient.getErrorLog` takes `logLink`** — the href
  `listRepos` reports — instead of a package name.
- **BREAKING: `IFeatureToggleObject<TState>` is
  `IFeatureToggleObject<R extends IFeatureToggleObjectResults>`.** Each member
  answers its own slot rather than one type shared by four documents.

### Removed

- **BREAKING: the ABAP connection moved to
  `@mcp-abap-adt/interfaces-adt-connection` 1.0.0**, unchanged and not
  re-exported: `IAbapConnection`, `IAdtWireResponse`, `IAbapRequestOptions`,
  `ISessionLifecycleAware`, `ICriticalSection`, `IRequestProfiling`,
  `IDeferredResponseConnection`, `ADT_SESSION_ERROR`, `AdtSessionErrorCode`,
  `ITimeoutConfig`. This package now depends on that one instead of
  `interfaces-network`. A connector depends on the connection alone and stops
  following every major here. Decision 38.
- **BREAKING: `IAdtAbapGitClient.getRepo`**, and with it the second type
  parameter: `IAdtAbapGitClient<TRepos, TErrorLog, TPull, TExternalRepo>`. It
  filtered `listRepos`, which is a reading; a caller takes the entry from
  `listRepos`.

## [10.0.0] - 2026-09-26

The error strategy is taken with the call by **every** member that answers an
`IAdtResponse`, not only by the 17 that did. Decision 36.

### Added

- **`IAdtAnalyseOptions<E>`** — `analyse`, and nothing else. The options a
  member takes when it has no write to carry. `IAdtOperationOptions` extends
  it, so everything that accepted `IAdtOperationOptions` still does.
- **`__typechecks__/errorStrategyOnEveryMember.ts`** — fails to compile if a
  member of any of the 45 contracts that answer an `IAdtResponse` stops taking
  `analyse`. Counted with the compiler: 96 members.

### Changed

- **BREAKING: 79 members take `options` with `analyse`**, as the overload pair
  the capability atoms already had — one with `analyse` required, inferring the
  failure type `E` into `IAdtResponse<T, E>`, one plain. Across
  `IAdtLockable`, `IAdtVersionable`, `IFeatureToggleObject`, `IAdtRequest.list`,
  `ITestRunInformation`, `ICdsTestDoubleCheckable`, every `IAdtUtilities` atom
  (group activation and deletion among them), `IAdtRunnable` and both profiler
  atoms, `ITraceScheduling`, `IFeedRepository`, `IApplicationLog`, `IAtcLog`,
  `IAtcRunStatusReadable`, `IAtcFindings`, `ICrossTrace`, `IDdicActivation`,
  `IGatewayErrorLog`, `IRuntimeDumps`, `ISt05Trace`, `ISystemMessages`,
  `ITraceListing`, `ITraceReading`, `ITraceDeletion` and `IAdtAbapGitClient`.
  Where a member already had an options object, `analyse` joins it; where it
  had none, `options` is a new last parameter.
- **BREAKING: `IAdtRunnable.run` always has a second parameter.** A flavour
  without options (`TOptions = never`) took exactly its target; it now takes
  `options?` carrying `analyse`.
- **BREAKING: `ViewArgs` always yields an options parameter** — `analyse` alone
  for a view whose options are `void`, beside the view's own otherwise. It takes
  a third type parameter, the failure type, defaulting to `IAdtError`.
- **`ITraceListing` takes a third type parameter, `TList`**, defaulting to
  `TEntry[]`, and `list` answers it. The array was fixed in the contract, so a
  result strategy could change an entry but not that the answer was a list of
  them. The default keeps every existing instantiation meaning what it did.

## [9.0.0] - 2026-09-23

### Added

- **`ITimeoutConfig`, from `@mcp-abap-adt/interfaces-network` 2.0.0** — the
  deadlines a caller gives an ADT connection: `default`, `csrf`, `long`.

  **Fetching a CSRF token is an SAP operation, not a transport primitive**, and
  `long` is a client's policy for a long-polling read rather than anything a
  network layer knows. It sat in `-network` against that package's own README,
  which says nothing there is SAP-specific. Its one consumer,
  `mcp-abap-connection`, takes this package already.

### Removed

- **BREAKING: every authentication contract leaves** — 51 symbols out of 30
  files, split by what each one's fields and values name. Measured against the
  published 8.0.0 tarball, which exported 262 names; this release exports 210.

  - **32 to `@mcp-abap-adt/interfaces-auth` 1.2.0** — credentials, OAuth
    grants, tokens, interactive login, SAML assertions, `STORE_ERROR_CODES`,
    and `AUTH_TYPE_JWT`/`AUTH_TYPE_BASIC`. A bearer token and a user with a
    password mean the same thing off SAP entirely.
  - **16 to `@mcp-abap-adt/interfaces-auth-sap` 1.0.0** — `ISapConfig`,
    `SapAuthType`, `SapConnectionType`, `IConfig`, `IConnectionConfig`,
    `IAuthorizationConfig`, `ICertificateMaterialLoader`, `IServiceKeyStore`,
    `ISessionStore`, `ITokenProviderResult`, `IValidatedAuthConfig`,
    `AuthMethodPriority`, `IHeaderValidationResult`, and `AUTH_TYPE_XSUAA`
    with the `AuthType`/`AUTH_TYPES` union. XSUAA is a **BTP service**, so a
    set that includes it describes what a BTP connection accepts.
  - **`ISessionState` and `ISessionStorage` are deleted**, not moved: cookies,
    a CSRF token and a cookie store are HTTP session state, which no package's
    subject names, and nothing under development imports them. They arrived
    here in 8.0.0 from the facade with *"removed in the next major"* on them;
    this is that major (decision 30).

  **The criterion is who imports this package**, and it should be
  `@mcp-abap-adt/adt-clients` and whatever replaces its objects. It was not:
  `auth-broker`, `auth-stores` and `auth-providers` imported 10, 7 and 17 names
  from here and **not one was an ADT contract**; `header-validator` took 7 more.
  They were pinned to the release rate of the ADT contract to describe
  authentication.

  After this, all four take **zero** from here. What is left reaching in is
  `gcts-client` and `cloud-llm-hub`, for `IAbapConnection`,
  `IAbapRequestOptions` and `IAdtResponse` — consumers that speak ADT over a
  connection, which is the criterion met.

- **BREAKING: `HttpError` leaves, for `@mcp-abap-adt/interfaces-network`
  2.0.0.** Nothing about an HTTP error is ABAP. This contract declared it and
  never used it, while 14 files in `@mcp-abap-adt/adt-clients` import it and so
  does `sap-cloud-alm-odata-mcp`, which speaks no ADT at all.

- **BREAKING: `XmlNode` leaves, for `@mcp-abap-adt/interfaces-utils` 1.1.0.** A
  parser's output shape is not an ADT contract, whatever the document happens to
  contain. Declared here, used here by nothing.

- **`@mcp-abap-adt/interfaces-auth` is no longer a dependency.** The last thread
  was `validation/IValidatedAuthConfig` importing `AuthType`, and `validation/`
  went with the SAP cluster. This package depends on `interfaces-network` and
  `interfaces-utils`, and nothing else.

- **`AuthTypeEnum` is dropped.** It was `export type { AuthType as AuthTypeEnum }`
  — a second name for one type, which no package imported under either name from
  here. `AuthType` itself is in `interfaces-auth-sap`; the alias is not
  recreated there, because one contract with two names is what a consumer has to
  guess between.

### Dependencies

- **`@mcp-abap-adt/interfaces-network` `^2.0.0` is the only dependency.**
  `interfaces-utils` is gone: it was here for `ILogger` and then for `XmlNode`,
  and with `XmlNode` in that package no file in `src/` imports it. The
  `tsconfig` project references went with it — two of them, one still pointing
  at `interfaces-auth` a release after the last import of it left.

  `tools/check-graph.js` now fails on a declared dependency or a project
  reference that no file imports, so this cannot recur silently: it checked
  only that an import was permitted and declared, never that a declaration was
  used.

- The `-network` range names the version `HttpError` lands in, so an install
  resolves one copy rather than nesting an older one.

## [8.0.0] - 2026-09-23

### Added

- **The SAP header groups live with the headers they group** —
  `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`, `PRESERVED_HEADERS`, and the
  `ISessionState`, `ISessionStorage` and `ITokenProviderResult` contracts.

  All six were declared in the `@mcp-abap-adt/interfaces` facade, which
  declares no header name of its own: it imported all eighteen from here to
  build the groups, and `ITokenProviderResult` imported `IConnectionConfig`
  from here too. A grouping one package away from what it groups, and a token
  result one package away from the token contracts. They are beside
  `ISessionStore` and `ITokenProvider` now.

  Each carried *"No package imports this; it is removed in the next major"*,
  and the premise held — nothing under development imports them. They moved
  rather than being deleted because where they belong is not in doubt, and a
  grouping is cheap to keep and expensive to reinvent.

### Removed

- **BREAKING: every header name leaves, and the groups with them.** The three
  routing names — `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION`,
  `HEADER_MCP_URL` — and all fifteen SAP and UAA ones are in
  `@mcp-abap-adt/interfaces-network` `1.1.0`, together with
  `PROXY_ROUTING_HEADERS`, `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`,
  `PRESERVED_HEADERS` and `PROXY_MODIFIED_HEADERS`.

  **A header name says how a value travels, not what it means.** That is the
  whole argument, and the code agrees with it: nothing in this contract ever
  used one — only the index re-exported them. Keeping them here bound
  `mcp-abap-adt-header-validator`, which imports fifteen of them and nothing
  else from this package, and `cloud-llm-hub` to the release rate of the ADT
  contract.

  `PROXY_MODIFIED_HEADERS` is the case that proves the placement. It groups
  `HEADER_AUTHORIZATION` with three SAP names, so while the two halves lived in
  different packages — and neither may import the other — it could exist in
  neither and was deleted. With the names where they belong it exists again, in
  `-network`, beside everything it groups.

  This package keeps `AUTH_TYPE_JWT`, `AUTH_TYPE_BASIC`, `AUTH_TYPE_XSUAA` and
  `AUTH_TYPES`: those are values a header carries, not names of headers.

- **BREAKING: the Cloud ALM contracts leave** — `CalmService`, `CALM_SERVICES`,
  `ICalmConnection`, `ICalmRequestOptions` and `ICalmResponse` are
  `@mcp-abap-adt/interfaces-calm` `1.0.0`.

  Cloud ALM is not ABAP, and the only thing holding them here was one line:
  `ICalmResponse` was an alias of `IAdtWireResponse`. `mcp-calm-client` and
  `mcp-calm-server` therefore tracked the ADT contract's releases to describe a
  service that has nothing to do with ADT.

### Changed

- **`IAdtWireResponse` narrows a shape it no longer declares.** The HTTP frame
  — `data`, `status`, `statusText`, `config`, `request` — is
  `IHttpWireResponse` in `@mcp-abap-adt/interfaces-network`; this type extends
  it and keeps the `headers` ADT actually sends. `IAdtHeaderValue` is an alias
  of `IHttpHeaderValue`.

  **Nothing renames.** Both names still exist here with the same meaning, so a
  consumer holding `IAdtWireResponse` — 335 files in
  `@mcp-abap-adt/adt-clients` do — changes nothing. What changes is that a
  package needing only an HTTP frame no longer has to come here for it.

  This package now depends on `interfaces-network`, which it did not before.
  That edge is honest: ADT speaks HTTP.

## [7.0.0] - 2026-09-23

### Added

- **`ADT_TASK_TYPE` and `AdtTaskType`** — the task types CTS accepts, as a
  constant rather than a literal at each call site. `changeTaskType` declared
  them inline, `'S' | 'R' | 'X'`, which gave a consumer nothing to import: the
  implementation in `@mcp-abap-adt/adt-clients` had to repeat the union under a
  local name, and every caller had to repeat the letters.

  **The letters are SAP's, not a choice made here.** They were measured against
  BTP ABAP on 2026-09-23 by sending each one and reading the task back, and the
  constant carries what was refused too — `'Q'` ("You can only change the type
  of tasks in workbench requests") and `'K'`/`'W'`, which are request types.
  That belongs in the one place a consumer can import it from.

  It is **not** added to the `@mcp-abap-adt/interfaces` facade. Every symbol
  the facade re-exports is already marked *"@deprecated Import from
  @mcp-abap-adt/interfaces-adt"*; a new one there would be born deprecated.

  Both are exported from this package's entry point, and
  `__typechecks__/transportObjectActions.ts` imports them from there rather
  than from the file that declares them. That is not tidiness: the first
  version of this change declared them and forgot the re-export, so the import
  the paragraph above tells a consumer to write did not resolve and
  `ADT_TASK_TYPE` was `undefined` in the built package. Nothing caught it —
  `check-surface.js` reads the facade, and these two are deliberately not
  there. Found in review.

### Changed

- **`changeTaskType` takes `AdtTaskType`** instead of the inline union. **Not
  a break.** The alias is those same three values and TypeScript compares
  types structurally, so a call passing `'S'` compiles and so does a
  declaration that spells the union out — the two are mutually assignable.
  This entry called it breaking and said such a declaration would stop
  compiling; both were wrong, caught in review. What makes 7.0.0 a major is
  the removal below.

### Removed

- **BREAKING: `source` leaves six configs** — `IDomainConfig`,
  `IDataElementConfig`, `IPackageConfig`, `ITableTypeConfig`,
  `IFunctionGroupConfig` and `ITransportConfig`.

  **The contract said where a write's body goes twice, and differently.**
  `IAdtUpdatable.update` and `IAdtMetadataUpdatable.updateMetadata` document
  `options` as "`source` for the body"; each of the 26 configs that carried a
  `source` said the caller "reads the document … and passes it here". An implementation honouring one made the
  other a lie — `adt-clients` read the config only, so the call the atom
  documents sent `undefined` and wrote nothing. Its repair reads both channels
  with the options winning and says in a comment that choosing between them is
  the contract's job; that repair is on its `main` and not released, so no
  published version of it has ever honoured the atom's sentence.

  It is one channel now, and the split is not arbitrary. Measured across the 26
  configs that declared a `source`, and the implementations in `adt-clients`
  that read them: the field has exactly one reader besides the write, and that
  is `check`/`validate`, which compile a source the server does not hold yet
  and have no options channel to take it from. Six of the 26 lose the field
  here; 20 keep it. None of the six has such a member — `domain` passes
  `undefined` where the source would go, `dataElement` sends none, `tableType`
  validates a description, and `package`, `functionGroup` and
  `transportRequest` have neither. Nothing read their `source` but the write.

  `IAuthorizationFieldConfig` is in the same position and is deliberately
  **not** in the count: it never declared a `source`, so it is outside the 26
  and has nothing to lose here.

  The configs that keep it are the ones whose `check` or `validate` compiles
  it. `IAdtOperationOptions.source` now says this outright.

  **Migrating.** A write that passed the body in the config moves it to the
  options; a call that already passed it there is unaffected.

  ```diff
  - await domain.updateMetadata({ domainName, source: edited }, { lockHandle });
  + await domain.updateMetadata({ domainName }, { source: edited, lockHandle });
  ```

  A `check` or `validate` keeps passing its source in the config — that is the
  reader the field is left for.

  Not deprecated first: decision 30 — an implementation-only shape leaves at a
  major.

## [6.0.0] - 2026-09-23

> Recorded as **decision 32** in `docs/architecture/DECISIONS.md` — why the
> payload is a string this package passes through rather than a document it
> models, and why a create does not take one. It withdraws the half of decision
> 31 that called for a typed document model.

### Changed

- **BREAKING: one name for what a write sends.** The payload field carried
  eleven names across 35 fields — `sourceCode` in 15 configs, `document` in 6,
  `ddlCode` and `ddlSource` for the same thing in neighbouring files,
  `testClassCode` beside `testClassSource`. It is **`source`** in all 29 configs
  that had exactly one.

  `adt-clients` is a cut of endpoints, and a write is a write: for a class the
  payload is ABAP text, for a domain it is the object's XML document. What those
  XML look like belongs in documentation, not in a type — the library does not
  demand a particular ABAP body either, and the consumer is the one who knows
  what they are writing.

  **The options carried the same split, and it was worse.** `IAdtOperationOptions`
  had `sourceCode` *and* `xmlContent`, divided by what the body happened to
  contain — ABAP text for a class, an XML document for a domain — which asked
  the caller to classify a payload this library never reads. Both are now
  `source`. `IAdtCreateOptions` refuses that field, and `IAdtCreatable.create`
  excludes it from the config: **source is for the write, and a create does not
  take one.**

  `IInterfaceConfig` is renamed with the rest. It is declared as a type alias
  rather than an interface, so the first pass missed it — and so did 4.0.0's
  config clean-up, which is why it still carried `sessionId` and `onLock`. Both
  are gone with this.

  Five fields keep their names because they are not this type's payload:
  `IClassConfig`'s `testClassCode`, `localTypesCode`, `definitionsCode` and
  `macrosCode` address four other resources, each of which already has its own
  config, and `IBehaviorImplementationConfig.implementationCode` is a second
  payload for a second endpoint. They belong to per-operation inputs —
  **decision 31** — and are left for that pass rather than flattened here.

### Removed

- **BREAKING: `datatype`, `length` and `decimals` leave `IDomainConfig` again**,
  a day after 4.1.0 put them back. The measurement that justified them stands —
  a POST carrying `doma:content/doma:typeInformation` is answered `201`, the
  document reads back `CHAR`/`000010`, the activation is clean — but the route
  changed: decision 31 puts the object's shape in the document and has the
  create post a shell, which is what the server's own POST answer documents
  (`version="inactive"`, all three groups present and empty).

  Not deprecated first: a field the implementation does not send is the defect
  3.0.0 and 4.0.0 spent themselves removing, and the fields are a day old with
  no importer anywhere under `~/prj`.

## [5.0.0] - 2026-09-23 — never published, superseded by 6.0.0

> **Never published.** 6.0.0 was tagged before this version reached the
> registry, so npm goes 4.1.0 → 6.0.0 and everything below arrived there. A
> consumer looking for `changeTaskType` wants **6.0.0 or later**, not this.

### Changed

- **BREAKING: `IAdtTransportObjectActions` takes a sixth type parameter**,
  `TTaskType`, for the member below.

### Added

- **`changeTaskType`** — a task is created without a type, and the call that
  creates it cannot supply one.

  Measured against BTP ABAP, 2026-09-23: `tm:type` on a `newtask` is accepted
  and ignored, and every task on that system — including ones created long
  before this package existed — reads back as `Unclassified`. CTS assigns the
  type when the first object lands; a caller who wants it sooner asks here.

  The type is declared as `'S' | 'R' | 'X'` rather than `string`, because the
  values a caller would otherwise reach for are refused: `'Q'` is a
  customizing type — *"You can only change the type of tasks in workbench
  requests"* — and `'K'`/`'W'` are REQUEST types, answered as unknown.
  Declaring the three that work is what stops a caller learning the other
  three from a `400`.

  Addressed at the TASK, like `removeObject`: that is where the listing
  offers the action. And like every action here, the answer says the document
  was understood — a read is what shows the type.

## [4.1.0] - 2026-09-22

### Added

- **`datatype`, `length` and `decimals` return to `IDomainConfig`.** They left in
  4.0.0 because the create accepted them and did not send them; they came back
  once the endpoint was measured to carry them — a POST with
  `doma:content/doma:typeInformation` answered `201`, the document read back
  `CHAR`/`000010`, and the activation reported no messages, beside a domain
  created without a type which could not be activated at all (`DO(251) Data type
  ' ' does not exist`). Cloud trial, and on-premise was not covered.

  The other five that left in 4.0.0 — `conversion_exit`, `lowercase`,
  `sign_exists`, `value_table`, `fixed_values` — stayed out, unmeasured.

  > Withdrawn again in the next major: decision 31 routes the object's shape
  > through the document, so a create carrying `doma:content` is a deviation
  > from the flow this library follows. The measurement stands; the route
  > changed.

## [4.0.0] - 2026-09-22

### Removed

- **46 fields leave 16 `IXxxConfig` types** — the types a consumer writes
  against. Each was checked against the implementation: whether it is read at
  all, now that 3.0.0 had made the compiler strip every line forwarding a field
  into a parameter object that ignored it.

  Two were worse than a dropped value. **`onLock` was declared on nine types and
  invoked on one** — a callback promising a call that never came; `IIncludeConfig`
  keeps it, because `AdtInclude` really does invoke it. **`sessionId` was
  declared on five and read by none**, the low-level locks it was meant for
  taking a parameter named `_sessionId`.

  The rest never reached the wire: `IDomainConfig` lost the eight that say what a
  domain is, `IDataElementConfig` its type name and four labels,
  `IStructureConfig` its `fields` and `includes` (a structure is built from its
  `ddlCode`), `IFunctionModuleConfig` a `packageName` a module takes from its
  group, `ITableTypeConfig` the row-type kind, access type and primary-key pair.

### Changed

- All 16 changed declarations are recorded in `tools/surface-changed.json` **with
  the shape each is expected to have now**, so the baseline check still guards
  them. Listing the name alone would have retired the check for those symbols.

## [3.0.0] - 2026-09-22

### Removed

- **84 `ICreate*Params` / `IUpdate*Params` types leave the contract.** They are
  the argument shapes of the functions that build ADT requests, and a search of
  every dependent repository found them imported by nobody. Twelve parameter
  types that *are* used stay: four imported by the MCP server, eight named in the
  signature of a capability interface this package exports.

  Being nobody's contract had a measurable cost: **85 of their fields were
  ignored by the very code that took them.** A domain created with
  `datatype: 'CHAR', length: 10` came back with `<doma:datatype/>` empty and SAP
  refused to activate it. Whether a field is honoured is decided one repository
  away, which is where these shapes now live.

  Two causes, both left by earlier releases of the consumer: `activate?: boolean`
  from the chains removed in `adt-clients` 18.0.0, declared in seven interfaces
  and read nowhere; and every `IUpdate*Params` field past the name and the
  transport, from the read-modify-write updates removed in 19.0.0.

### Changed

- `ICreateDataElementParams` loses seventeen fields — the type, the length and
  every label — and its new declaration is recorded in
  `tools/surface-changed.json`.
- **The surface guards learnt the difference between retired and lost.**
  `tools/surface-removed.txt` declares each removal with its reason, the way
  `surface-added.txt` declares an addition; `check-surface.js`,
  `check-packed.js` and `check-deprecated.js` all read it.
  `baseline-44.0.0.json` is untouched: it is the proof that the split preserved
  44.0.0, and a regenerated proof proves nothing. Recorded as **decision 30**.

## [2.0.1] - 2026-09-22

### Changed

- **A measurement asserted in 2.0.0 is retracted.** The documentation for
  `readObjects` said a metadata read gets a representation carrying no
  `tm:abap_object`, because the request names no `Accept`, and that positions
  therefore could not be read from it however it was parsed.

  Measured against an on-premise system on 2026-09-22 — the same URL with
  `application/vnd.sap.adt.transportorganizer.v1+xml` and without it — the two
  answers are byte for byte identical: 95411 bytes and 166 `tm:abap_object`
  for a request, 55549 and 88 for a task. The header settles nothing.

  The member stays, because the reason it exists does: `removeObject` requires
  a position and nothing else here hands one back, which would leave a caller
  parsing a transport document for a `tm:position` themselves. What it
  promises is the answer — entries, each with its position as a value — and
  not how an implementation obtains them. A contract is no place to assert
  something about a wire that was not measured, and this one now says only
  what must come back.

  Documentation only; no type changed. `@mcp-abap-adt/adt-clients` corrected
  the same claim in its own comments and API reference on 2026-09-21.

## [2.0.0] - 2026-09-21

### Changed

- **BREAKING: `IAdtTransportObjectActions` takes a fifth type parameter**,
  `TObjects`, for the reading added below. Every implementation and every
  declared use names it.

- **BREAKING: `removeObject` requires `object.position`.** It took
  `IAbapObjectEntry` whole, where the field is optional, and the member took
  the whole type because nothing said the server needed it. It does. Measured
  against an on-premise system, 2026-09-21: 22 objects asked for by
  `pgmid`/`type`/`name` alone each answered `200` with the usual echo
  document, and re-reading the task found all 22 still on it. The same
  documents carrying `tm:position` — nothing else added — removed every one,
  22 down to 0, each confirmed by a re-read.

  The parameter is `IAbapObjectEntry & { position: string }` rather than a new
  type: the field belongs to the entry, and what changes is that this member
  insists on it. `addObject` still does not, because an entry that does not
  exist yet has no position.

- **BREAKING: `createTask` requires `targetUser`**, and the options argument
  with it. This shipped saying the server would decide whose task it is when
  `tm:targetuser` was absent. It does not: the call without the attribute was
  refused with `400 SCTS_ADT_MSG 009`, *"User  does not exist in the system
  (or locked)"* — two spaces, an empty name — and the same call carrying it
  answered 200 and a task number. Measured on the same run.

  Nothing below the caller can fill it in: `IAbapConnection` does not expose
  who is authenticated, and finding out costs a second request.

### Added

- **`readObjects`** — the objects a request or task holds, each with the
  `tm:position` that `removeObject` now needs.

  It is a separate member because it answers a separate thing: entries, each
  with its position as a value, where a metadata read answers a document.

  > **Retracted in 2.0.1.** This entry also claimed that a reader sending no
  > `Accept` cannot answer it however its result is parsed. That was measured
  > false the next day — the same URL with and without the header is byte for
  > byte identical. See the 2.0.1 entry above.

  Without it `removeObject` would require a value the package offers no way to
  obtain, leaving a caller to assemble the request themselves — the layering
  this package exists to prevent.

### Why a major so soon after 1.2.0

1.2.0 declared these members from captures of Eclipse and unit tests over the
documents it sent. Eclipse sends both attributes on every call, so nothing in
a capture could show that either was load-bearing. The first run against a
server found both. The contract is what was wrong, and a contract that permits
a call which cannot work is worse than one that forbids it: the old signatures
type-check today and fail — `createTask` at runtime, `removeObject` silently.

## [1.2.0] - 2026-09-21

### Added

- **`IAbapObjectEntry` — one entry in a transport request's object list**, as
  the CTS object directory holds it: `pgmid`, `type`, `name`, and optionally
  the description and the position within a task.

  **Not `IObjectReference`, though they look alike.** That one is ADT's
  vocabulary — its `type` is an ADT object type code such as `CLAS/OC`, and it
  carries a `uri` and a `parentName`. The object directory speaks another: a
  program id, a short type and a name, `R3TR FUGR ZMCP_BLD_FGR_H1`. Merging
  them would produce a type where half the fields are always wrong and `type`
  means one thing or the other depending on which member was called.

  A request parameter, which is why it is here — the same reason
  `IObjectReference` survived 31.0.0 while the result shapes left: a consumer
  cannot call a member that takes one without being able to name the type.

- **`IAdtTransportObjectActions<TRemoved, TAdded, TTask, TActionLog>`** —
  `removeObject`, `addObject`, `createTask` and `readActionLog`.

  A transport listing already answers every `atom:link` a request and its
  tasks carry — `release`, `addobject`, `changeowner`, `newtask` — so that a
  caller follows an href rather than assembling a URL. Handing over the
  addresses of operations while declaring nothing that performs one leaves the
  caller building `tm:root` documents by hand, which is the layering this
  package exists to prevent.

  What it costs to lack them, measured on an on-premise system: deleting an
  ABAP object does not free its name, because the object-directory entry stays
  on the request that carried it. Until it is detached a create of the same
  name is refused with `CTS_WBO_API 019` — even passing that same request as
  `corrNr` — and the ways out are releasing the whole request, shipping
  everything else in it, or SE09. Reported as fr0ster/mcp-abap-adt#221,
  implemented in fr0ster/mcp-abap-adt-clients#151.

  Four members and no composite: the order a caller uses them in, and what
  they do when `addObject` is refused, is theirs.

## [1.1.0] - 2026-09-19

### Added

- **`IAssertionValidator`** — establishes that a SAML assertion is genuine,
  addressed to the caller, currently valid, and answers a request that was
  actually made, rejecting by throwing with a reason naming the check that
  failed. Validation is a strategy, like everything else pluggable here: a
  consumer with a trust model this package cannot anticipate can replace it
  wholesale, while the shipped default (arriving in a later `auth-providers`
  release) verifies the signature and refuses anything it cannot place.
- **`AssertionContext`** — what a provider knows about the login an assertion
  is answering: the expected `InResponseTo`, the audience, the ACS URL, and an
  optional trusted issuer for a validator that establishes trust some other way.
- **`ValidatedAssertion`** — what a validated assertion yields: an expiry that
  is never later than either the assertion's own `Conditions` or the bearer
  confirmation that was accepted, identity fields, and both the raw wire
  response and the signed XML that verified — kept distinct because holding the
  former does not make every byte of it trustworthy.
- **`IAssertionReplayStore`** and **`AssertionReplayKey`** — remembers
  assertions so a replay is refused, keyed by issuer and assertion ID together,
  since an assertion ID is unique only within the identity provider that minted
  it.
- **`ASSERTION_ERROR_CODES`** and **`AssertionErrorCode`** — the codes an
  assertion validator refuses with, starting with `ASSERTION_VALIDATION_ERROR`.
  They are their own set rather than additions to `TOKEN_PROVIDER_ERROR_CODES`:
  that set describes what can go wrong with ANY token provider, and SAML is one
  authentication mechanism among several, so it must not widen a contract every
  provider shares. A mechanism brings its own codes, as the store and network
  layers already do. Existing declarations are therefore untouched, and
  `tools/baseline-44.0.0.json` needs no regeneration.

## [1.0.0] - 2026-09-16

### Added

- The package. Its contracts moved unchanged from `@mcp-abap-adt/interfaces`
  44.0.0, which re-exports them, deprecated, from 45.0.0. Why: decision 26 in
  `docs/architecture/DECISIONS.md`.
