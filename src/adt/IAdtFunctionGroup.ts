/**
 * Function Group ADT operation parameter interfaces (snake_case, low-level)
 */

export interface ICreateFunctionGroupParams {
  functionGroupName: string;
  description: string;
  packageName: string;
  transportRequest?: string;
  masterSystem?: string;
  responsible?: string;
  masterLanguage?: string;
}

export interface IUpdateFunctionGroupParams {
  function_group_name: string;
  description?: string;
  transport_request?: string;
  lock_handle?: string;
}

export interface IDeleteFunctionGroupParams {
  function_group_name: string;
  transport_request?: string;
}

// Builder configuration (camelCase)
// Note: packageName is required for create operations (validated in builder methods)
// description is required for create/validate operations
export interface IFunctionGroupConfig {
  /**
   * The complete document to write, when this config is used for an update.
   *
   * **An update is a write, not a lock-read-patch-write.** Until 19.0.0 of
   * `adt-clients` the function-group update locked the group, fetched its
   * document, patched the description into it, PUT the result and unlocked —
   * four requests in one member, with the lock window and the merge both
   * decided there. A caller now locks, reads, edits, writes and unlocks, in
   * the order they choose, over members that each issue one request.
   *
   * The same field is on `IDomainConfig`, `IPackageConfig`,
   * `IDataElementConfig`, `ITableTypeConfig` and `ITransportConfig` since
   * 40.0.0, and means the same thing: the fields beside it describe a create,
   * and a field left out of the document is not preserved.
   *
   * Optional because the same config creates, where there is no document yet.
   */
  document?: string;
  functionGroupName: string; // Required
  masterLanguage?: string; // Original/master language for create; falls back to systemContext (SAP_LANGUAGE), then EN
  packageName?: string; // Required for create operations, optional for others
  transportRequest?: string; // Only optional parameter
  description?: string; // Required for create/validate operations, optional for others
  masterSystem?: string; // SAP system ID (three characters) — required on on-premise where systeminfo endpoint is unavailable
  responsible?: string; // User responsible for the object — falls back to SAP_USERNAME env var
  sessionId?: string;
  onLock?: (lockHandle: string) => void;
}
