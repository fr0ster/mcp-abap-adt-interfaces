/**
 * `@mcp-abap-adt/interfaces` — a deprecated facade that exports nothing.
 *
 * **It forwarded the four split packages until 52.0.0, and that forwarding was
 * duplication with a cost.** Every change to any of them made a release here,
 * and a consumer holding this package moved at the pace of contracts it does
 * not use. Measured across the sibling repositories, the effect was not churn
 * but freezing: they sat on facade majors 2, 5, 7, 11, 39 and 46, because one
 * step forward cost them every other package's history.
 *
 * Import from the package that declares the name:
 *
 * | what you want | where it lives |
 * |---|---|
 * | ADT contracts, the ABAP and Cloud ALM connections, SAP/BTP configuration and authentication | `@mcp-abap-adt/interfaces-adt` |
 * | `IAuthProvider`, `IRenewableCredential`, `ICertificateMaterial` | `@mcp-abap-adt/interfaces-auth` |
 * | WebSocket transport, `ITimeoutConfig`, HTTP and MCP header names | `@mcp-abap-adt/interfaces-network` |
 * | `ILogger`, `LogLevel` | `@mcp-abap-adt/interfaces-utils` |
 *
 * The five header groups, `ISessionState`, `ISessionStorage` and
 * `ITokenProviderResult` were this package's own and are gone with the same
 * release. Each already carried the note *"No package imports this; it is
 * removed in the next major"* — this is that major, and a search across every
 * repository under development confirmed the premise before acting on it.
 *
 * @deprecated Nothing is exported here. Import from `@mcp-abap-adt/interfaces-adt`,
 * `-auth`, `-network` or `-utils`.
 */

export {};
