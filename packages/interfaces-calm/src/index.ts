/**
 * `@mcp-abap-adt/interfaces-calm` — contracts for SAP Cloud ALM HTTP APIs.
 *
 * **Cloud ALM is not ABAP**, and these four contracts spent their life in
 * `@mcp-abap-adt/interfaces-adt` because one of them aliased an ADT type: the
 * response shape. `mcp-calm-client` and `mcp-calm-server` therefore depended on
 * the fastest-moving contract in the set to describe a service that has nothing
 * to do with ADT.
 *
 * The only thing they need from elsewhere is the HTTP frame, which is in
 * `@mcp-abap-adt/interfaces-network`.
 */

export type { CalmService } from './connection/CalmService';
export { CALM_SERVICES } from './connection/CalmService';
export type {
  ICalmConnection,
  ICalmResponse,
} from './connection/ICalmConnection';
export type { ICalmRequestOptions } from './connection/ICalmRequestOptions';
