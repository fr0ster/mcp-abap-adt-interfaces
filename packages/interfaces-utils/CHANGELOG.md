# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-09-23

### Added

- **`XmlNode`, from `@mcp-abap-adt/interfaces-adt` 9.0.0** — what an XML parser
  hands back for one node, recursive so a consumer can walk a parsed document
  without `any`.

  A parser's output shape is not an ADT contract, whatever the document happens
  to contain. The ADT contract declared it and never used it.

## [1.0.0] - 2026-09-16

### Added

- The package. Its contracts moved unchanged from `@mcp-abap-adt/interfaces`
  44.0.0, which re-exports them, deprecated, from 45.0.0. Why: decision 26 in
  `docs/architecture/DECISIONS.md`.
