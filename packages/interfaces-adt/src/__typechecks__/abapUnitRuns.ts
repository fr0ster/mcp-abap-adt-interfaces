// Compile-only assertions. If these stop compiling, the types regressed.
//
// The ABAP Unit run registry, recorded entry for entry: every
// `osl:object type` value, what a run of it runs and its evidence, as the
// 2026-10-29 measurements on S/4HANA 2025 and ABAP cloud and the metadata
// answer give them. The equality is exact, so adding, removing or changing
// one entry fails here: the edit has to be made twice, on purpose. Beside it:
// the run object type is exactly the keys, a value outside them does not
// compile, and the two run targets cannot be mixed.

import type {
  ABAP_UNIT_RUN_TYPES,
  AbapUnitRunObjectType,
  AbapUnitRunTarget,
  IAbapUnitRunner,
  IAdtHeaders,
} from '../index';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type Mutable<T> = { -readonly [K in keyof T]: Mutable<T[K]> };

type Own<E extends 'recorded' | 'metadata' | 'metadataRunEmpty'> = {
  runs: 'ownTests';
  evidence: E;
};
type Assigned<E extends 'recorded' | 'metadata'> = {
  runs: 'assignedTests';
  evidence: E;
};

type RecordedRegistry = {
  CLAS: Own<'recorded'>;
  'CLAS/OC': Own<'recorded'>;
  'CLAS/OCL': Own<'recorded'>;
  'CLAS/OCI': Own<'metadata'>;
  'CLAS/OCP': Own<'metadata'>;
  'CLAS/OLD': Own<'metadata'>;
  PROG: Own<'recorded'>;
  'PROG/P': Own<'recorded'>;
  'PROG/I': Own<'recorded'>;
  'PROG/PL': Own<'metadata'>;
  'PROG/PLM': Own<'metadata'>;
  FUGR: Own<'recorded'>;
  'FUGR/F': Own<'recorded'>;
  FUNC: Own<'recorded'>;
  'FUGR/FF': Own<'metadataRunEmpty'>;
  'FUGR/I': Own<'metadata'>;
  'FUGR/PL': Own<'metadata'>;
  'FUGR/PLM': Own<'metadata'>;
  'DEVC/K': Own<'metadataRunEmpty'>;
  'RQRQ/RQ': Own<'metadata'>;
  DDLS: Assigned<'recorded'>;
  'DDLS/DF': Assigned<'recorded'>;
  'DCLS/DL': Assigned<'metadata'>;
  'BDEF/BDO': Assigned<'metadata'>;
  'SRVB/SVB': Assigned<'metadata'>;
  'XSLT/VT': Assigned<'metadata'>;
  'TABL/DT': Assigned<'metadata'>;
  CMPT: Assigned<'metadata'>;
};

export type _RegistryRecorded = Assert<
  Equal<Mutable<typeof ABAP_UNIT_RUN_TYPES>, RecordedRegistry>
>;

/** The run object type is exactly the registry's keys. */
export type _RunTypeIsTheKeys = Assert<
  Equal<AbapUnitRunObjectType, keyof RecordedRegistry>
>;

/** Every key is assignable to the run object type, one by one. */
export const everyKey: readonly AbapUnitRunObjectType[] = [
  'CLAS',
  'CLAS/OC',
  'CLAS/OCL',
  'CLAS/OCI',
  'CLAS/OCP',
  'CLAS/OLD',
  'PROG',
  'PROG/P',
  'PROG/I',
  'PROG/PL',
  'PROG/PLM',
  'FUGR',
  'FUGR/F',
  'FUNC',
  'FUGR/FF',
  'FUGR/I',
  'FUGR/PL',
  'FUGR/PLM',
  'DEVC/K',
  'RQRQ/RQ',
  'DDLS',
  'DDLS/DF',
  'DCLS/DL',
  'BDEF/BDO',
  'SRVB/SVB',
  'XSLT/VT',
  'TABL/DT',
  'CMPT',
];

/** The four per-object runners' types are run object types. */
export const perObjectRunnerTypes: readonly AbapUnitRunObjectType[] = [
  'CLAS',
  'PROG',
  'FUGR',
  'FUNC',
];

// The two targets.
export const anObject: AbapUnitRunTarget = {
  kind: 'object',
  name: 'ZCL_EXAMPLE',
  type: 'CLAS/OC',
};
export const aPackage: AbapUnitRunTarget = {
  kind: 'package',
  name: 'ZEXAMPLE',
  includeSubpackages: true,
};

export const devcIsNoRunType: AbapUnitRunTarget = {
  kind: 'object',
  name: 'ZEXAMPLE',
  // @ts-expect-error — `DEVC` is not a run object type: a package is a package target.
  type: 'DEVC',
};

export const unlistedIsNoRunType: AbapUnitRunTarget = {
  kind: 'object',
  name: 'ZEXAMPLE',
  // @ts-expect-error — an unlisted value does not compile.
  type: 'INTF/OI',
};

export const packageCarriesNoType: AbapUnitRunTarget = {
  kind: 'package',
  name: 'ZEXAMPLE',
  includeSubpackages: false,
  // @ts-expect-error — a package target cannot carry `type`.
  type: 'DEVC/K',
};

// @ts-expect-error — an object target cannot omit `type`.
export const objectNeedsAType: AbapUnitRunTarget = {
  kind: 'object',
  name: 'ZCL_EXAMPLE',
};

// @ts-expect-error — a package target cannot omit `includeSubpackages`.
export const packageNeedsIncludeSubpackages: AbapUnitRunTarget = {
  kind: 'package',
  name: 'ZEXAMPLE',
};

// The runner: a run by target, a run by URIs.
declare const runner: IAbapUnitRunner<string, string, string>;
declare const headers: IAdtHeaders;

export const byTarget = runner.run(anObject, {
  scope: { ownTests: false, foreignTests: true },
});
export const byPackage = runner.run(aPackage);
export const byUris = runner.runSync(['/sap/bc/adt/oo/classes/zcl_example'], {
  headers,
});

// @ts-expect-error — a run by URIs names at least one.
export const noUris = runner.runSync([], { headers });

// @ts-expect-error — a run by URIs takes the request's `headers`.
export const noHeaders = runner.runSync(['/sap/bc/adt/oo/classes/zcl_example']);

// @ts-expect-error — `run` takes a target, not a bare name.
export const bareName = runner.run('ZCL_EXAMPLE');
