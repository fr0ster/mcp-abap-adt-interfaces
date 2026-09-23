/**
 * What came off an HTTP connection, before anyone read it.
 *
 * **It is a frame, not a result.** A caller above the connection boundary is
 * given whatever that implementation's reading makes of this; the shape here
 * exists because the boundary itself has to name what it received.
 *
 * It was `IAdtWireResponse` in `@mcp-abap-adt/interfaces-adt` until that
 * package's 8.0.0. Nothing in it is ABAP — `data`, `status`, `statusText`,
 * `headers` is what any HTTP answer has — and naming it after one protocol on
 * top of HTTP is what made `ICalmResponse`, in the Cloud ALM contracts, an
 * alias of an *ADT* type. The ADT shape still exists, under its own name,
 * narrowing `headers` with the keys ADT actually sends.
 */
export interface IHttpWireResponse<T = unknown, D = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, IHttpHeaderValue>;
  config?: D;
  request?: unknown;
}

/**
 * What a header can hold once a client has parsed the response.
 *
 * `object` is in the union because axios puts one there: a `set-cookie` or a
 * parsed header can arrive as something other than a string, and the shape this
 * replaced — `IAdtHeaderValue` — allowed it. Dropping it narrowed the contract
 * silently, which review caught: an implementation with an object-valued header
 * stopped satisfying it while the migration note claimed the shapes were
 * identical. They are.
 */
export type IHttpHeaderValue =
  | string
  | string[]
  | number
  | boolean
  | null
  | undefined
  | object;
