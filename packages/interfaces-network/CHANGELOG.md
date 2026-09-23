# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

  `PROXY_MODIFIED_HEADERS` arrives for the first time rather than moving: it
  groups `HEADER_AUTHORIZATION`, declared here, with three SAP names that were
  declared there, and neither package may import the other, so it could exist
  in neither.

## [1.0.0] - 2026-09-16

### Added

- The package. Its contracts moved unchanged from `@mcp-abap-adt/interfaces`
  44.0.0, which re-exports them, deprecated, from 45.0.0. Why: decision 26 in
  `docs/architecture/DECISIONS.md`.
