# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-09-23

### Added

- **`HttpError`, from `@mcp-abap-adt/interfaces-adt` 9.0.0** — the shape an HTTP
  client throws, so a consumer writes `catch (error: unknown)` and narrows
  instead of `catch (error: any)`.

  Nothing about an HTTP error is ABAP. It was in the ADT contract, which never
  used it: 14 files in `@mcp-abap-adt/adt-clients` import it, and so does
  `sap-cloud-alm-odata-mcp`, which speaks no ADT at all.

### Removed

- **BREAKING: `ITimeoutConfig` leaves, for `@mcp-abap-adt/interfaces-adt`
  9.0.0.** Its three fields are `default`, `csrf` and `long`. **Fetching a CSRF
  token is an SAP operation, not a transport primitive**, and `long` is a
  client's policy for a long-polling read rather than anything a network layer
  knows — so this package held a type whose own fields name operations it does
  not have, against its README's claim that nothing here is SAP-specific.

  One consumer: `mcp-abap-connection`, in `src/utils/timeouts.ts`, which takes
  `interfaces-adt` already.

## [1.1.0] - 2026-09-23

### Added

- **Every header name, from `@mcp-abap-adt/interfaces-adt` 8.0.0** — the three
  routing ones (`HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION`,
  `HEADER_MCP_URL`) and all fifteen SAP and UAA ones, with the five groups:
  `PROXY_ROUTING_HEADERS`, `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`,
  `PRESERVED_HEADERS`, `PROXY_MODIFIED_HEADERS`.

  **A header name says how a value travels, not what it means**, which makes it
  this package's subject whatever system it addresses. The ADT contract never
  used one — only its index re-exported them — while
  `mcp-abap-adt-header-validator` imports fifteen and nothing else from it, and
  `cloud-llm-hub` reads routing headers. Both now depend on a package with one
  release behind it.

- **`IHttpWireResponse` and `IHttpHeaderValue`** — what came off an HTTP
  connection, before anyone read it: `data`, `status`, `statusText`, `headers`.

  It was `IAdtWireResponse` in `@mcp-abap-adt/interfaces-adt`, and naming a
  plain HTTP frame after one protocol on top of HTTP had a visible cost:
  `ICalmResponse`, in the Cloud ALM contracts, was an alias of an *ADT* type,
  which is why those contracts could not leave that package. `IAdtWireResponse`
  still exists and still narrows `headers` with the keys ADT sends
  (`sap-adt-location`, both spellings of `content-location`) — it extends this
  shape rather than repeating it, so no consumer renames anything.

  `PROXY_MODIFIED_HEADERS` arrives for the first time rather than moving: it
  groups `HEADER_AUTHORIZATION`, declared here, with three SAP names that were
  declared there, and neither package may import the other, so it could exist
  in neither.

## [1.0.0] - 2026-09-16

### Added

- The package. Its contracts moved unchanged from `@mcp-abap-adt/interfaces`
  44.0.0, which re-exports them, deprecated, from 45.0.0. Why: decision 26 in
  `docs/architecture/DECISIONS.md`.
