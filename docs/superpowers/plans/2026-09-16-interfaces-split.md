# Splitting `@mcp-abap-adt/interfaces` into Packages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single `@mcp-abap-adt/interfaces` package into an npm workspace of five packages — `interfaces-utils`, `interfaces-network`, `interfaces-auth`, `interfaces-adt` and the `interfaces` facade — without changing any contract and without removing anything a consumer imports today.

**Architecture:** The repository becomes an npm workspace. The existing package moves unchanged to `packages/interfaces`; then, one package at a time in publish order, a script moves the files the spec assigns to that package, rewrites the imports that now cross a package boundary, and leaves a per-symbol `@deprecated` re-export in the facade. Five checks, written before anything moves, hold the split honest: the facade's surface, declarations and constant values equal 44.0.0; every symbol is declared in its assigned package; every import follows the dependency graph; every facade symbol is reported deprecated; and the packed tarballs, installed with no workspace links, give the same declarations and the same constant objects from both paths.

**Tech Stack:** TypeScript 5.9 (CommonJS, `moduleResolution: node`, project references with `tsc -b`), npm 10+ workspaces, Biome 2.3, Node ≥ 18 (checks run on the local Node). No CI in this repository.

**Spec:** `docs/superpowers/specs/2026-09-15-interfaces-split-design.md` (approved at `69a4fd5`; `d3cbace` moves `auth/AuthType.ts` to `interfaces-adt`).

**Validated:** every script and every expected output below comes from a full dry run of Tasks 1–7 on a copy of `master` at `69a4fd5` (2026-09-16): build, type checks, surface, placement, graph, deprecation and packed checks all pass at the end.

## Global Constraints

- **Licence:** every package is `LGPL-3.0-only` (spec §6). Each package ships `LICENSE` and `COPYING`.
- **No contract changes:** no member, parameter, type or constant changes shape or value (spec §9). Files move; only import specifiers change.
- **Nothing disappears or changes in the facade:** `@mcp-abap-adt/interfaces` exports exactly the 381 symbols of 44.0.0 with the same type/value kind (`tools/surface-44.0.0.txt`), the same declarations and the same constant values (`tools/baseline-44.0.0.json`), and so does what npm installs.
- **Deprecation text:** every moved symbol is re-exported from the facade as `/** @deprecated Import from @mcp-abap-adt/interfaces-<name> */` (spec §5.2). The seven unaccepted ones stay in the facade with a `@deprecated` tag saying no package imports them and they go with the facade's next major — the exact text is `NOTE` in `tools/split/deprecate-unaccepted.js` (spec §3.5).
- **Dependency graph (spec §3.6):** `interfaces-utils`, `interfaces-network`, `interfaces-auth` → nothing; `interfaces-adt` → `interfaces-auth`, `interfaces-utils`; `interfaces` → all four. No package depends on an implementation or runtime package.
- **Constants:** data only; every package sets `"sideEffects": false` (spec §4).
- **Versions:** new packages start at `1.0.0`; the facade becomes `45.0.0` only in the release task; versions are independent afterwards (spec §5.5). Sibling ranges are `^1.0.0`.
- **Publish order (spec §5.1):** `interfaces-utils`, `interfaces-network`, `interfaces-auth` → `interfaces-adt` → `interfaces`. The user publishes (npm 2FA); nobody else runs `npm publish`.
- **Style:** Biome, single quotes, 2-space indent; all code, docs and commit messages in English; Conventional Commits.
- **Out of scope:** new contracts of spec §7 (added only when an accepting package exists, decision 11); moving dependents to the new packages (spec §5.3, each dependent's own release); removing deprecated symbols (a later major, spec §3.5).
- **Do not touch** the worktree `.worktrees/feat-saml-assertion-validation` or its branch.

---

## Before you start

- [ ] **Work in a worktree on a feature branch** (the PR is reviewed before merge):

```bash
cd /home/okyslytsia/prj/mcp-abap-adt-interfaces
git fetch origin && git checkout master && git pull --ff-only
git worktree add .worktrees/interfaces-split -b feat/interfaces-split master
cd .worktrees/interfaces-split
npm ci
npm run build && npm run test:check
```

Expected: `Checked 119 files … No fixes applied.` and no TypeScript errors. All later commands run from the worktree root unless a step says otherwise.

- [ ] **Know the one open branch this collides with.** `feat/saml-assertion-validation` (no PR) adds `src/auth/IAssertionValidator.ts` (imports `../logging/ILogger`) and edits `src/index.ts` and `src/token/TokenProviderErrorCodes.ts`. After this split lands, that work belongs in `packages/interfaces-adt/src/auth/` importing `ILogger` from `@mcp-abap-adt/interfaces-utils`. Do not rebase or edit it here; mention it in the PR description.

## File structure at the end

```
package.json                  private workspace root: scripts, devDependencies, overrides
tsconfig.base.json            compiler options shared by every package
tools/
  lib/exports.js              reads a package's public surface with the TypeScript API
  package-map.json            symbol → package, generated once from 44.0.0 (Task 1)
  surface-44.0.0.txt          the 44.0.0 facade surface: "<name> <type|value>" per line
  baseline-44.0.0.json        44.0.0 declarations (tokens, no comments) and constant values (JSON)
  check-surface.js            facade names, kinds, declarations, values == 44.0.0; placement
  check-graph.js              imports follow spec §3.6 and are declared
  check-deprecated.js         every facade symbol reports TS6385
  check-packed.js             spec §6 published-artifact check, also against 44.0.0
  version-stats.sh            unchanged
packages/
  interfaces-utils/           logging/ILogger.ts, logging/LogLevel.ts
  interfaces-network/         connection/IWebSocketTransport.ts, connection/NetworkErrors.ts,
                              utils/ITimeoutConfig.ts, Headers.ts (generic names)
  interfaces-auth/            auth/IAuthProvider.ts, auth/ICertificateMaterial.ts,
                              __typechecks__/authProvider.ts
  interfaces-adt/             adt/ runtime/ execution/ feeds/ service/ shared/ sap/ session/
                              serviceKey/ store/ validation/ token/ (all but ITokenProviderResult),
                              auth/ (the SAP/BTP part), connection/ (ABAP, Cloud ALM, capabilities),
                              utils/ITokenRefreshResult.ts, Headers.ts (SAP/BTP names, AUTH_TYPES),
                              __typechecks__/ (22 files)
  interfaces/                 index.ts (deprecated re-exports), Headers.ts (the five header groups),
                              storage/ISessionState.ts, storage/ISessionStorage.ts,
                              token/ITokenProviderResult.ts
```

Each package has `package.json`, `tsconfig.json` (includes `__typechecks__`), `tsconfig.build.json` (excludes them), `README.md`, `CHANGELOG.md`, `LICENSE`, `COPYING`.

---

### Task 1: The workspace, holding the existing package, and the checks that guard the split

**Files:**
- Create: `tools/lib/exports.js`, `tools/generate-package-map.js`, `tools/check-surface.js`, `tools/check-graph.js`, `tools/check-deprecated.js`, `tsconfig.base.json`, `packages/interfaces/tsconfig.json`, `packages/interfaces/tsconfig.build.json`
- Generate: `tools/package-map.json`, `tools/surface-44.0.0.txt`, `tools/baseline-44.0.0.json`
- Move: `src/`, `tsconfig.json`, `tsconfig.build.json`, `README.md`, `CHANGELOG.md`, `package.json` → `packages/interfaces/`
- Copy: `LICENSE`, `COPYING` → `packages/interfaces/`
- Replace: root `package.json` (workspace root), `package-lock.json` (regenerated)

**Interfaces:**
- Produces: `tools/lib/exports.js` exporting `{ ROOT, COMPILER_OPTIONS, exportsOf(entry, options?) → [{ name, kind: 'type'|'value', file, packageDir, declaration }], normalizedDeclaration(symbol), packageDirOf(file), readBaseline() }`; `tools/package-map.json` `{ [symbol]: 'interfaces-utils'|'interfaces-network'|'interfaces-auth'|'interfaces-adt'|'interfaces' }`; `tools/surface-44.0.0.txt`; `tools/baseline-44.0.0.json` `{ [symbol]: { declaration: string, value?: string } }`; root scripts `build`, `test:check`, `lint`, `check:surface`, `check:graph`, `check:deprecated`, `check`; `packages/interfaces/package.json` scripts `clean`, `build`, `test:check`, `prepublishOnly`.

- [ ] **Step 1: Create the surface reader**

`tools/lib/exports.js`:

```js
// Reads the public surface of a package entry point with the TypeScript compiler.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..', '..');

const COMPILER_OPTIONS = {
  strict: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  types: ['node'],
  typeRoots: [path.join(ROOT, 'node_modules', '@types')],
  skipLibCheck: true,
  noEmit: true,
};

function isTypeOnlyExport(symbol) {
  return (symbol.declarations ?? []).some(
    (d) =>
      ts.isExportSpecifier(d) && (d.isTypeOnly || d.parent.parent.isTypeOnly),
  );
}

/** The package directory under packages/ that declares a file, or null. */
function packageDirOf(fileName) {
  const real = fs.realpathSync(fileName);
  const m = real.match(/[\\/]packages[\\/]([^\\/]+)[\\/]/);
  return m ? m[1] : null;
}

/**
 * A declaration as a contract: its tokens, without comments, JSDoc or layout.
 * Moving a file changes its imports and JSDoc, never these tokens.
 */
function normalizedDeclaration(symbol) {
  return (symbol.declarations ?? [])
    .map((declaration) => {
      const scanner = ts.createScanner(
        ts.ScriptTarget.Latest,
        true,
        ts.LanguageVariant.Standard,
        declaration.getText(),
      );
      const tokens = [];
      for (
        let kind = scanner.scan();
        kind !== ts.SyntaxKind.EndOfFileToken;
        kind = scanner.scan()
      )
        tokens.push(scanner.getTokenText());
      return tokens.join(' ');
    })
    .sort()
    .join('\n');
}

/**
 * Every export of `entry`: its public name, whether it is usable as a value,
 * the file and package that declare what it resolves to, and that declaration
 * normalised.
 */
function exportsOf(entry, options = COMPILER_OPTIONS) {
  const program = ts.createProgram([entry], options);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  if (!source) throw new Error(`cannot read ${entry}`);
  const moduleSymbol = checker.getSymbolAtLocation(source);
  return checker
    .getExportsOfModule(moduleSymbol)
    .map((symbol) => {
      const target =
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      const declaration = target.declarations?.[0];
      const file = declaration ? declaration.getSourceFile().fileName : null;
      return {
        name: symbol.name,
        kind:
          target.flags & ts.SymbolFlags.Value && !isTypeOnlyExport(symbol)
            ? 'value'
            : 'type',
        file,
        packageDir: file ? packageDirOf(file) : null,
        declaration: normalizedDeclaration(target),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The 44.0.0 baseline: { [name]: { declaration, value? } }, value as JSON. */
function readBaseline() {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, 'tools', 'baseline-44.0.0.json'), 'utf8'),
  );
}

module.exports = {
  ROOT,
  COMPILER_OPTIONS,
  exportsOf,
  normalizedDeclaration,
  packageDirOf,
  readBaseline,
};
```

- [ ] **Step 2: Create the map generator** — it reads the built 44.0.0 layout, so it runs before anything moves

`tools/generate-package-map.js`:

```js
// One-off, run on the built 44.0.0 layout (`npm run build` first): records which
// package every public symbol belongs to after the split (spec §3), and the
// 44.0.0 contract to preserve — surface, declarations and constant values.
//   npm run build && node tools/generate-package-map.js
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, exportsOf } = require('./lib/exports');

const NETWORK_HEADERS = new Set([
  'HEADER_AUTHORIZATION',
  'HEADER_CONTENT_TYPE',
  'HEADER_ACCEPT',
  'HEADER_SESSION_ID',
  'HEADER_MCP_SESSION_ID',
  'HEADER_X_MCP_SESSION_ID',
]);
const HEADER_GROUPS = new Set([
  'PROXY_ROUTING_HEADERS',
  'SAP_CONNECTION_HEADERS',
  'UAA_HEADERS',
  'PRESERVED_HEADERS',
  'PROXY_MODIFIED_HEADERS',
]);

function packageFor(relFile, name) {
  if (relFile.startsWith('logging/')) return 'interfaces-utils';
  if (
    relFile === 'connection/IWebSocketTransport.ts' ||
    relFile === 'connection/NetworkErrors.ts' ||
    relFile === 'utils/ITimeoutConfig.ts'
  )
    return 'interfaces-network';
  if (relFile === 'auth/IAuthProvider.ts') return 'interfaces-auth';
  if (relFile === 'auth/ICertificateMaterialLoader.ts')
    return name === 'ICertificateMaterial'
      ? 'interfaces-auth'
      : 'interfaces-adt';
  if (relFile === 'Headers.ts') {
    if (NETWORK_HEADERS.has(name)) return 'interfaces-network';
    if (HEADER_GROUPS.has(name)) return 'interfaces';
    return 'interfaces-adt';
  }
  if (
    relFile.startsWith('storage/') ||
    relFile === 'token/ITokenProviderResult.ts'
  )
    return 'interfaces';
  return 'interfaces-adt';
}

const dist = path.join(ROOT, 'dist');
const entries = exportsOf(path.join(dist, 'index.d.ts'));
const runtime = require(path.join(dist, 'index.js'));
const map = {};
const baseline = {};
for (const e of entries) {
  const relFile = path.relative(dist, e.file).replace(/\.d\.ts$/, '.ts');
  map[e.name] = packageFor(relFile, e.name);
  baseline[e.name] = { declaration: e.declaration };
  if (e.kind === 'value')
    baseline[e.name].value = JSON.stringify(runtime[e.name]);
}
const write = (name, text) =>
  fs.writeFileSync(path.join(ROOT, 'tools', name), text);
write('package-map.json', `${JSON.stringify(map, null, 2)}\n`);
write(
  'surface-44.0.0.txt',
  `${entries.map((e) => `${e.name} ${e.kind}`).join('\n')}\n`,
);
write('baseline-44.0.0.json', `${JSON.stringify(baseline, null, 1)}\n`);
const counts = {};
for (const p of Object.values(map)) counts[p] = (counts[p] ?? 0) + 1;
const values = entries.filter((e) => e.kind === 'value').length;
console.log(entries.length, 'symbols', values, 'values', counts);
```

- [ ] **Step 3: Build 44.0.0 and generate the map and the baseline**

Run: `npm run build && node tools/generate-package-map.js`

Expected, after Biome's line:
```
381 symbols 51 values {
  'interfaces-adt': 355,
  'interfaces-network': 14,
  'interfaces-auth': 3,
  'interfaces-utils': 2,
  interfaces: 7
}
```

Spot-check the cases the spec argues about:

Run:
```bash
node -e 'const m=require("./tools/package-map.json");for(const n of ["AuthType","AuthTypeEnum","ICertificateMaterial","ICertificateMaterialLoader","HEADER_AUTHORIZATION","PROXY_MODIFIED_HEADERS","ISessionState","ICallbackServerHandle","ADT_SESSION_ERROR","ITimeoutConfig","IAuthProvider","LogLevel"])console.log(n,m[n])'
```
Expected:
```
AuthType interfaces-adt
AuthTypeEnum interfaces-adt
ICertificateMaterial interfaces-auth
ICertificateMaterialLoader interfaces-adt
HEADER_AUTHORIZATION interfaces-network
PROXY_MODIFIED_HEADERS interfaces
ISessionState interfaces
ICallbackServerHandle interfaces-adt
ADT_SESSION_ERROR interfaces-adt
ITimeoutConfig interfaces-network
IAuthProvider interfaces-auth
LogLevel interfaces-utils
```
(`token/ITokenProviderResult.ts` is not exported from `index.ts`, so it is not in the map; it stays in the facade as a file.)

- [ ] **Step 4: Create the three checks**

`tools/check-surface.js`:

```js
// The built facade exports exactly the 44.0.0 contract — the same names, kinds,
// declarations and constant values — and each symbol is declared in the package
// the split assigns it to. Run after `npm run build`.
//   node tools/check-surface.js                      contract only
//   node tools/check-surface.js --placement <dir>    + placement for one package
//   node tools/check-surface.js --placement all      + placement for every symbol
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, exportsOf, readBaseline } = require('./lib/exports');

const facade = path.join(ROOT, 'packages', 'interfaces', 'dist');
const expected = fs
  .readFileSync(path.join(ROOT, 'tools', 'surface-44.0.0.txt'), 'utf8')
  .trim()
  .split('\n');
const map = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tools', 'package-map.json'), 'utf8'),
);
const baseline = readBaseline();

const entries = exportsOf(path.join(facade, 'index.d.ts'));
const actual = entries.map((e) => `${e.name} ${e.kind}`);
const problems = [];
for (const line of expected)
  if (!actual.includes(line)) problems.push(`missing from facade: ${line}`);
for (const line of actual)
  if (!expected.includes(line)) problems.push(`not in 44.0.0: ${line}`);

const runtime = require(path.join(facade, 'index.js'));
for (const e of entries) {
  const base = baseline[e.name];
  if (!base) continue;
  if (e.declaration !== base.declaration)
    problems.push(`declaration changed: ${e.name}`);
  if ('value' in base && JSON.stringify(runtime[e.name]) !== base.value)
    problems.push(`value changed: ${e.name}`);
}

const flag = process.argv.indexOf('--placement');
const only = flag === -1 ? null : process.argv[flag + 1];
if (only) {
  for (const e of entries) {
    const want = map[e.name];
    if (only !== 'all' && want !== only) continue;
    if (e.packageDir !== want)
      problems.push(
        `${e.name}: declared in ${e.packageDir ?? '?'}, belongs to ${want}`,
      );
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`${problems.length} problem(s)`);
  process.exit(1);
}
console.log(
  `surface: ${actual.length} symbols match 44.0.0 in name, kind, declaration and value${only ? `; placement ok (${only})` : ''}`,
);
```

`tools/check-graph.js`:

```js
// Every package imports only what spec §3.6 allows, declares it in
// package.json, and never reaches outside its own src with a relative path.
//   node tools/check-graph.js
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./lib/exports');

const ALLOWED = {
  'interfaces-utils': [],
  'interfaces-network': [],
  'interfaces-auth': [],
  'interfaces-adt': ['interfaces-auth', 'interfaces-utils'],
  interfaces: [
    'interfaces-utils',
    'interfaces-network',
    'interfaces-auth',
    'interfaces-adt',
  ],
};

function tsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const f = path.join(dir, e.name);
    return e.isDirectory() ? tsFiles(f) : f.endsWith('.ts') ? [f] : [];
  });
}

const problems = [];
const packagesDir = path.join(ROOT, 'packages');
for (const dir of fs.readdirSync(packagesDir)) {
  if (!fs.existsSync(path.join(packagesDir, dir, 'package.json'))) continue;
  if (!(dir in ALLOWED)) {
    problems.push(`${dir}: not a package the spec defines`);
    continue;
  }
  const pkgRoot = path.join(packagesDir, dir);
  const src = path.join(pkgRoot, 'src');
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'),
  );
  const declared = Object.keys(manifest.dependencies ?? {});
  for (const dep of declared) {
    const short = dep.replace('@mcp-abap-adt/', '');
    if (!ALLOWED[dir].includes(short))
      problems.push(`${dir}: package.json depends on ${dep}, not allowed`);
  }
  for (const file of tsFiles(src)) {
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file);
    for (const m of text.matchAll(/(?:from|import\()\s*['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      if (spec.startsWith('.')) {
        const target = path.resolve(path.dirname(file), spec);
        if (!target.startsWith(src + path.sep))
          problems.push(`${rel}: relative import leaves the package: ${spec}`);
        continue;
      }
      if (spec.startsWith('node:')) continue;
      const short = spec.replace('@mcp-abap-adt/', '');
      if (!ALLOWED[dir].includes(short))
        problems.push(`${rel}: imports ${spec}, not allowed for ${dir}`);
      else if (!declared.includes(spec))
        problems.push(`${rel}: imports ${spec}, missing from package.json`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('graph: every import is allowed and declared');
```

`tools/check-deprecated.js`:

```js
// Every symbol a consumer imports from @mcp-abap-adt/interfaces is reported
// deprecated (TS6385) — the moved ones point at their new package, the
// unaccepted ones announce their removal. Run after `npm run build`.
//   node tools/check-deprecated.js [--expect-none-for <dir>]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const { ROOT, COMPILER_OPTIONS } = require('./lib/exports');

const map = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tools', 'package-map.json'), 'utf8'),
);
const surface = fs
  .readFileSync(path.join(ROOT, 'tools', 'surface-44.0.0.txt'), 'utf8')
  .trim()
  .split('\n')
  .map((l) => l.split(' '));

// Symbols whose package already exists are checked; the rest are still at home.
const existing = new Set(
  fs
    .readdirSync(path.join(ROOT, 'packages'))
    .filter((d) =>
      fs.existsSync(path.join(ROOT, 'packages', d, 'package.json')),
    ),
);
const checked = surface.filter(([name]) => existing.has(map[name]));

const dir = fs.mkdtempSync(path.join(ROOT, 'node_modules', '.deprecated-'));
const consumer = path.join(dir, 'consumer.ts');
const types = checked.filter(([, k]) => k === 'type').map(([n]) => n);
const values = checked.filter(([, k]) => k === 'value').map(([n]) => n);
fs.writeFileSync(
  consumer,
  [
    `import type { ${types.join(', ')} } from '@mcp-abap-adt/interfaces';`,
    `import { ${values.join(', ')} } from '@mcp-abap-adt/interfaces';`,
    '',
  ].join('\n'),
);

const host = {
  getScriptFileNames: () => [consumer],
  getScriptVersion: () => '1',
  getScriptSnapshot: (f) =>
    fs.existsSync(f)
      ? ts.ScriptSnapshot.fromString(fs.readFileSync(f, 'utf8'))
      : undefined,
  getCurrentDirectory: () => ROOT,
  getCompilationSettings: () => COMPILER_OPTIONS,
  getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists,
  getDirectories: ts.sys.getDirectories,
};
const service = ts.createLanguageService(host);
const errors = service.getSemanticDiagnostics(consumer);
const reported = new Set(
  service
    .getSuggestionDiagnostics(consumer)
    .filter((d) => d.code === 6385)
    .map(
      (d) =>
        ts
          .flattenDiagnosticMessageText(d.messageText, ' ')
          .match(/'([^']+)'/)[1],
    ),
);
fs.rmSync(dir, { recursive: true, force: true });

const problems = errors.map(
  (d) =>
    `consumer does not compile: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`,
);
for (const [name] of checked)
  if (!reported.has(name))
    problems.push(`not deprecated in the facade: ${name}`);

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`${problems.length} problem(s)`);
  process.exit(1);
}
console.log(
  `deprecated: all ${checked.length} checked symbols are reported deprecated`,
);
```

- [ ] **Step 5: Run the surface check — it fails, there is no workspace yet**

Run: `node tools/check-surface.js`
Expected: FAIL with `Error: cannot read …/packages/interfaces/dist/index.d.ts`.

- [ ] **Step 6: Turn the repository into a workspace holding the existing package unchanged**

Run from the worktree root:

```bash
bash -euo pipefail <<'SCRIPT'

mkdir -p packages/interfaces
git mv src tsconfig.json tsconfig.build.json README.md CHANGELOG.md package.json packages/interfaces/
cp LICENSE COPYING packages/interfaces/

cat > tsconfig.base.json <<'EOF'
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["es2022"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "typeRoots": ["./node_modules/@types"],
    "types": ["node"]
  }
}
EOF

cat > packages/interfaces/tsconfig.json <<'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"],
  "references": []
}
EOF
cat > packages/interfaces/tsconfig.build.json <<'EOF'
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "src/__typechecks__"],
  "references": []
}
EOF

node - <<'EOF'
const fs = require('fs');
const p = 'packages/interfaces/package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
const { devDependencies, overrides } = pkg;
delete pkg.devDependencies;
delete pkg.overrides;
pkg.sideEffects = false;
pkg.scripts = {
  clean: 'rm -rf dist tsconfig.tsbuildinfo tsconfig.build.tsbuildinfo',
  build: 'tsc -b tsconfig.build.json',
  'test:check': 'tsc -p tsconfig.json --noEmit',
  prepublishOnly: 'npm run --prefix ../.. check',
};
fs.writeFileSync(p, `${JSON.stringify(pkg, null, 2)}\n`);
const root = {
  name: 'mcp-abap-adt-interfaces-workspace',
  private: true,
  license: 'LGPL-3.0-only',
  workspaces: ['packages/interfaces'],
  scripts: {
    chrono: './tools/version-stats.sh',
    clean: 'npm run clean --workspaces',
    lint: 'biome check --write packages tools',
    'lint:check': 'biome check packages tools',
    format: 'biome format --write packages tools',
    build: 'biome check packages tools --diagnostic-level=error && tsc -b packages/interfaces/tsconfig.build.json',
    'test:check': 'npm run test:check --workspaces',
    'check:surface': 'node tools/check-surface.js --placement all',
    'check:graph': 'node tools/check-graph.js',
    'check:deprecated': 'node tools/check-deprecated.js',
    check: 'npm run build && npm run test:check && npm run check:surface && npm run check:graph && npm run check:deprecated',
  },
  engines: pkg.engines,
  devDependencies,
  overrides,
};
fs.writeFileSync('package.json', `${JSON.stringify(root, null, 2)}\n`);
EOF

rm -f tsconfig.build.tsbuildinfo tsconfig.tsbuildinfo
rm -rf dist
npm install --no-audit --no-fund
SCRIPT
```

- [ ] **Step 7: Format, build and check**

Run:
```bash
npm run lint
npm run build
npm run test:check
node tools/check-surface.js --placement interfaces
node tools/check-graph.js
```
Expected: Biome reports no errors (warnings are pre-existing); `tsc` prints nothing; `surface: 381 symbols match 44.0.0 in name, kind, declaration and value; placement ok (interfaces)`; `graph: every import is allowed and declared`.

- [ ] **Step 8: The contract check catches a changed value and a changed shape** — mutate, watch it fail, restore

Run:
```bash
sed -i "s/export const HEADER_ACCEPT = 'Accept';/export const HEADER_ACCEPT = 'accept';/" packages/interfaces/src/Headers.ts
sed -i 's/^export interface ILogger {$/export interface ILogger {\n  flush?(): void;/' packages/interfaces/src/logging/ILogger.ts
npm run build && node tools/check-surface.js; echo "exit $?"
git checkout packages/interfaces/src/Headers.ts packages/interfaces/src/logging/ILogger.ts
npm run build && node tools/check-surface.js
```
Expected: the mutated build passes and the check fails with exactly
```
declaration changed: HEADER_ACCEPT
value changed: HEADER_ACCEPT
declaration changed: ILogger
3 problem(s)
exit 1
```
and after the restore: `surface: 381 symbols match 44.0.0 in name, kind, declaration and value`.

- [ ] **Step 9: The deprecation check fails on exactly the seven unaccepted symbols** (Task 6 fixes them)

Run: `node tools/check-deprecated.js`
Expected: FAIL, `7 problem(s)`:
```
not deprecated in the facade: ISessionState
not deprecated in the facade: ISessionStorage
not deprecated in the facade: PRESERVED_HEADERS
not deprecated in the facade: PROXY_MODIFIED_HEADERS
not deprecated in the facade: PROXY_ROUTING_HEADERS
not deprecated in the facade: SAP_CONNECTION_HEADERS
not deprecated in the facade: UAA_HEADERS
```

- [ ] **Step 10: Commit**

```bash
git add -A
git status --short | grep -v '^R ' | head -30   # renames under packages/interfaces, the new tools, root files
git commit -m "build: make the repository an npm workspace holding @mcp-abap-adt/interfaces

The package moves unchanged to packages/interfaces. tools/ gains the checks
the split is held to: the facade surface equals 44.0.0, symbols sit in their
assigned package, imports follow the spec's graph, and facade symbols are
deprecated. tools/package-map.json and tools/surface-44.0.0.txt are generated
from the built 44.0.0 layout before anything moves, and tools/baseline-44.0.0.json
records each declaration and constant value, so a changed contract fails too."
```

---

### Task 2: `@mcp-abap-adt/interfaces-utils`

**Files:**
- Create: `tools/split/move-to-package.js` (one-off; removed in Task 9), `packages/interfaces-utils/{package.json,tsconfig.json,tsconfig.build.json,LICENSE,COPYING,src/index.ts}`
- Move: `packages/interfaces/src/logging/ILogger.ts`, `logging/LogLevel.ts` → `packages/interfaces-utils/src/logging/`
- Modify: `packages/interfaces/src/index.ts`, `packages/interfaces/src/auth/IAuthorizationStrategy.ts`, `auth/ICallbackServer.ts`, `token/ITokenProviderOptions.ts`, `__typechecks__/authorizationStrategy.ts` (import specifier only), `packages/interfaces/{package.json,tsconfig.json,tsconfig.build.json}`, root `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: `tools/package-map.json`, `tools/lib/exports.js` (Task 1).
- Produces: package `@mcp-abap-adt/interfaces-utils@1.0.0` exporting `ILogger` (type), `LogLevel` (enum); `node tools/split/move-to-package.js <interfaces-utils|interfaces-network|interfaces-auth|interfaces-adt>` used by Tasks 3–5.

- [ ] **Step 1: The placement check fails for this package**

Run: `node tools/check-surface.js --placement interfaces-utils`
Expected: FAIL, `2 problem(s)`: `ILogger: declared in interfaces, belongs to interfaces-utils` and the same for `LogLevel`.

- [ ] **Step 2: Create the move script**

`tools/split/move-to-package.js`:

```js
// Moves the files spec §3 assigns to one new package out of packages/interfaces,
// creates that package, and leaves a deprecated re-export in the facade.
//   node tools/split/move-to-package.js <interfaces-utils|interfaces-network|interfaces-auth|interfaces-adt>
// Run the packages in that order (spec §5.1). Afterwards: npm install && npm run lint.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const { ROOT } = require('../lib/exports');

const ORDER = [
  'interfaces-utils',
  'interfaces-network',
  'interfaces-auth',
  'interfaces-adt',
];
const DEPS = {
  'interfaces-utils': [],
  'interfaces-network': [],
  'interfaces-auth': [],
  'interfaces-adt': ['interfaces-auth', 'interfaces-utils'],
};
const DESCRIPTION = {
  'interfaces-utils': 'Logging contracts for MCP ABAP ADT packages',
  'interfaces-network':
    'Transport contracts, generic HTTP and MCP header names and network error codes for MCP ABAP ADT packages',
  'interfaces-auth':
    'Credential and access contracts shared across MCP ABAP ADT package families',
  'interfaces-adt':
    'ADT contracts, the ABAP and Cloud ALM connections, and SAP/BTP configuration and authentication contracts',
};
const SPLIT_FILES = new Set([
  'Headers.ts',
  'auth/ICertificateMaterialLoader.ts',
]);
/** Where a symbol of a split file lives inside its new package. */
const MODULE_OVERRIDE = { ICertificateMaterial: './auth/ICertificateMaterial' };

const target = process.argv[2];
if (!ORDER.includes(target)) {
  console.error(`usage: move-to-package.js <${ORDER.join('|')}>`);
  process.exit(2);
}
for (const earlier of ORDER.slice(0, ORDER.indexOf(target)))
  if (!fs.existsSync(path.join(ROOT, 'packages', earlier, 'package.json')))
    throw new Error(`${earlier} must be moved before ${target}`);

const symbolMap = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tools', 'package-map.json'), 'utf8'),
);
const FACADE = path.join(ROOT, 'packages', 'interfaces');
const FACADE_SRC = path.join(FACADE, 'src');
const TARGET = path.join(ROOT, 'packages', target);
const TARGET_SRC = path.join(TARGET, 'src');
const exists = (pkg) =>
  pkg === 'interfaces' ||
  fs.existsSync(path.join(ROOT, 'packages', pkg, 'package.json'));

/** Spec §3 file rule, for files that are not split. */
function fileRule(rel) {
  if (rel.startsWith('logging/')) return 'interfaces-utils';
  if (
    [
      'connection/IWebSocketTransport.ts',
      'connection/NetworkErrors.ts',
      'utils/ITimeoutConfig.ts',
    ].includes(rel)
  )
    return 'interfaces-network';
  if (rel === 'auth/IAuthProvider.ts' || rel === 'auth/ICertificateMaterial.ts')
    return 'interfaces-auth';
  if (rel.startsWith('storage/') || rel === 'token/ITokenProviderResult.ts')
    return 'interfaces';
  if (rel === 'Headers.ts') return 'interfaces';
  return 'interfaces-adt';
}
/** Where a relative file lives now: the package it was assigned to, if that package exists yet. */
const homeOfFile = (rel) =>
  exists(fileRule(rel)) ? fileRule(rel) : 'interfaces';
const homeOfSymbol = (name, rel) => {
  const pkg = symbolMap[name] ?? fileRule(rel);
  return exists(pkg) ? pkg : 'interfaces';
};

function tsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const f = path.join(dir, e.name);
    return e.isDirectory() ? tsFiles(f) : f.endsWith('.ts') ? [f] : [];
  });
}
const git = (...args) =>
  execFileSync('git', args, { cwd: ROOT, stdio: 'inherit' });
const read = (f) => fs.readFileSync(f, 'utf8');
const write = (f, text) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
};
const parse = (f, text) =>
  ts.createSourceFile(f, text, ts.ScriptTarget.ES2022, true);
const declaredNames = (statement) => {
  if (ts.isVariableStatement(statement))
    return statement.declarationList.declarations.map((d) => d.name.getText());
  return statement.name ? [statement.name.getText()] : [];
};

// 1. The package skeleton.
const facadeManifest = JSON.parse(read(path.join(FACADE, 'package.json')));
const manifest = {
  name: `@mcp-abap-adt/${target}`,
  version: '1.0.0',
  description: DESCRIPTION[target],
  main: 'dist/index.js',
  types: 'dist/index.d.ts',
  files: ['dist', 'README.md', 'CHANGELOG.md', 'LICENSE', 'COPYING'],
  sideEffects: false,
  author: facadeManifest.author,
  license: facadeManifest.license,
  homepage: `https://github.com/fr0ster/mcp-abap-adt-interfaces/tree/master/packages/${target}#readme`,
  bugs: facadeManifest.bugs,
  repository: { ...facadeManifest.repository, directory: `packages/${target}` },
  publishConfig: { access: 'public' },
  scripts: facadeManifest.scripts,
  engines: facadeManifest.engines,
  ...(DEPS[target].length
    ? {
        dependencies: Object.fromEntries(
          DEPS[target].map((d) => [`@mcp-abap-adt/${d}`, '^1.0.0']),
        ),
      }
    : {}),
};
write(
  path.join(TARGET, 'package.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
const references = DEPS[target].map((d) => ({
  path: `../${d}/tsconfig.build.json`,
}));
write(
  path.join(TARGET, 'tsconfig.json'),
  `${JSON.stringify({ extends: '../../tsconfig.base.json', compilerOptions: { outDir: './dist', rootDir: './src' }, include: ['src/**/*'], exclude: ['node_modules', 'dist'], references }, null, 2)}\n`,
);
write(
  path.join(TARGET, 'tsconfig.build.json'),
  `${JSON.stringify({ extends: './tsconfig.json', exclude: ['node_modules', 'dist', 'src/__typechecks__'], references }, null, 2)}\n`,
);
for (const f of ['LICENSE', 'COPYING'])
  fs.copyFileSync(path.join(ROOT, f), path.join(TARGET, f));

// 2. Split files: carve out the statements that belong to the target.
/**
 * A statement's text with the comments that belong to it: its leading JSDoc,
 * and its own end-of-line comment — not the previous line's end-of-line comment,
 * which the parser counts as this statement's leading trivia.
 */
function statementText(text, st) {
  let start = st.getFullStart();
  const firstBreak = text.indexOf('\n', start);
  if (
    firstBreak !== -1 &&
    firstBreak < st.getStart() &&
    /^[ \t]*\/\/.*$/.test(text.slice(start, firstBreak))
  )
    start = firstBreak + 1;
  let end = st.getEnd();
  const lineEnd = text.indexOf('\n', end);
  const rest = text.slice(end, lineEnd === -1 ? text.length : lineEnd);
  if (/^[ \t]*\/\/.*$/.test(rest)) end = lineEnd === -1 ? text.length : lineEnd;
  return text.slice(start, end).replace(/^\n+/, '');
}
function carve(rel, newRel) {
  const file = path.join(FACADE_SRC, rel);
  if (!fs.existsSync(file)) return;
  const text = read(file);
  const source = parse(file, text);
  const moved = [];
  const kept = [];
  for (const st of source.statements) {
    const names = declaredNames(st);
    (names.length && names.every((n) => symbolMap[n] === target)
      ? moved
      : kept
    ).push(st);
  }
  if (!moved.length) return [];
  const movedNames = moved.flatMap(declaredNames);
  const keptText = kept.map((s) => statementText(text, s)).join('\n');
  const usedByKept = movedNames.filter((n) =>
    new RegExp(`\\b${n}\\b`).test(keptText),
  );
  const isType = (n) =>
    moved.some(
      (s) => declaredNames(s).includes(n) && !ts.isVariableStatement(s),
    );
  const typeNames = usedByKept.filter(isType);
  const valueNames = usedByKept.filter((n) => !isType(n));
  const header = [
    typeNames.length
      ? `import type { ${typeNames.join(', ')} } from '@mcp-abap-adt/${target}';`
      : '',
    valueNames.length
      ? `import { ${valueNames.join(', ')} } from '@mcp-abap-adt/${target}';`
      : '',
  ].filter(Boolean);
  write(
    file,
    `${header.join('\n')}${header.length ? '\n\n' : ''}${keptText}\n`,
  );
  const newFile = path.join(TARGET_SRC, newRel);
  const previous = fs.existsSync(newFile) ? `${read(newFile)}\n` : '';
  write(
    newFile,
    `${previous}${moved.map((s) => statementText(text, s)).join('\n')}\n`,
  );
  return movedNames;
}
const carvedHeaders = carve('Headers.ts', 'Headers.ts') ?? [];
// The loader half follows its whole file into interfaces-adt in step 3.
if (target === 'interfaces-auth')
  carve('auth/ICertificateMaterialLoader.ts', 'auth/ICertificateMaterial.ts');

// 3. Whole files and the typechecks that exercise them.
const moves = new Map(); // old absolute path -> new absolute path
for (const file of tsFiles(FACADE_SRC)) {
  const rel = path.relative(FACADE_SRC, file);
  if (
    rel === 'index.ts' ||
    rel.startsWith('__typechecks__/') ||
    SPLIT_FILES.has(rel)
  )
    continue;
  if (fileRule(rel) === target) moves.set(file, path.join(TARGET_SRC, rel));
}
if (target === 'interfaces-adt')
  moves.set(
    path.join(FACADE_SRC, 'auth/ICertificateMaterialLoader.ts'),
    path.join(TARGET_SRC, 'auth/ICertificateMaterialLoader.ts'),
  );
const RANK = [
  'interfaces',
  'interfaces-utils',
  'interfaces-network',
  'interfaces-auth',
  'interfaces-adt',
];
for (const file of tsFiles(path.join(FACADE_SRC, '__typechecks__'))) {
  const text = read(file);
  // A typecheck goes to the highest-ranked package among what it imports; for a
  // split file, the imported names decide.
  let home = 'interfaces-utils';
  const raise = (pkg) => {
    if (RANK.indexOf(pkg) > RANK.indexOf(home)) home = pkg;
  };
  for (const m of text.matchAll(
    /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+'\.\.\/([^']+)'/g,
  )) {
    const names = m[1]
      .split(',')
      .map((n) => n.trim().split(/\s+as\s+/)[0])
      .filter(Boolean);
    const rel = `${m[2]}.ts`;
    if (m[2] === 'index') for (const n of names) raise(symbolMap[n]);
    else if (SPLIT_FILES.has(rel)) for (const n of names) raise(symbolMap[n]);
    else raise(fileRule(rel));
  }
  if (home === target)
    moves.set(file, path.join(TARGET_SRC, path.relative(FACADE_SRC, file)));
}
for (const [from, to] of moves) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  git('mv', from, to);
}

// 4. Imports: a relative import that now crosses a package boundary becomes a package import.
const PACKAGE_DIRS = fs.readdirSync(path.join(ROOT, 'packages'));
for (const dir of PACKAGE_DIRS) {
  for (const file of tsFiles(path.join(ROOT, 'packages', dir, 'src'))) {
    if (
      path.basename(file) === 'index.ts' &&
      path.dirname(file).endsWith('src')
    )
      continue;
    const src = path.join(ROOT, 'packages', dir, 'src');
    const text = read(file);
    const source = parse(file, text);
    const edits = [];
    for (const st of source.statements) {
      if (
        !ts.isImportDeclaration(st) ||
        !st.moduleSpecifier.text.startsWith('.')
      )
        continue;
      const spec = st.moduleSpecifier.text;
      const rel = path.relative(src, path.resolve(path.dirname(file), spec));
      if (rel === 'index') continue;
      const relFile = `${rel}.ts`;
      const bindings = st.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) continue;
      const typeOnly = st.importClause.isTypeOnly;
      const groups = new Map();
      for (const el of bindings.elements) {
        const name = (el.propertyName ?? el.name).text;
        const home = SPLIT_FILES.has(relFile)
          ? homeOfSymbol(name, relFile)
          : homeOfFile(relFile);
        const key =
          home === dir
            ? MODULE_OVERRIDE[name] && home === symbolMap[name]
              ? MODULE_OVERRIDE[name]
              : null
            : home;
        const list = groups.get(key) ?? [];
        list.push(el.getText());
        groups.set(key, list);
      }
      const lines = [...groups].map(([key, els]) => {
        let module;
        if (key === null) module = spec;
        else if (key.startsWith('./'))
          module = path
            .relative(path.dirname(path.relative(src, file)), key.slice(2))
            .replace(/^(?!\.)/, './');
        else module = `@mcp-abap-adt/${key}`;
        return `import${typeOnly ? ' type' : ''} { ${els.join(', ')} } from '${module}';`;
      });
      edits.push([st.getStart(), st.getEnd(), lines.join('\n')]);
    }
    if (!edits.length) continue;
    let out = text;
    for (const [start, end, replacement] of edits.reverse())
      out = out.slice(0, start) + replacement + out.slice(end);
    if (out !== text) write(file, out);
  }
}

// 5. Index files: the target's statements move; the facade re-exports them, deprecated.
const facadeIndex = path.join(FACADE_SRC, 'index.ts');
const indexText = read(facadeIndex);
const indexSource = parse(facadeIndex, indexText);
const keep = [];
const targetIndex = [];
const reexports = { type: [], value: [] };
for (const st of indexSource.statements) {
  if (!ts.isExportDeclaration(st) || !st.moduleSpecifier) {
    keep.push(st.getFullText());
    continue;
  }
  const module = st.moduleSpecifier.text;
  if (!st.exportClause) {
    // `export * from './Headers'`: the carved names leave with explicit re-exports.
    if (module === './Headers')
      for (const name of carvedHeaders) {
        const isType = name === 'AuthType';
        (isType ? reexports.type : reexports.value).push(name);
        targetIndex.push(
          `export ${isType ? 'type ' : ''}{ ${name} } from './Headers';`,
        );
      }
    keep.push(st.getFullText());
    continue;
  }
  const moving = [];
  const staying = [];
  for (const el of st.exportClause.elements)
    (symbolMap[el.name.text] === target ? moving : staying).push(el);
  if (!moving.length) {
    keep.push(st.getFullText());
    continue;
  }
  const typeOnly = st.isTypeOnly;
  const byModule = new Map();
  for (const el of moving) {
    const m = MODULE_OVERRIDE[el.name.text] ?? module;
    byModule.set(m, [...(byModule.get(m) ?? []), el.getText()]);
    (typeOnly || el.isTypeOnly ? reexports.type : reexports.value).push(
      el.name.text,
    );
  }
  for (const [m, els] of byModule)
    targetIndex.push(
      `export ${typeOnly ? 'type ' : ''}{ ${els.join(', ')} } from '${m}';`,
    );
  if (staying.length)
    keep.push(
      `\nexport ${typeOnly ? 'type ' : ''}{ ${staying.map((e) => e.getText()).join(', ')} } from '${module}';`,
    );
}
const deprecated = (names) =>
  names
    .sort()
    .map(
      (n) =>
        `  /** @deprecated Import from @mcp-abap-adt/${target} */\n  ${n},`,
    )
    .join('\n');
const facadeBlock = [
  reexports.type.length
    ? `export type {\n${deprecated(reexports.type)}\n} from '@mcp-abap-adt/${target}';`
    : '',
  reexports.value.length
    ? `export {\n${deprecated(reexports.value)}\n} from '@mcp-abap-adt/${target}';`
    : '',
].filter(Boolean);
write(facadeIndex, `${keep.join('').trimEnd()}\n\n${facadeBlock.join('\n')}\n`);
const previousTarget = fs.existsSync(path.join(TARGET_SRC, 'index.ts'))
  ? read(path.join(TARGET_SRC, 'index.ts'))
  : '';
write(
  path.join(TARGET_SRC, 'index.ts'),
  `${previousTarget || `/**\n * @mcp-abap-adt/${target}\n *\n * ${DESCRIPTION[target]}.\n */\n\n`}${targetIndex.join('\n')}\n`,
);

// 6. The facade and the workspace now know the package.
facadeManifest.dependencies = {
  ...(facadeManifest.dependencies ?? {}),
  [manifest.name]: '^1.0.0',
};
write(
  path.join(FACADE, 'package.json'),
  `${JSON.stringify(facadeManifest, null, 2)}\n`,
);
for (const config of ['tsconfig.json', 'tsconfig.build.json']) {
  const p = path.join(FACADE, config);
  const json = JSON.parse(read(p));
  json.references = [
    ...(json.references ?? []),
    { path: `../${target}/tsconfig.build.json` },
  ];
  write(p, `${JSON.stringify(json, null, 2)}\n`);
}
const rootManifest = JSON.parse(read(path.join(ROOT, 'package.json')));
rootManifest.workspaces = [
  ...ORDER.filter((p) => exists(p)).map((p) => `packages/${p}`),
  'packages/interfaces',
];
write(
  path.join(ROOT, 'package.json'),
  `${JSON.stringify(rootManifest, null, 2)}\n`,
);
console.log(
  `${target}: moved ${moves.size} files, ${reexports.type.length + reexports.value.length} symbols`,
);
```

What it does, in order: (1) writes the package skeleton — `package.json` at `1.0.0` with the facade's scripts, author, licence and engines, `tsconfig.json`/`tsconfig.build.json` referencing its sibling dependencies, `LICENSE`, `COPYING`; (2) carves `Headers.ts` (network, adt) and `auth/ICertificateMaterialLoader.ts` (auth only) by declared name; (3) `git mv`s whole files by the spec's file rule and the typechecks whose imports rank highest in this package; (4) rewrites relative imports that now cross a package into `@mcp-abap-adt/<package>` imports; (5) moves the matching `index.ts` statements to the new package and replaces them in the facade with one `export type { … }` and one `export { … }` block of per-symbol `@deprecated` re-exports; (6) adds the dependency and the project reference to the facade and the workspace entry to the root.

- [ ] **Step 3: Move**

Run:
```bash
node tools/split/move-to-package.js interfaces-utils
npm install --no-audit --no-fund
npm run lint
```
Expected first line: `interfaces-utils: moved 2 files, 2 symbols`.

- [ ] **Step 4: Look at what it produced**

Run: `cat packages/interfaces-utils/src/index.ts && grep -rn "interfaces-utils" packages/interfaces/src --include='*.ts' | grep import`

Expected:
```ts
/**
 * @mcp-abap-adt/interfaces-utils
 *
 * Logging contracts for MCP ABAP ADT packages.
 */

export type { ILogger } from './logging/ILogger';
export { LogLevel } from './logging/LogLevel';
```
and four facade files importing `ILogger` from `'@mcp-abap-adt/interfaces-utils'`: `token/ITokenProviderOptions.ts`, `auth/IAuthorizationStrategy.ts`, `auth/ICallbackServer.ts`, `__typechecks__/authorizationStrategy.ts`.

- [ ] **Step 5: Build and check**

Run:
```bash
npm run build
npm run test:check
node tools/check-surface.js --placement interfaces-utils
node tools/check-graph.js
node tools/check-deprecated.js
```
Expected: no build or type errors; `surface: 381 symbols match 44.0.0 in name, kind, declaration and value; placement ok (interfaces-utils)`; `graph: every import is allowed and declared`; the deprecation check still fails on exactly the 7 names of Task 1 Step 9 and nothing else.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(interfaces-utils): move the logging contracts into their own package

ILogger and LogLevel move unchanged to @mcp-abap-adt/interfaces-utils; the
facade re-exports both, deprecated."
```

---

### Task 3: `@mcp-abap-adt/interfaces-network`

**Files:**
- Create: `packages/interfaces-network/{package.json,tsconfig.json,tsconfig.build.json,LICENSE,COPYING,src/index.ts,src/Headers.ts}`
- Move: `connection/IWebSocketTransport.ts`, `connection/NetworkErrors.ts`, `utils/ITimeoutConfig.ts` → `packages/interfaces-network/src/` (same relative paths)
- Modify: `packages/interfaces/src/Headers.ts` (loses the six generic names, imports `HEADER_AUTHORIZATION`), `packages/interfaces/src/index.ts`, `packages/interfaces/{package.json,tsconfig.json,tsconfig.build.json}`, root `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: `tools/split/move-to-package.js` (Task 2).
- Produces: `@mcp-abap-adt/interfaces-network@1.0.0` exporting `IWebSocketTransport`, `IWebSocketCloseInfo`, `IWebSocketConnectOptions`, `IWebSocketMessageEnvelope`, `IWebSocketMessageHandler`, `NetworkErrorCode`, `NETWORK_ERROR_CODES`, `ITimeoutConfig`, `HEADER_AUTHORIZATION`, `HEADER_CONTENT_TYPE`, `HEADER_ACCEPT`, `HEADER_SESSION_ID`, `HEADER_MCP_SESSION_ID`, `HEADER_X_MCP_SESSION_ID`.

- [ ] **Step 1: The placement check fails for this package**

Run: `node tools/check-surface.js --placement interfaces-network`
Expected: FAIL, `14 problem(s)`, each `…: declared in interfaces, belongs to interfaces-network`.

- [ ] **Step 2: Move**

Run:
```bash
node tools/split/move-to-package.js interfaces-network
npm install --no-audit --no-fund
npm run lint
```
Expected first line: `interfaces-network: moved 3 files, 14 symbols`.

- [ ] **Step 3: Look at the carved headers**

Run: `cat packages/interfaces-network/src/Headers.ts && grep -n "interfaces-network" packages/interfaces/src/Headers.ts`

Expected: the network file holds exactly the "Session ID Headers" block (`HEADER_SESSION_ID`, `HEADER_MCP_SESSION_ID`, `HEADER_X_MCP_SESSION_ID`) and the "Standard HTTP Headers" block (`HEADER_AUTHORIZATION`, `HEADER_CONTENT_TYPE`, `HEADER_ACCEPT`), with their JSDoc and no stray `// Alternative name` comment; the facade `Headers.ts` has `import { HEADER_AUTHORIZATION } from '@mcp-abap-adt/interfaces-network';` (used by `PROXY_MODIFIED_HEADERS`).

- [ ] **Step 4: Build and check**

Run:
```bash
npm run build
npm run test:check
node tools/check-surface.js --placement interfaces-network
node tools/check-graph.js
node tools/check-deprecated.js
```
Expected: as Task 2 Step 5, with `placement ok (interfaces-network)`; the deprecation check fails on the same 7 names only.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(interfaces-network): move transport contracts and generic header names

IWebSocketTransport, NETWORK_ERROR_CODES, ITimeoutConfig and the six generic
header names move unchanged to @mcp-abap-adt/interfaces-network. Headers.ts is
split: the facade keeps what is not generic and imports HEADER_AUTHORIZATION
for PROXY_MODIFIED_HEADERS."
```

---

### Task 4: `@mcp-abap-adt/interfaces-auth`

**Files:**
- Create: `packages/interfaces-auth/{package.json,tsconfig.json,tsconfig.build.json,LICENSE,COPYING,src/index.ts,src/auth/ICertificateMaterial.ts}`
- Move: `auth/IAuthProvider.ts`, `__typechecks__/authProvider.ts` → `packages/interfaces-auth/src/`
- Modify: `packages/interfaces/src/auth/ICertificateMaterialLoader.ts` (keeps only the loader, imports `ICertificateMaterial`), `packages/interfaces-auth/src/auth/IAuthProvider.ts` and `__typechecks__/authProvider.ts` (import `./ICertificateMaterial` / `../auth/ICertificateMaterial`), `packages/interfaces/src/index.ts`, facade `package.json`/tsconfigs, root `package.json`, `package-lock.json`

**Interfaces:**
- Produces: `@mcp-abap-adt/interfaces-auth@1.0.0` exporting `IAuthProvider`, `IRenewableCredential`, `ICertificateMaterial` (all types). No dependencies.

- [ ] **Step 1: The placement check fails for this package**

Run: `node tools/check-surface.js --placement interfaces-auth`
Expected: FAIL, `3 problem(s)` (`IAuthProvider`, `IRenewableCredential`, `ICertificateMaterial`).

- [ ] **Step 2: Move**

Run:
```bash
node tools/split/move-to-package.js interfaces-auth
npm install --no-audit --no-fund
npm run lint
```
Expected first line: `interfaces-auth: moved 2 files, 3 symbols`.

- [ ] **Step 3: Look at the split**

Run: `cat packages/interfaces-auth/src/index.ts packages/interfaces-auth/src/auth/ICertificateMaterial.ts && head -3 packages/interfaces/src/auth/ICertificateMaterialLoader.ts && ls packages/interfaces-auth/src/__typechecks__`

Expected: the index exports `IAuthProvider, IRenewableCredential` from `./auth/IAuthProvider` and `ICertificateMaterial` from `./auth/ICertificateMaterial`; `ICertificateMaterial.ts` holds only that interface (it uses Node's `Buffer`); the facade loader file starts with `import type { ICertificateMaterial } from '@mcp-abap-adt/interfaces-auth';`; `authProvider.ts` is the only typecheck here.

- [ ] **Step 4: Build and check**

Run:
```bash
npm run build
npm run test:check
node tools/check-surface.js --placement interfaces-auth
node tools/check-graph.js
node tools/check-deprecated.js
```
Expected: as Task 2 Step 5, with `placement ok (interfaces-auth)`; deprecation fails on the same 7 names only.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(interfaces-auth): move IAuthProvider and certificate material into their own package

IAuthProvider, IRenewableCredential and ICertificateMaterial move unchanged to
@mcp-abap-adt/interfaces-auth. auth/ICertificateMaterialLoader.ts is split:
the SAP-specific loader stays behind for interfaces-adt and imports the
material shape, so interfaces-auth depends on nothing."
```

---

### Task 5: `@mcp-abap-adt/interfaces-adt`

**Files:**
- Create: `packages/interfaces-adt/{package.json,tsconfig.json,tsconfig.build.json,LICENSE,COPYING,src/index.ts,src/Headers.ts}`
- Move (107 files, same relative paths): `adt/`, `runtime/`, `execution/`, `feeds/`, `service/`, `shared/`, `sap/`, `session/`, `serviceKey/`, `store/`, `validation/`, `token/` except `ITokenProviderResult.ts`, `auth/AuthType.ts`, `auth/IAuthorizationConfig.ts`, `auth/IAuthorizationStrategy.ts`, `auth/ICallbackServer.ts`, `auth/ICertificateMaterialLoader.ts`, `auth/IConfig.ts`, `auth/IConnectionConfig.ts`, `connection/CalmService.ts`, `connection/IAbapConnection.ts`, `connection/IAbapRequestOptions.ts`, `connection/ICalmConnection.ts`, `connection/ICalmRequestOptions.ts`, `connection/IConnectionCapabilities.ts`, `utils/ITokenRefreshResult.ts`, and the 22 remaining `__typechecks__/*.ts`
- Modify: `packages/interfaces/src/Headers.ts` (only the five groups remain, importing their members), `packages/interfaces/src/token/ITokenProviderResult.ts` (imports `IConnectionConfig` from `@mcp-abap-adt/interfaces-adt`), `packages/interfaces/src/index.ts`, facade `package.json`/tsconfigs, root `package.json`, `package-lock.json`

**Interfaces:**
- Produces: `@mcp-abap-adt/interfaces-adt@1.0.0` exporting the 355 symbols mapped to it, depending on `@mcp-abap-adt/interfaces-auth` and `@mcp-abap-adt/interfaces-utils` `^1.0.0`.

- [ ] **Step 1: The placement check fails for this package**

Run: `node tools/check-surface.js --placement interfaces-adt 2>&1 | tail -1`
Expected: FAIL, `355 problem(s)`.

- [ ] **Step 2: Move**

Run:
```bash
node tools/split/move-to-package.js interfaces-adt
npm install --no-audit --no-fund
npm run lint
```
Expected first line: `interfaces-adt: moved 107 files, 355 symbols`.

- [ ] **Step 3: Look at what is left in the facade**

Run: `find packages/interfaces/src -name '*.ts' | sort && ls packages/interfaces-adt/src/__typechecks__ | wc -l && grep -n "^import" packages/interfaces/src/Headers.ts packages/interfaces/src/token/ITokenProviderResult.ts`

Expected:
```
packages/interfaces/src/Headers.ts
packages/interfaces/src/index.ts
packages/interfaces/src/storage/ISessionState.ts
packages/interfaces/src/storage/ISessionStorage.ts
packages/interfaces/src/token/ITokenProviderResult.ts
22
```
and imports of the group members from `@mcp-abap-adt/interfaces-adt` and `@mcp-abap-adt/interfaces-network` in `Headers.ts`, `IConnectionConfig` from `@mcp-abap-adt/interfaces-adt` in `ITokenProviderResult.ts`. `packages/interfaces-adt/src/Headers.ts` keeps each `// Alternative name` comment on its own `HEADER_UAA_*` line.

- [ ] **Step 4: Build and check everything**

Run:
```bash
npm run build
npm run test:check
node tools/check-surface.js --placement all
node tools/check-graph.js
node tools/check-deprecated.js
```
Expected: no errors; `surface: 381 symbols match 44.0.0 in name, kind, declaration and value; placement ok (all)`; graph ok; deprecation fails on the same 7 names only.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(interfaces-adt): move ADT, ABAP and Cloud ALM connection and SAP/BTP contracts

355 symbols move unchanged to @mcp-abap-adt/interfaces-adt, which depends on
interfaces-auth and interfaces-utils only. auth/AuthType.ts moves with
validation/IValidatedAuthConfig, which composes it. The facade keeps the five
header groups, the storage contracts and ITokenProviderResult."
```

---

### Task 6: The facade — deprecate what no package imports

**Files:**
- Create: `tools/split/deprecate-unaccepted.js` (one-off; removed in Task 9)
- Modify: `packages/interfaces/src/Headers.ts`, `packages/interfaces/src/storage/ISessionState.ts`, `packages/interfaces/src/storage/ISessionStorage.ts` (JSDoc only)

**Interfaces:**
- Produces: `npm run check` passes end to end.

- [ ] **Step 1: The deprecation check fails on the seven**

Run: `node tools/check-deprecated.js`
Expected: FAIL, `7 problem(s)` — the list of Task 1 Step 9.

- [ ] **Step 2: Create the marker script**

`tools/split/deprecate-unaccepted.js`:

```js
// Spec §3.5: what no package imports stays in @mcp-abap-adt/interfaces, marked
// deprecated, until the facade's next major removes it.
//   node tools/split/deprecate-unaccepted.js
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('../lib/exports');

const NOTE =
  'No package imports this; it is removed in the next major of `@mcp-abap-adt/interfaces`.';
const SRC = path.join(ROOT, 'packages', 'interfaces', 'src');
const TARGETS = {
  'Headers.ts': [
    'PROXY_ROUTING_HEADERS',
    'SAP_CONNECTION_HEADERS',
    'UAA_HEADERS',
    'PRESERVED_HEADERS',
    'PROXY_MODIFIED_HEADERS',
  ],
  'storage/ISessionState.ts': ['ISessionState'],
  'storage/ISessionStorage.ts': ['ISessionStorage'],
};

for (const [rel, names] of Object.entries(TARGETS)) {
  const file = path.join(SRC, rel);
  let text = fs.readFileSync(file, 'utf8');
  for (const name of names) {
    // The declaration, with the JSDoc block directly above it if there is one.
    const declaration = new RegExp(
      `(\\n)((?:/\\*\\*(?:(?!\\*/)[\\s\\S])*?\\*/\\n)?)(export (?:const|interface|type) ${name}\\b)`,
    );
    const match = text.match(declaration);
    if (!match) throw new Error(`${name} not found in ${rel}`);
    if (match[2].includes('@deprecated')) continue;
    const doc = match[2]
      ? match[2].replace(/\n?\s*\*\/\n$/, `\n *\n * @deprecated ${NOTE}\n */\n`)
      : `/** @deprecated ${NOTE} */\n`;
    text = text.replace(declaration, `$1${doc}$3`);
  }
  fs.writeFileSync(file, text);
  console.log(`${rel}: ${names.join(', ')}`);
}
```

- [ ] **Step 3: Mark them**

Run:
```bash
node tools/split/deprecate-unaccepted.js
npm run lint
sed -n 1,8p packages/interfaces/src/storage/ISessionState.ts
```
Expected: three lines naming the files and symbols; `ISessionState` now has a one-line `/** @deprecated … */` JSDoc carrying the `NOTE` text directly above it, and each header group's existing JSDoc ends with the same `@deprecated` tag.

- [ ] **Step 4: Everything passes**

Run: `npm run check`
Expected, at the end:
```
surface: 381 symbols match 44.0.0 in name, kind, declaration and value; placement ok (all)
graph: every import is allowed and declared
deprecated: all 381 checked symbols are reported deprecated
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(interfaces): deprecate the contracts no package imports

The five header groups, ISessionState and ISessionStorage stay in the facade
(spec §3.5) and now say they go with its next major. Every symbol the facade
exports is reported deprecated."
```

---

### Task 7: The published-artifact check

**Files:**
- Create: `tools/check-packed.js`
- Modify: root `package.json` (scripts `check:packed`, `check`)

**Interfaces:**
- Produces: `npm run check:packed`; `npm run check` now ends with it, so every package's `prepublishOnly` (`npm run --prefix ../.. check`) runs it before a publish.
- The consumer gets `@types/node` at the root's range (the contracts name `Buffer`) and type-checks the published `.d.ts` files with `skipLibCheck: false`; without that, a declaration needing Node's types would pass unnoticed.
- The symbols it checks come from `tools/surface-44.0.0.txt` and `tools/package-map.json`, both generated from 44.0.0 in Task 1 rather than written by hand, so a symbol the facade stops exporting fails here as well (spec §6).

- [ ] **Step 1: Create the check**

`tools/check-packed.js`:

```js
// Spec §6: what a consumer installs from npm, not what the workspace links.
// Packs every package, installs the tarballs into a fresh project outside the
// repository, and checks there that the migration guarantee of spec §5.2 holds
// and that the published contract is the 44.0.0 one.
//   npm run build && node tools/check-packed.js
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const {
  ROOT,
  COMPILER_OPTIONS,
  normalizedDeclaration,
  readBaseline,
} = require('./lib/exports');

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
const problems = [];
const map = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tools', 'package-map.json'), 'utf8'),
);
const surface = fs
  .readFileSync(path.join(ROOT, 'tools', 'surface-44.0.0.txt'), 'utf8')
  .trim()
  .split('\n')
  .map((l) => l.split(' '));
const baseline = readBaseline();
const rootManifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
);

// 1. Pack.
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'interfaces-packed-'));
const tarballs = path.join(work, 'tarballs');
fs.mkdirSync(tarballs);
const dirs = fs
  .readdirSync(path.join(ROOT, 'packages'))
  .filter((d) => fs.existsSync(path.join(ROOT, 'packages', d, 'package.json')));
for (const dir of dirs)
  run(
    'npm',
    ['pack', '--pack-destination', tarballs, '--silent'],
    path.join(ROOT, 'packages', dir),
  );
const files = fs.readdirSync(tarballs).map((f) => path.join(tarballs, f));

// 2. The tarballs themselves: published ranges only, and dist shipped.
for (const tgz of files) {
  const listing = run('tar', ['-tzf', tgz], work);
  if (!listing.includes('package/dist/index.d.ts'))
    problems.push(`${path.basename(tgz)}: no dist/index.d.ts`);
  if (!listing.includes('package/dist/index.js'))
    problems.push(`${path.basename(tgz)}: no dist/index.js`);
  const manifest = JSON.parse(
    run('tar', ['-xzOf', tgz, 'package/package.json'], work),
  );
  for (const [dep, range] of Object.entries(manifest.dependencies ?? {}))
    if (/^(workspace:|file:|link:|\.)/.test(range))
      problems.push(
        `${manifest.name}: ${dep} is "${range}", not a published range`,
      );
}

function finish() {
  fs.rmSync(work, { recursive: true, force: true });
  if (problems.length) {
    console.error(problems.join('\n'));
    console.error(`${problems.length} problem(s)`);
    process.exit(1);
  }
}
// A tarball that names a sibling by path cannot be installed anywhere else.
if (problems.length) finish();

// 3. Install into a clean project, no workspace links. The contracts name
// Node's `Buffer`, so a consumer type-checking them has Node's types.
const consumer = path.join(work, 'consumer');
fs.mkdirSync(consumer);
fs.writeFileSync(
  path.join(consumer, 'package.json'),
  '{ "name": "consumer", "private": true }\n',
);
const nodeTypes = `@types/node@${rootManifest.devDependencies['@types/node']}`;
run(
  'npm',
  [
    'install',
    '--no-audit',
    '--no-fund',
    '--ignore-scripts',
    nodeTypes,
    ...files,
  ],
  consumer,
);
const installed = path.join(consumer, 'node_modules', '@mcp-abap-adt');
for (const name of fs.readdirSync(installed)) {
  const link = fs.lstatSync(path.join(installed, name));
  if (link.isSymbolicLink())
    problems.push(`@mcp-abap-adt/${name} is a symlink, not an installed copy`);
  const nested = path.join(installed, name, 'node_modules', '@mcp-abap-adt');
  if (fs.existsSync(nested))
    problems.push(
      `@mcp-abap-adt/${name} carries its own copy of ${fs.readdirSync(nested)}`,
    );
}

// 4. Types, with the published declarations checked too (no skipLibCheck):
// every moved symbol resolves to one declaration from the facade and from its
// package, and every symbol's declaration is the 44.0.0 one.
const moved = surface.filter(([name]) => map[name] !== 'interfaces');
const source = [
  ...surface.map(
    ([name]) =>
      `import type { ${name} as F_${name} } from '@mcp-abap-adt/interfaces';`,
  ),
  ...moved.map(
    ([name]) =>
      `import type { ${name} as N_${name} } from '@mcp-abap-adt/${map[name]}';`,
  ),
  '',
].join('\n');
const entry = path.join(consumer, 'types.ts');
fs.writeFileSync(entry, source);
const program = ts.createProgram([entry], {
  ...COMPILER_OPTIONS,
  typeRoots: [path.join(consumer, 'node_modules', '@types')],
  types: ['node'],
  skipLibCheck: false,
});
const checker = program.getTypeChecker();
for (const d of ts.getPreEmitDiagnostics(program))
  problems.push(
    `${d.file ? path.relative(consumer, d.file.fileName) : 'program'}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`,
  );
const locals = new Map();
for (const st of program.getSourceFile(entry).statements) {
  for (const el of st.importClause.namedBindings.elements) {
    const alias = checker.getSymbolAtLocation(el.name);
    locals.set(el.name.text, checker.getAliasedSymbol(alias));
  }
}
for (const [name] of surface) {
  const facade = locals.get(`F_${name}`);
  if (!facade) {
    problems.push(`${name}: not exported by the installed facade`);
    continue;
  }
  if (normalizedDeclaration(facade) !== baseline[name].declaration)
    problems.push(`${name}: published declaration differs from 44.0.0`);
  if (map[name] === 'interfaces') continue;
  if (locals.get(`N_${name}`) !== facade)
    problems.push(
      `${name}: the facade and @mcp-abap-adt/${map[name]} resolve to different declarations`,
    );
}

// 5. Runtime: every constant is defined on both paths, is the same object, and
// holds its 44.0.0 value.
const values = surface.filter(([, kind]) => kind === 'value');
const script = `
const facade = require('@mcp-abap-adt/interfaces');
const expected = ${JSON.stringify(Object.fromEntries(values.map(([n]) => [n, { pkg: map[n], value: baseline[n].value }])))};
const out = [];
for (const [name, { pkg, value }] of Object.entries(expected)) {
  const a = facade[name];
  if (a === undefined) { out.push(name + ': undefined on the facade'); continue; }
  if (JSON.stringify(a) !== value) out.push(name + ': published value differs from 44.0.0');
  if (pkg === 'interfaces') continue;
  const b = require('@mcp-abap-adt/' + pkg)[name];
  if (b === undefined) out.push(name + ': undefined on @mcp-abap-adt/' + pkg);
  else if (a !== b) out.push(name + ': the facade holds a copy, not the same object');
}
console.log(JSON.stringify(out));
`;
fs.writeFileSync(path.join(consumer, 'runtime.js'), script);
problems.push(...JSON.parse(run('node', ['runtime.js'], consumer)));

finish();
console.log(
  `packed: ${files.length} tarballs install cleanly; ${surface.length} published declarations and ${values.length} constant values match 44.0.0; ${moved.length} moved symbols are one declaration on both paths`,
);
```

- [ ] **Step 2: Wire it into the root scripts**

Run:
```bash
node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync("package.json", "utf8"));
p.scripts["check:packed"] = "node tools/check-packed.js";
p.scripts.check = `${p.scripts.check} && npm run check:packed`;
fs.writeFileSync("package.json", `${JSON.stringify(p, null, 2)}\n`);
'
grep -n '"check' package.json
```
Expected: `check:packed` present and `check` ending in `&& npm run check:packed`.

- [ ] **Step 3: It catches what the workspace hides** — a sibling linked by path builds fine in the workspace

Run:
```bash
node -e '
const fs = require("fs");
const f = "packages/interfaces/package.json";
const p = JSON.parse(fs.readFileSync(f, "utf8"));
p.dependencies["@mcp-abap-adt/interfaces-adt"] = "file:../interfaces-adt";
fs.writeFileSync(f, `${JSON.stringify(p, null, 2)}\n`);
'
npm run build && node tools/check-packed.js; echo "exit $?"
git checkout packages/interfaces/package.json
```
Expected: the build passes; the check fails with `@mcp-abap-adt/interfaces: @mcp-abap-adt/interfaces-adt is "file:../interfaces-adt", not a published range` and `exit 1`. (Do not run `npm install` while the mutation is in place.)

- [ ] **Step 4: It passes on the real tree**

Run: `npm run build && npm run check:packed`
Expected (it fetches `@types/node` from the npm registry): `packed: 5 tarballs install cleanly; 381 published declarations and 51 constant values match 44.0.0; 374 moved symbols are one declaration on both paths`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: check the packed tarballs, not only the workspace build

Packs every package, installs the tarballs into a clean project outside the
repository, and checks there: sibling ranges are published versions, dist is
shipped, each moved symbol resolves to the same declaration from the facade
and from its package, and each constant is the same object on both paths
(spec §6). Declarations and values are compared with 44.0.0, and the
published .d.ts files are type-checked with Node's types and no skipLibCheck. npm run check, and so every prepublishOnly, now ends with it."
```

---

### Task 8: Package documentation

**Files:**
- Create: `README.md` (workspace), `packages/interfaces-{utils,network,auth,adt}/README.md`, `packages/interfaces-{utils,network,auth,adt}/CHANGELOG.md`
- Modify: `packages/interfaces/README.md` (top section, Installation, Dependencies), `packages/interfaces/CHANGELOG.md` (`[Unreleased]`)

**Interfaces:**
- Consumes: the final export lists (`cat packages/<name>/src/index.ts`).

All documentation is written TL;DR-first, in short sections.

- [ ] **Step 1: Workspace `README.md`**

````markdown
# mcp-abap-adt-interfaces

Contracts for the MCP ABAP ADT packages: types and constants, no implementations.

## TL;DR

- **Install the package whose contracts you accept**, not all of them.
- `@mcp-abap-adt/interfaces` still exports everything, but it is a deprecated facade: each symbol names the package it lives in now.
- No package here depends on an implementation or a runtime package.

| package | holds | depends on |
|---|---|---|
| [`@mcp-abap-adt/interfaces-utils`](packages/interfaces-utils) | logging: `ILogger`, `LogLevel` | nothing |
| [`@mcp-abap-adt/interfaces-network`](packages/interfaces-network) | WebSocket transport, `NETWORK_ERROR_CODES`, `ITimeoutConfig`, generic HTTP and MCP header names | nothing |
| [`@mcp-abap-adt/interfaces-auth`](packages/interfaces-auth) | `IAuthProvider`, `IRenewableCredential`, `ICertificateMaterial` | nothing |
| [`@mcp-abap-adt/interfaces-adt`](packages/interfaces-adt) | ADT contracts, the ABAP and Cloud ALM connections, SAP/BTP configuration and authentication | `interfaces-auth`, `interfaces-utils` |
| [`@mcp-abap-adt/interfaces`](packages/interfaces) | deprecated facade: re-exports the four, plus what no package imports | all four |

## Why five packages

One version line for every contract meant an ADT major bumped a package that only needed `IAuthProvider`. A contract now lives where it is accepted — decision 26 in [`docs/architecture/DECISIONS.md`](docs/architecture/DECISIONS.md); the design is in [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

## Working in this repository

```bash
npm ci
npm run check      # build, type checks, surface, graph, deprecations, packed tarballs
```

There is no CI; `npm run check` is what holds, and every package's `prepublishOnly` runs it. Packages are published in dependency order: `interfaces-utils`, `interfaces-network`, `interfaces-auth`, then `interfaces-adt`, then `interfaces`.

## Licence

**GNU Lesser General Public License v3.0 only** (`LGPL-3.0-only`) for every package. See [`LICENSE`](LICENSE) and [`COPYING`](COPYING).
````

- [ ] **Step 2: One README per new package**

`packages/interfaces-utils/README.md`:

````markdown
# @mcp-abap-adt/interfaces-utils

Logging contracts for the MCP ABAP ADT packages.

## TL;DR

- `ILogger` — what a component logs through. `LogLevel` — the levels.
- Depends on nothing. Types and one enum; no implementation.
- Moved unchanged from `@mcp-abap-adt/interfaces` 44.0.0.

## Install

```bash
npm install @mcp-abap-adt/interfaces-utils
```

## Use

```typescript
import type { ILogger } from '@mcp-abap-adt/interfaces-utils';
import { LogLevel } from '@mcp-abap-adt/interfaces-utils';
```

An implementation (`DefaultLogger`, `PinoLogger`) is in `@mcp-abap-adt/logger`, not here.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade re-exports both symbols, deprecated, until its next major.

## Licence

`LGPL-3.0-only`.
````

`packages/interfaces-network/README.md`:

````markdown
# @mcp-abap-adt/interfaces-network

Transport contracts, generic HTTP and MCP header names and network error codes for the MCP ABAP ADT packages.

## TL;DR

- Nothing here is SAP- or ADT-specific.
- Depends on nothing. Types and string constants; no implementation.
- Moved unchanged from `@mcp-abap-adt/interfaces` 44.0.0.

## Install

```bash
npm install @mcp-abap-adt/interfaces-network
```

## What it holds

| symbols | what |
|---|---|
| `IWebSocketTransport`, `IWebSocketConnectOptions`, `IWebSocketMessageEnvelope`, `IWebSocketMessageHandler`, `IWebSocketCloseInfo` | a realtime transport a connection can use |
| `NETWORK_ERROR_CODES`, `NetworkErrorCode` | the network failure vocabulary |
| `ITimeoutConfig` | timeouts a transport is configured with |
| `HEADER_AUTHORIZATION`, `HEADER_CONTENT_TYPE`, `HEADER_ACCEPT` | standard HTTP header names |
| `HEADER_SESSION_ID`, `HEADER_MCP_SESSION_ID`, `HEADER_X_MCP_SESSION_ID` | session header names |

The SAP and BTP header names (`HEADER_SAP_*`, `HEADER_UAA_*`, …) are in `@mcp-abap-adt/interfaces-adt`.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade re-exports every symbol, deprecated, until its next major.

## Licence

`LGPL-3.0-only`.
````

`packages/interfaces-auth/README.md`:

````markdown
# @mcp-abap-adt/interfaces-auth

Credential and access contracts shared across the MCP ABAP ADT package families.

## TL;DR

- `IAuthProvider` — how a connection proves who it is. `IRenewableCredential` — a credential that can be renewed. `ICertificateMaterial` — loaded TLS client-certificate material.
- Depends on nothing. Types only; no implementation.
- Moved unchanged from `@mcp-abap-adt/interfaces` 44.0.0.

## Install

```bash
npm install @mcp-abap-adt/interfaces-auth
```

## Use

```typescript
import type {
  IAuthProvider,
  ICertificateMaterial,
  IRenewableCredential,
} from '@mcp-abap-adt/interfaces-auth';
```

`@mcp-abap-adt/connection` ships implementations (`BasicAuthProvider`, `TokenAuthProvider`, …); a consumer can write its own against this contract.

## What belongs here

Only contracts accepted by packages of more than one family (the ABAP family and `llm-agent` or the hub) and not SAP- or BTP-specific. SAP/BTP authentication configuration (`IAuthorizationConfig`, `IConnectionConfig`, token providers, stores) is in `@mcp-abap-adt/interfaces-adt`. New contracts join when their first accepting package exists (decision 11).

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade re-exports every symbol, deprecated, until its next major.

## Licence

`LGPL-3.0-only`.
````

`packages/interfaces-adt/README.md`:

````markdown
# @mcp-abap-adt/interfaces-adt

ADT contracts, the ABAP and Cloud ALM connections, and SAP/BTP configuration and authentication contracts.

## TL;DR

- Everything a package on the SAP side accepts: ADT object operations, runtime analysis, execution, feeds, services, the ABAP and Cloud ALM connections, SAP/BTP configuration, token providers, session and service-key stores, header validation, and the SAP/BTP header names.
- Depends on `@mcp-abap-adt/interfaces-auth` and `@mcp-abap-adt/interfaces-utils` only. Types and constants; no implementation.
- Moved unchanged from `@mcp-abap-adt/interfaces` 44.0.0. Most majors of that package came from these contracts; this package now carries them alone.

## Install

```bash
npm install @mcp-abap-adt/interfaces-adt
```

## What it holds

| directory | what |
|---|---|
| `adt/`, `runtime/`, `execution/`, `feeds/`, `service/`, `shared/` | the ADT contracts: capability atoms, object types, `IAdtResponse`, runtime analysis, execution |
| `connection/` | `IAbapConnection`, `IAbapRequestOptions`, the connection capability atoms, `ICalmConnection`, `CalmService` |
| `sap/`, `auth/` | `ISapConfig`, `IConnectionConfig`, `IAuthorizationConfig`, `IConfig`, `IAuthorizationStrategy`, the callback-server contracts, `ICertificateMaterialLoader`, `AuthTypeEnum` |
| `token/`, `session/`, `serviceKey/`, `store/` | token providers and refreshers, stores and their error codes |
| `validation/`, `Headers.ts` | header validation; `HEADER_SAP_*`, `HEADER_UAA_*`, `HEADER_BTP_DESTINATION`, `HEADER_MCP_DESTINATION`, `HEADER_MCP_URL`, `AUTH_TYPES`, `AuthType` |

The contract rules — what a member answers, how a strategy is supplied, how a contract is built — are in [`docs/architecture/ARCHITECTURE.md`](../../docs/architecture/ARCHITECTURE.md). Domain-by-domain documentation with examples stays in the [`@mcp-abap-adt/interfaces` README](../interfaces/README.md); the contracts it describes are these.

## Coming from `@mcp-abap-adt/interfaces`

Replace the package name in the import. The facade re-exports every symbol, deprecated, until its next major.

## Licence

`LGPL-3.0-only`.
````

- [ ] **Step 3: One CHANGELOG per new package**

Each of `packages/interfaces-{utils,network,auth,adt}/CHANGELOG.md`, with `<name>` replaced:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The package. Its contracts moved unchanged from `@mcp-abap-adt/interfaces`
  44.0.0, which re-exports them, deprecated, from 45.0.0. Why: decision 26 in
  `docs/architecture/DECISIONS.md`.
```

- [ ] **Step 4: The facade's README and CHANGELOG**

In `packages/interfaces/README.md`, insert directly after the first heading line `# @mcp-abap-adt/interfaces`:

```markdown

> **Deprecated facade since 45.0.0.** The contracts live in
> [`@mcp-abap-adt/interfaces-utils`](../interfaces-utils),
> [`-network`](../interfaces-network), [`-auth`](../interfaces-auth) and
> [`-adt`](../interfaces-adt). This package re-exports them; every symbol is
> marked `@deprecated` with the package to import it from. Nothing was removed
> and no contract changed. The domain documentation below still describes
> these contracts.
```

Replace the `## Installation` section's code block with:

````markdown
```bash
npm install @mcp-abap-adt/interfaces-adt      # or -auth, -network, -utils: only what you accept
npm install @mcp-abap-adt/interfaces          # deprecated facade: everything, as before
```
````

Replace the `## Dependencies` section body with:

```markdown
The facade depends on the four `@mcp-abap-adt/interfaces-*` packages and re-exports them. Those depend on no implementation and no runtime package; `interfaces-adt` depends on `interfaces-auth` and `interfaces-utils`.
```

In `packages/interfaces/CHANGELOG.md`, under `## [Unreleased]`, add:

```markdown

**BREAKING — the contracts move to four packages; this one becomes a deprecated facade.**

Nothing a consumer imports disappears, and no contract changes shape. It is a
major because the package now has dependencies: it no longer depends on nothing.

### Changed

- The contracts live in four packages, and this one re-exports them:

  | now in | what |
  |---|---|
  | `@mcp-abap-adt/interfaces-utils` | `ILogger`, `LogLevel` |
  | `@mcp-abap-adt/interfaces-network` | `IWebSocketTransport` and its message types, `NETWORK_ERROR_CODES`, `ITimeoutConfig`, `HEADER_AUTHORIZATION`, `HEADER_CONTENT_TYPE`, `HEADER_ACCEPT`, `HEADER_SESSION_ID`, `HEADER_MCP_SESSION_ID`, `HEADER_X_MCP_SESSION_ID` |
  | `@mcp-abap-adt/interfaces-auth` | `IAuthProvider`, `IRenewableCredential`, `ICertificateMaterial` |
  | `@mcp-abap-adt/interfaces-adt` | everything else that a package imports: ADT contracts, the ABAP and Cloud ALM connections, SAP/BTP configuration and authentication, token, session and service-key stores, validation, the SAP/BTP header names and `AUTH_TYPES` |

- Every symbol exported here is `@deprecated` and names its package. Editors
  strike it through; `tsc` still compiles.

### Deprecated

- `PROXY_ROUTING_HEADERS`, `SAP_CONNECTION_HEADERS`, `UAA_HEADERS`,
  `PRESERVED_HEADERS`, `PROXY_MODIFIED_HEADERS`, `ISessionState`,
  `ISessionStorage`: no package imports them. They stay in this package and are
  removed in its next major.

### Migrating from 44.0.0

1. **Nothing is required.** Imports from `@mcp-abap-adt/interfaces` keep compiling and resolve to the same declarations and the same constant objects.
2. **To leave the facade**, import each symbol from the package its deprecation names, and depend on that package instead of this one.
3. `AuthTypeEnum` comes from `@mcp-abap-adt/interfaces-adt` under the same name.
```

- [ ] **Step 5: Verify what ships**

Run:
```bash
for d in packages/*; do (cd "$d" && npm pack --dry-run 2>&1 | grep -E "README.md|CHANGELOG.md|LICENSE|COPYING" | awk -v d="$d" '{print d": "$NF}'); done
npm run lint:check
```
Expected: each of the five packages lists `README.md`, `CHANGELOG.md`, `LICENSE`, `COPYING`; Biome reports no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: document the five packages and the deprecated facade"
```

---

### Task 9: Architecture, decision 26, and removing the one-off tools

**Files:**
- Modify: `docs/architecture/ARCHITECTURE.md` (§1, §4, §7), `docs/architecture/DECISIONS.md` (append decision 26)
- Delete: `tools/split/`, `tools/generate-package-map.js`

- [ ] **Step 1: ARCHITECTURE §1** — replace the text from `**It depends on nothing.** No runtime dependencies, and no dependency on the` through the closing fence of the diagram that follows it with:

````markdown
**It depends on no implementation and no runtime package.** Since 45.0.0 the
contract is five packages, split by who accepts a contract (decision 26). A
contract package may depend on a sibling contract package, and on nothing else:

```
interfaces-utils      interfaces-network      interfaces-auth
       ▲                                            ▲
       └──────────────── interfaces-adt ────────────┘
                               ▲
                  interfaces (deprecated facade)
```

The arrow to implementations still runs one way:

```
@mcp-abap-adt/interfaces-*        ← contracts, no code
        ▲                    ▲
        │                    │
@mcp-abap-adt/adt-clients    a consumer's own implementation
        ▲
        │
mcp-abap-adt (MCP server), backup tools, scripts, human-facing tooling
```
````

- [ ] **Step 2: ARCHITECTURE §4** — directly after the paragraph that ends `distinction decides which rules above apply.`, insert:

```markdown
**Which package holds them** (decision 26). The ADT contracts, and every
infrastructure contract accepted only on the SAP side, are in
`@mcp-abap-adt/interfaces-adt`. `logging/` is `@mcp-abap-adt/interfaces-utils`.
The WebSocket transport, network error codes, timeouts and generic header names
are `@mcp-abap-adt/interfaces-network`. `IAuthProvider` and
`ICertificateMaterial` are `@mcp-abap-adt/interfaces-auth`. `storage/` and the
header groups stay in the deprecated `@mcp-abap-adt/interfaces` facade until its
next major.
```

- [ ] **Step 3: ARCHITECTURE §7** — append to the numbered list:

```markdown
5. **The 44.0.0 contract** — `npm run check:surface` compares what
   `@mcp-abap-adt/interfaces` exports with `tools/surface-44.0.0.txt` (names and
   kinds) and `tools/baseline-44.0.0.json` (each declaration's tokens, without
   comments or layout, and each constant's value), and the package that declares
   each symbol with `tools/package-map.json`.
6. **The package graph** — `npm run check:graph`: every import is one the graph
   in §1 allows, and is declared in that package's `package.json`.
7. **The deprecations** — `npm run check:deprecated`: importing any facade
   symbol reports TS6385.
8. **What npm installs** — `npm run check:packed` packs every package, installs
   the tarballs into a clean project with Node's types and no workspace links,
   type-checks the published `.d.ts` files without `skipLibCheck`, and checks that
   their declarations and constant values are the 44.0.0 ones and that the facade
   and each package give one declaration and one constant object.
   `npm run check` runs 1 and 5–8, and every package's `prepublishOnly` runs
   `npm run check`.
```

and replace item 1, which currently reads

```markdown
1. **The compiler** — `npm run build` and `npm run test:check` (`tsc --noEmit`
   over `src/`, which includes the typechecks).
```

with

```markdown
1. **The compiler** — `npm run build` and `npm run test:check` (`tsc --noEmit`
   over every package's `src/`, which includes its typechecks).
```

- [ ] **Step 4: DECISIONS — append decision 26** at the end of the file (decision 25 is the last entry; its last paragraph starts `**How to catch a violation.**`):

```markdown

## 26. A contract lives in the package that accepts it

**The problem.** `@mcp-abap-adt/interfaces` was one version line for every
contract. By 44.0.0 it had 108 versions and 41 majors, 28 of them after
2026-08-15, and almost all of that churn was ADT. Then `llm-agent` needed to
accept `IAuthProvider` and an access-check contract, which the hub accepts too.
Depending on this package for them would have tied `llm-agent` to every ADT
major. Import size was never the issue: the package is types and 51 constants.

**The decision.** A contract lives where it is **accepted** — a parameter, a
field or a return typed by it — not where it is implemented. One accepting
package owns it. Several accepting packages on the SAP side share
`@mcp-abap-adt/interfaces-adt` (or `-utils`, by what it is). Contracts accepted
across families go to `@mcp-abap-adt/interfaces-auth`, `-network` or `-utils`.
What nobody accepts is not moved; it stays in the `@mcp-abap-adt/interfaces`
facade, deprecated, and leaves with its next major (decision 11).

**The unit that moves is the file.** Evidence is gathered per exported symbol,
from parsed import statements across every dependent repository, not from name
searches: a name search missed exports whose file is named differently and
credited packages that declare a same-named type of their own. A file moves when
any export is imported, or is composed by a contract that moves — which is why
`auth/AuthType.ts`, imported by nobody, moved with `IValidatedAuthConfig`.

**Why not the alternatives.**
- *One package, fewer majors.* The churn is real ADT work; slowing it to spare
  other families inverts the cost.
- *A package per folder.* Folders are how the code is filed, not who depends on
  it; `auth/` alone holds both SAP-specific configuration and the cross-family
  `IAuthProvider`.
- *Contracts inside implementation packages* (`ILogger` in
  `@mcp-abap-adt/logger`). A package accepting the contract would pull the
  implementation and its peers (`pino`) with it, and "use your own
  implementation" stops being true (§1).

**What keeps it true.** `tools/check-graph.js` fails an import the graph does
not allow; `tools/check-surface.js` fails a symbol in the wrong package or a
facade that lost one; `tools/check-packed.js` proves the facade and the packages
resolve to the same declarations once installed from npm.

**What would change it.** A second family that accepts most of
`interfaces-adt`: then the split is along the wrong line, and the family
boundary should be redrawn.

Spec: `docs/superpowers/specs/2026-09-15-interfaces-split-design.md`.
```

- [ ] **Step 5: Remove the one-off tools**

Run:
```bash
git rm -r tools/split tools/generate-package-map.js
grep -rn "generate-package-map\|tools/split" --include="*.js" --include="*.json" --include="*.md" . --exclude-dir=node_modules --exclude-dir=docs --exclude-dir=.superpowers --exclude-dir=.worktrees
```
Expected: the grep finds nothing (the plan and spec under `docs/` may still mention them).

- [ ] **Step 6: Full check**

Run: `npm run check`
Expected: all five check lines pass, ending with `packed: 5 tarballs install cleanly; 381 published declarations and 51 constant values match 44.0.0; 374 moved symbols are one declaration on both paths`.

- [ ] **Step 7: Commit, push, open the PR**

```bash
git add -A
git commit -m "docs(architecture): record the package split as decision 26

ARCHITECTURE §1 says what each package may depend on, §4 which package holds
each family, §7 which checks keep the split true. The one-off split tools go;
the checks and the 44.0.0 surface they compare against stay."
git push -u origin feat/interfaces-split
gh pr create --base master --title "Split @mcp-abap-adt/interfaces into five packages" --body-file <(cat <<'EOF'
## TL;DR

- The repository is an npm workspace of five packages: `interfaces-utils`, `interfaces-network`, `interfaces-auth`, `interfaces-adt`, and the `interfaces` facade.
- **No contract changed.** Files moved; import specifiers changed where they now cross a package.
- **Nothing disappears.** The facade exports the same 381 symbols as 44.0.0, each deprecated, pointing at its new package.

## How it is held true

| check | what it proves |
|---|---|
| `check:surface` | facade names, kinds, declarations and constant values == 44.0.0; every symbol in its assigned package |
| `check:graph` | imports follow spec §3.6 and are declared in `package.json` |
| `check:deprecated` | all 381 facade symbols report TS6385 |
| `check:packed` | tarballs installed with no workspace links: published `.d.ts` type-check with Node's types and no `skipLibCheck`; declarations and values == 44.0.0; one declaration and one constant object from facade and package |

`npm run check` runs all of them; every `prepublishOnly` runs `check`.

## Not in this PR

- Version 45.0.0 and the publish (release task after merge; the user publishes).
- Moving dependents to the new packages (each dependent's own release).
- `feat/saml-assertion-validation` (no PR) predates the split: `IAssertionValidator` belongs in `packages/interfaces-adt/src/auth/`, importing `ILogger` from `@mcp-abap-adt/interfaces-utils`.

Spec: `docs/superpowers/specs/2026-09-15-interfaces-split-design.md` · Plan: `docs/superpowers/plans/2026-09-16-interfaces-split.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)
```

---

### Task 10: Release — after the PR is merged (the user publishes)

**Files:**
- Modify: `packages/interfaces/package.json` (`version` → `45.0.0`), the five `CHANGELOG.md` files (`[Unreleased]` → dated versions)

- [ ] **Step 1: Stamp the versions on `master`**

```bash
cd /home/okyslytsia/prj/mcp-abap-adt-interfaces
git checkout master && git pull --ff-only
npm ci
npm version 45.0.0 -w @mcp-abap-adt/interfaces --no-git-tag-version
DATE=$(date +%F)
for d in interfaces-utils interfaces-network interfaces-auth interfaces-adt; do
  sed -i "s/^## \[Unreleased\]$/## [Unreleased]\n\n## [1.0.0] - $DATE/" packages/$d/CHANGELOG.md
done
sed -i "0,/^## \[Unreleased\]$/s//## [Unreleased]\n\n## [45.0.0] - $DATE/" packages/interfaces/CHANGELOG.md
git diff --stat
```
Expected: five `CHANGELOG.md` files and `packages/interfaces/package.json` changed (plus `package-lock.json`).

- [ ] **Step 2: Check, commit, tag, push**

```bash
npm run check
git add -A
git commit -m "release: interfaces 45.0.0; interfaces-utils, -network, -auth, -adt 1.0.0"
for t in interfaces-utils-v1.0.0 interfaces-network-v1.0.0 interfaces-auth-v1.0.0 interfaces-adt-v1.0.0 v45.0.0; do git tag -a "$t" -m "$t"; done
git push origin master --follow-tags
```
Expected: `npm run check` ends with the packed line; five tags pushed.

- [ ] **Step 3: Hand over the publish** — tell the user to run, in this order (each `prepublishOnly` runs `npm run check` again):

```bash
cd /home/okyslytsia/prj/mcp-abap-adt-interfaces
npm publish -w @mcp-abap-adt/interfaces-utils
npm publish -w @mcp-abap-adt/interfaces-network
npm publish -w @mcp-abap-adt/interfaces-auth
npm publish -w @mcp-abap-adt/interfaces-adt
npm publish -w @mcp-abap-adt/interfaces
```

- [ ] **Step 4: Verify from the registry, after the user confirms**

```bash
for p in interfaces-utils interfaces-network interfaces-auth interfaces-adt interfaces; do echo "$p $(npm view @mcp-abap-adt/$p version)"; done
T=$(mktemp -d) && cd "$T" && npm init -y >/dev/null && npm install --no-audit --no-fund @mcp-abap-adt/interfaces@45.0.0 >/dev/null \
  && node -e 'const f=require("@mcp-abap-adt/interfaces"),a=require("@mcp-abap-adt/interfaces-adt"),n=require("@mcp-abap-adt/interfaces-network");console.log(f.AUTH_TYPES===a.AUTH_TYPES, f.NETWORK_ERROR_CODES===n.NETWORK_ERROR_CODES, Array.isArray(f.PROXY_MODIFIED_HEADERS))'
```
Expected: versions `1.0.0` ×4 and `45.0.0`; `true true true`.
