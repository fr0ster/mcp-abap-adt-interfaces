/**
 * HTTP Header Constants for MCP ABAP ADT
 *
 * This file contains all HTTP header names used across MCP ABAP ADT packages.
 * These constants should be used instead of hardcoded string values to ensure
 * consistency and prevent typos.
 *
 * Priority: Values from mcp-abap-adt-interfaces package take precedence.
 */

/**
 * The proxy routing headers moved to `@mcp-abap-adt/interfaces-network` in
 * 8.0.0 — `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION` and
 * `HEADER_MCP_URL`, together with `PROXY_ROUTING_HEADERS`, which groups them.
 * They name a proxy's routing, not anything ABAP, and that package already
 * held the MCP session headers beside them.
 */
/**
 * The SAP connection and UAA header names moved to
 * `@mcp-abap-adt/interfaces-network` in 8.0.0, with the three groups built from
 * them — `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`, `PRESERVED_HEADERS` — and
 * `PROXY_MODIFIED_HEADERS`, which could not exist while they were split across
 * two packages.
 *
 * A header name says how a value travels, not what it means, and nothing in
 * this contract ever used one: only the index re-exported them.
 */

/**
 * Authentication type values
 */
export const AUTH_TYPE_JWT = 'jwt';
export const AUTH_TYPE_BASIC = 'basic';
export const AUTH_TYPE_XSUAA = 'xsuaa';
/**
 * Valid authentication types
 */
export const AUTH_TYPES = [
  AUTH_TYPE_JWT,
  AUTH_TYPE_BASIC,
  AUTH_TYPE_XSUAA,
] as const;
export type AuthType = (typeof AUTH_TYPES)[number];
