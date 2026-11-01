/**
 * The version of an object a read asks ADT for (`?version=`): `active`,
 * `inactive` or `workingArea`. Measured on S/4HANA 2025 for a table type's
 * metadata (2026-11-01): ADT takes all three, answers the active document for
 * an object with no inactive version, and refuses any other value with `400`.
 */
export type AdtReadVersion = 'active' | 'inactive' | 'workingArea';

/**
 * Shared read options for ADT source/metadata operations
 */
export interface IReadOptions {
  withLongPolling?: boolean;
  accept?: string;
  version?: AdtReadVersion;
}
