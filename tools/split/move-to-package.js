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
  let home = 'interfaces';
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
