# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-09-23

### Added

- **The Cloud ALM contracts, from `@mcp-abap-adt/interfaces-adt` 8.0.0** —
  `CalmService`, `CALM_SERVICES`, `ICalmConnection`, `ICalmRequestOptions` and
  `ICalmResponse`.

  Cloud ALM is not ABAP. They lived in the ADT contract because one of them
  aliased an ADT type — `ICalmResponse` was `IAdtWireResponse` — so
  `mcp-calm-client` and `mcp-calm-server` depended on the fastest-moving
  package in the set to describe a service with nothing to do with ADT.

  The alias is `IHttpWireResponse` from `@mcp-abap-adt/interfaces-network` now,
  which is this package's only dependency.
