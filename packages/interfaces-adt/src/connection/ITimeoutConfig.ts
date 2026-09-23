/**
 * The deadlines a caller gives an ADT connection.
 *
 * **`csrf` is why this is not in `@mcp-abap-adt/interfaces-network`.** Fetching
 * a CSRF token is an SAP operation, not a transport primitive, and `long` is a
 * client's policy for a long-polling read rather than anything the network
 * layer knows. It was in that package until `interfaces-adt` 9.0.0, against its
 * own README's claim that it holds nothing SAP-specific.
 */
export interface ITimeoutConfig {
  default: number;
  csrf: number;
  long: number;
}
