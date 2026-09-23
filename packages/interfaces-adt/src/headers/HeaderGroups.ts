/**
 * Groupings of the SAP connection headers this package declares, for callers
 * that iterate over related ones.
 *
 * They were in the `@mcp-abap-adt/interfaces` facade, which declared no header
 * name of its own and imported every one of them from here — a grouping living
 * a package away from what it groups. `PROXY_ROUTING_HEADERS` went the other
 * way, to `-network`, with the three routing names it groups.
 *
 * **`PROXY_MODIFIED_HEADERS` is not here, and cannot be.** It grouped
 * `HEADER_AUTHORIZATION`, which `-network` declares, with three SAP names,
 * which this package declares, and neither package may import the other. A
 * set that spans both domains belongs to whoever composes them — a proxy — and
 * nothing under development imported it.
 */

import {
  HEADER_SAP_AUTH_TYPE,
  HEADER_SAP_CLIENT,
  HEADER_SAP_DESTINATION,
  HEADER_SAP_JWT_TOKEN,
  HEADER_SAP_LOGIN,
  HEADER_SAP_PASSWORD,
  HEADER_SAP_REFRESH_TOKEN,
  HEADER_SAP_UAA_CLIENT_ID,
  HEADER_SAP_UAA_CLIENT_SECRET,
  HEADER_SAP_UAA_URL,
  HEADER_SAP_URL,
  HEADER_UAA_CLIENT_ID,
  HEADER_UAA_CLIENT_SECRET,
  HEADER_UAA_URL,
} from '../Headers';

/** Every header that carries part of an SAP ABAP connection. */
export const SAP_CONNECTION_HEADERS = [
  HEADER_SAP_DESTINATION,
  HEADER_SAP_URL,
  HEADER_SAP_JWT_TOKEN,
  HEADER_SAP_AUTH_TYPE,
  HEADER_SAP_CLIENT,
  HEADER_SAP_LOGIN,
  HEADER_SAP_PASSWORD,
  HEADER_SAP_REFRESH_TOKEN,
] as const;

/** Every UAA/XSUAA header, in both spellings SAP uses. */
export const UAA_HEADERS = [
  HEADER_SAP_UAA_URL,
  HEADER_UAA_URL,
  HEADER_SAP_UAA_CLIENT_ID,
  HEADER_UAA_CLIENT_ID,
  HEADER_SAP_UAA_CLIENT_SECRET,
  HEADER_UAA_CLIENT_SECRET,
] as const;

/** Headers a proxy passes through untouched. */
export const PRESERVED_HEADERS = [
  HEADER_SAP_DESTINATION,
  HEADER_SAP_CLIENT,
] as const;
