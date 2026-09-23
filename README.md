# mcp-abap-adt-interfaces

Contracts for the MCP ABAP ADT packages: types and constants, no implementations.

## TL;DR

- **Install the package whose contracts you accept**, not all of them.
- **`@mcp-abap-adt/interfaces` exports nothing** as of 52.0.0. It was a deprecated facade forwarding the four; forwarding is what bound a consumer to the release rate of contracts it does not use, so it stopped. Nothing is added to it, ever.
- No package here depends on an implementation or a runtime package.

| package | holds | depends on |
|---|---|---|
| [`@mcp-abap-adt/interfaces-utils`](packages/interfaces-utils) | logging: `ILogger`, `LogLevel` | nothing |
| [`@mcp-abap-adt/interfaces-network`](packages/interfaces-network) | WebSocket transport, `NETWORK_ERROR_CODES`, `ITimeoutConfig`, generic HTTP, MCP and proxy routing header names | nothing |
| [`@mcp-abap-adt/interfaces-auth`](packages/interfaces-auth) | `IAuthProvider`, `IRenewableCredential`, `ICertificateMaterial` | nothing |
| [`@mcp-abap-adt/interfaces-adt`](packages/interfaces-adt) | ADT contracts, the ABAP and Cloud ALM connections, SAP/BTP configuration and authentication | `interfaces-auth`, `interfaces-utils` |
| [`@mcp-abap-adt/interfaces`](packages/interfaces) | nothing, since 52.0.0 — a deprecated facade that stopped forwarding | nothing |

## Why five packages

One version line for every contract meant an ADT major bumped a package that only needed `IAuthProvider`. A contract now lives where it is accepted — decision 26 in [`docs/architecture/DECISIONS.md`](docs/architecture/DECISIONS.md); the design is in [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

## Working in this repository

```bash
npm ci
npm run check      # build, type checks, surface, graph, deprecations, packed tarballs, release tool
```

There is no CI; `npm run check` is what holds, and every package's `prepublishOnly` runs it.

Publish with `npm run release:publish`. It publishes only the packages whose version is not on the registry yet, in dependency order (`interfaces-utils`, `interfaces-network`, `interfaces-auth`, `interfaces-adt`, `interfaces`), and runs `npm run check` once rather than once per package. Everything goes out first; afterwards it asks the registry which versions are being served and names any that are not yet, or that it could not check. A version npm refuses and the registry then vouches for was published by an earlier run, and the summary says so rather than counting it as this one's. That is **exit 2** — published, not confirmed — and is not a failure; wait for `npm view <package> versions --prefer-online` to show the version before re-running, because a re-run before then puts the package back in the plan. **Exit 1** is a publish that errored with no version on the registry to account for it, and stops the run there; a publish npm refuses for a version the registry does serve is treated as already published, which is what a re-run meets when the read that built the plan was stale. `npm run release:publish -- --dry-run` prints the plan and changes nothing.

It refuses to publish unless the tree **is** the tagged release: a dirty tree, a version with no matching tag, a tag that is not an ancestor of `HEAD`, or any difference between `HEAD` and that tag. Ancestry alone would let a commit made after the tag change a package without bumping it, and the tarball would then carry content the tagged version never had — so release, tag and publish from one commit; if `HEAD` has moved on, `git checkout <tag>` and publish from there.

A prerelease version requires a dist-tag other than `latest` (`npm run release:publish -- --tag=next`); on `latest` it would reach everyone who asked for the stable line. Publishing to `latest` is also refused when it would move that tag backwards, compared with real SemVer precedence rather than string order. Both rules key on whether the publish targets `latest`, not on whether a `--tag` was given, so `--tag=latest` is treated exactly like passing none.

Do not publish the workspaces by hand. `npm publish -w` for every package republishes the ones that have not changed, and npm answers each with `You cannot publish over the previously published versions` — errors that are expected, and therefore skipped over, and therefore hide the one that is not.

## Licence

**GNU Lesser General Public License v3.0 only** (`LGPL-3.0-only`) for every package. See [`LICENSE`](LICENSE) and [`COPYING`](COPYING).
