# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-09-23

### Added

- **The proxy routing headers, from `@mcp-abap-adt/interfaces-adt` 8.0.0** —
  `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION`, `HEADER_MCP_URL`, and
  `PROXY_ROUTING_HEADERS`, which groups the three.

  They name where a proxy sends a request; nothing about them is ABAP, and
  this package already held the MCP session headers. A consumer that reads a
  routing header — `mcp-abap-adt-header-validator` and `cloud-llm-hub` both do
  — now depends on a package with one release behind it instead of on the ADT
  contract.

## [1.0.0] - 2026-09-16

### Added

- The package. Its contracts moved unchanged from `@mcp-abap-adt/interfaces`
  44.0.0, which re-exports them, deprecated, from 45.0.0. Why: decision 26 in
  `docs/architecture/DECISIONS.md`.
