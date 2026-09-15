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

let work;
function cleanup() {
  if (work) fs.rmSync(work, { recursive: true, force: true });
}

let files = [];
let moved = [];
let values = [];
try {
  // 1. Pack.
  work = fs.mkdtempSync(path.join(os.tmpdir(), 'interfaces-packed-'));
  const tarballs = path.join(work, 'tarballs');
  fs.mkdirSync(tarballs);
  const dirs = fs
    .readdirSync(path.join(ROOT, 'packages'))
    .filter((d) =>
      fs.existsSync(path.join(ROOT, 'packages', d, 'package.json')),
    );
  for (const dir of dirs)
    run(
      'npm',
      ['pack', '--pack-destination', tarballs, '--silent'],
      path.join(ROOT, 'packages', dir),
    );
  files = fs.readdirSync(tarballs).map((f) => path.join(tarballs, f));

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

  // A tarball that names a sibling by path cannot be installed anywhere else.
  if (!problems.length) {
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
        problems.push(
          `@mcp-abap-adt/${name} is a symlink, not an installed copy`,
        );
      const nested = path.join(
        installed,
        name,
        'node_modules',
        '@mcp-abap-adt',
      );
      if (fs.existsSync(nested))
        problems.push(
          `@mcp-abap-adt/${name} carries its own copy of ${fs.readdirSync(nested)}`,
        );
    }

    // 4. Types, with the published declarations checked too (no skipLibCheck):
    // every moved symbol resolves to one declaration from the facade and from its
    // package, and every symbol's declaration is the 44.0.0 one.
    moved = surface.filter(([name]) => map[name] !== 'interfaces');
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
    values = surface.filter(([, kind]) => kind === 'value');
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
  }
} catch (error) {
  problems.push(String(error?.message ?? error));
} finally {
  cleanup();
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`${problems.length} problem(s)`);
  process.exit(1);
}
console.log(
  `packed: ${files.length} tarballs install cleanly; ${surface.length} published declarations and ${values.length} constant values match 44.0.0; ${moved.length} moved symbols are one declaration on both paths`,
);
