/**
 * The return codes of the SAP NetWeaver RFC SDK, by name: `RFC_RC` in the SDK's
 * header `sapnwrfc.h`, every member in its order (index = the numeric code),
 * without the header's `_RFC_RC_max_value` sentinel.
 *
 * A failed RFC call reports its code twice — as the number (`code`) and as the
 * name the SDK renders for it (`codeString`, from `RfcGetRcAsString`). The name
 * is what a consumer compares, so it is this closed list.
 */
export const RFC_RCS = [
  'RFC_OK',
  'RFC_COMMUNICATION_FAILURE',
  'RFC_LOGON_FAILURE',
  'RFC_ABAP_RUNTIME_FAILURE',
  'RFC_ABAP_MESSAGE',
  'RFC_ABAP_EXCEPTION',
  'RFC_CLOSED',
  'RFC_CANCELED',
  'RFC_TIMEOUT',
  'RFC_MEMORY_INSUFFICIENT',
  'RFC_VERSION_MISMATCH',
  'RFC_INVALID_PROTOCOL',
  'RFC_SERIALIZATION_FAILURE',
  'RFC_INVALID_HANDLE',
  'RFC_RETRY',
  'RFC_EXTERNAL_FAILURE',
  'RFC_EXECUTED',
  'RFC_NOT_FOUND',
  'RFC_NOT_SUPPORTED',
  'RFC_ILLEGAL_STATE',
  'RFC_INVALID_PARAMETER',
  'RFC_CODEPAGE_CONVERSION_FAILURE',
  'RFC_CONVERSION_FAILURE',
  'RFC_BUFFER_TOO_SMALL',
  'RFC_TABLE_MOVE_BOF',
  'RFC_TABLE_MOVE_EOF',
  'RFC_START_SAPGUI_FAILURE',
  'RFC_ABAP_CLASS_EXCEPTION',
  'RFC_UNKNOWN_ERROR',
  'RFC_AUTHORIZATION_FAILURE',
  'RFC_AUTHENTICATION_FAILURE',
  'RFC_CRYPTOLIB_FAILURE',
  'RFC_IO_FAILURE',
  'RFC_LOCKING_FAILURE',
] as const;

/** One of {@link RFC_RCS}: the name of an RFC SDK return code. */
export type RfcReturnCodeName = (typeof RFC_RCS)[number];

/**
 * What the RFC SDK said about a failed call, as fields — its `RFC_ERROR_INFO`
 * as `@mcp-abap-adt/sap-rfc-lite` hands it over, without the message and the
 * ABAP message variables.
 *
 * Read a failure from these, never from the error's words:
 *
 * ```typescript
 * if (error.rfc?.codeString === 'RFC_CLOSED') {
 *   // the other side closed the conversation
 * }
 * ```
 */
export interface IRfcErrorInfo {
  /** The SDK's error key: free text the SDK fills (up to 128 characters). */
  readonly key: string;
  /** The SDK's error group (`RFC_ERROR_GROUP`), as its number. */
  readonly group: number;
  /** The SDK's return code (`RFC_RC`), as its number. */
  readonly code: number;
  /** The return code's name, e.g. `RFC_CLOSED`. */
  readonly codeString: RfcReturnCodeName;
}

/**
 * The error a connection throws, as a consumer reads it: a caught value
 * narrowed to this, never parsed out of its message.
 *
 * A connection throws an `Error` that carries these fields; it does not throw
 * this type as such. Every field is optional, so an error that names neither —
 * an HTTP failure, a programming error — still conforms.
 */
export interface IAbapConnectionError {
  /**
   * What the failure is called: one of `ADT_SESSION_ERROR` for a session
   * failure, or a Node network code (`ECONNREFUSED`, …). Unchanged by
   * {@link rfc}: an RFC failure keeps the code it would have without it.
   */
  readonly code?: string | undefined;
  /**
   * The RFC SDK's fields, when the request failed in an RFC call that the SDK
   * reported; absent for an HTTP failure and for anything raised before a
   * call was made.
   */
  readonly rfc?: IRfcErrorInfo | undefined;
}
