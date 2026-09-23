/**
 * Domain ADT operation parameter interfaces (snake_case, low-level)
 */

export interface IFixedValue {
  low: string;
  text: string;
}

// Builder configuration (camelCase)
// Note: packageName is required for create/update operations (validated in builder methods)
// description is required for create/update/validate operations
export interface IDomainConfig {
  /**
   * The complete payload this write sends — the object’s own document, for a type that is one.
   *
   * **An update is a write, not a read-modify-write.** Until 19.0.0 of
   * `adt-clients` the five DDIC-shaped updates fetched the current document,
   * patched the fields named here into it, and PUT the result — two requests in
   * one member, and a merge whose rules nobody outside could change. They no
   * longer do: a caller reads the document with the member that reads it, edits
   * it, and passes it here.
   *
   * So the fields beside this one describe a *create*. On an update they are not
   * sent, and a field left out of `source` is not preserved — there is nothing
   * to preserve it from, because nothing was read.
   *
   * Optional because the same config creates, where there is no document yet.
   */
  source?: string;

  domainName: string;
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create/update operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/update/validate operations, optional for others
}
