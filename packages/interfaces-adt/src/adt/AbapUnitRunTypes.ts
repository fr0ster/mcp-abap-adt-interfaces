/**
 * The ABAP Unit run registry: every `osl:object type` value an ABAP Unit run
 * (`POST /sap/bc/adt/abapunit/runs`) may name, what a run of it runs, and on
 * what evidence.
 *
 * **What the systems say** (measured 2026-10-29 on S/4HANA 2025 and ABAP
 * cloud, with identical results; on objects of our own in local packages,
 * deleted afterwards):
 *
 * - `GET /sap/bc/adt/abapunit/metadata` lists 23 `supportedTypeFeatures`, each
 *   a `globalWorkbenchType` with the flags `ownTests`, `assignedTests` and
 *   `coverage`. SAP_BASIS 7.40 has no such endpoint.
 * - A run naming one object in an `osl:flatObjectSet` ran the object's tests
 *   with `CLAS`, `CLAS/OC`, `CLAS/OCL`, `PROG`, `PROG/P`, `FUGR`, `FUGR/F` and
 *   `FUNC`. `FUGR/FF`, which the metadata lists, answered an empty result for
 *   a function module.
 * - A CDS view's assigned tests — local test classes marked
 *   `"! @testing <view>"` — ran with `DDLS/DF` and with `DDLS`, only when the
 *   run's scope sets `foreignTests="true"`; with own tests only the result was
 *   empty.
 * - A package ran its tests only as an `osl:packageSet` (see
 *   {@link AbapUnitRunTarget}); `osl:object type="DEVC/K"` and `type="DEVC"`
 *   answered empty.
 * - **A type the endpoint does not run is not refused**: the start answers
 *   `201`, and the result is an empty `<aunit:runResult/>`. Only the compiler
 *   can catch a wrong type, which is why the type a run takes is drawn from
 *   this table.
 *
 * **What is here.** The 23 codes of the metadata answer, and the short types
 * `CLAS`, `PROG`, `FUGR`, `FUNC` and `DDLS` a run was measured to take though
 * the metadata does not list them. {@link AbapUnitRunObjectType} is the union
 * of every key, so it narrows nothing the endpoint was measured to accept.
 *
 * **The metadata flags are not copied here.** `runs` is read from them for a
 * code entered on the metadata's evidence (`ownTests="true"` → own tests, else
 * assigned tests); the flags themselves, `coverage` among them, belong to the
 * recorded metadata answer, which the conformance check of
 * `@mcp-abap-adt/adt-clients` holds this table to.
 *
 * Constants and types only: the table is `as const` and `satisfies`
 * {@link AbapUnitRunTypeTable}, and the types below are derived from it.
 */

/**
 * What a run of an object of this type runs.
 *
 * - `'ownTests'`: the test classes the object holds; the run's default scope
 *   (`ownTests: true`) runs them.
 * - `'assignedTests'`: test classes elsewhere assigned to the object; they run
 *   only when the run's scope sets `foreignTests: true` (`IUnitTestScope`).
 */
export type AbapUnitRunKind = 'ownTests' | 'assignedTests';

/**
 * Why a type is in the registry.
 *
 * - `'recorded'`: a run of an object of this type was measured to run its
 *   tests, on S/4HANA 2025 and ABAP cloud.
 * - `'metadata'`: `GET /sap/bc/adt/abapunit/metadata` lists it, and no run of
 *   it has been measured.
 * - `'metadataRunEmpty'`: the metadata lists it, and a run naming an object
 *   by this type answered an empty result. It stays in the registry because
 *   the metadata says the endpoint takes it; a run of it is not known to run
 *   anything.
 */
export type AbapUnitRunEvidence = 'recorded' | 'metadata' | 'metadataRunEmpty';

/** What the registry says about one `osl:object type` value. */
export interface IAbapUnitRunTypeFacts {
  /** What a run of it runs, and with that the scope it needs. */
  readonly runs: AbapUnitRunKind;
  /** Why it is here. */
  readonly evidence: AbapUnitRunEvidence;
}

/** What the registry `satisfies`. */
export type AbapUnitRunTypeTable = {
  readonly [type: string]: IAbapUnitRunTypeFacts;
};

/**
 * Every `osl:object type` value an ABAP Unit run may name. See the module's
 * comment for the measurements behind each entry.
 */
export const ABAP_UNIT_RUN_TYPES = {
  // Classes. `CLAS`, `CLAS/OC` and `CLAS/OCL` ran the class's tests.
  CLAS: { runs: 'ownTests', evidence: 'recorded' },
  'CLAS/OC': { runs: 'ownTests', evidence: 'recorded' },
  'CLAS/OCL': { runs: 'ownTests', evidence: 'recorded' },
  'CLAS/OCI': { runs: 'ownTests', evidence: 'metadata' },
  'CLAS/OCP': { runs: 'ownTests', evidence: 'metadata' },
  'CLAS/OLD': { runs: 'ownTests', evidence: 'metadata' },

  // Programs. `PROG` and `PROG/P` ran the report's tests.
  PROG: { runs: 'ownTests', evidence: 'recorded' },
  'PROG/P': { runs: 'ownTests', evidence: 'recorded' },
  'PROG/I': { runs: 'ownTests', evidence: 'metadata' },
  'PROG/PL': { runs: 'ownTests', evidence: 'metadata' },
  'PROG/PLM': { runs: 'ownTests', evidence: 'metadata' },

  // Function groups and modules. `FUGR`, `FUGR/F` ran the group's tests and
  // `FUNC` a module's; `FUGR/FF` answered empty for a module.
  FUGR: { runs: 'ownTests', evidence: 'recorded' },
  'FUGR/F': { runs: 'ownTests', evidence: 'recorded' },
  FUNC: { runs: 'ownTests', evidence: 'recorded' },
  'FUGR/FF': { runs: 'ownTests', evidence: 'metadataRunEmpty' },
  'FUGR/I': { runs: 'ownTests', evidence: 'metadata' },
  'FUGR/PL': { runs: 'ownTests', evidence: 'metadata' },
  'FUGR/PLM': { runs: 'ownTests', evidence: 'metadata' },

  // Containers. A package runs its tests only as a package target;
  // `osl:object type="DEVC/K"` answered empty.
  'DEVC/K': { runs: 'ownTests', evidence: 'metadataRunEmpty' },
  'RQRQ/RQ': { runs: 'ownTests', evidence: 'metadata' },

  // Assigned tests only. `DDLS/DF` and `DDLS` ran a CDS view's assigned tests
  // with `foreignTests: true`, and nothing without it.
  DDLS: { runs: 'assignedTests', evidence: 'recorded' },
  'DDLS/DF': { runs: 'assignedTests', evidence: 'recorded' },
  'DCLS/DL': { runs: 'assignedTests', evidence: 'metadata' },
  'BDEF/BDO': { runs: 'assignedTests', evidence: 'metadata' },
  'SRVB/SVB': { runs: 'assignedTests', evidence: 'metadata' },
  'XSLT/VT': { runs: 'assignedTests', evidence: 'metadata' },
  'TABL/DT': { runs: 'assignedTests', evidence: 'metadata' },
  CMPT: { runs: 'assignedTests', evidence: 'metadata' },
} as const satisfies AbapUnitRunTypeTable;

/** The type of the registry, for a consumer that reads it as a whole. */
export type IAbapUnitRunTypes = typeof ABAP_UNIT_RUN_TYPES;

/**
 * An `osl:object type` value a run may name: every key of
 * {@link ABAP_UNIT_RUN_TYPES}, and nothing else.
 */
export type AbapUnitRunObjectType = keyof IAbapUnitRunTypes;

/**
 * What an ABAP Unit run names: one object, or one package.
 *
 * - **An object** goes as an `osl:flatObjectSet` with one `osl:object`,
 *   named by `name` and typed by `type`. An object of a type whose `runs` is
 *   `'assignedTests'` runs nothing unless the run's scope sets
 *   `foreignTests: true`.
 * - **A package** goes as an `osl:packageSet` with one
 *   `<osl:package name includeSubpackages>` — the one form measured to run a
 *   package's tests. It carries no `type`: a package is not an object type of
 *   a run.
 *
 * A discriminated union on `kind`, so a package cannot be named as an object
 * and an object cannot be named without its type.
 */
export type AbapUnitRunTarget =
  | {
      readonly kind: 'object';
      /** The object's name, as `osl:object name` spells it. */
      readonly name: string;
      readonly type: AbapUnitRunObjectType;
    }
  | {
      readonly kind: 'package';
      /** The package's name, as `osl:package name` spells it. */
      readonly name: string;
      /** Whether the run takes in the package's subpackages. */
      readonly includeSubpackages: boolean;
    };
