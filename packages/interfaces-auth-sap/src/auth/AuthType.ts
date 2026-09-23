/**
 * The authentication type of an SAP connection.
 *
 * **XSUAA is a BTP service**, so `AUTH_TYPE_XSUAA` belongs here rather than
 * with authentication in general, and so does the union: a set that includes it
 * describes what a *BTP* connection accepts.
 *
 * `jwt` and `basic` are not SAP — a bearer token and a user with a password —
 * and are declared in `@mcp-abap-adt/interfaces-auth`. They are imported to
 * build the union and deliberately **not** re-exported: a consumer that wants
 * `AUTH_TYPE_JWT` takes it from the package that declares it, forwarding being
 * the duplication this family spent a day removing.
 */
import { AUTH_TYPE_BASIC, AUTH_TYPE_JWT } from '@mcp-abap-adt/interfaces-auth';

/** SAP's own OAuth service on BTP. */
export const AUTH_TYPE_XSUAA = 'xsuaa';

/** Every authentication type a BTP connection accepts. */
export const AUTH_TYPES = [
  AUTH_TYPE_JWT,
  AUTH_TYPE_BASIC,
  AUTH_TYPE_XSUAA,
] as const;

export type AuthType = (typeof AUTH_TYPES)[number];
