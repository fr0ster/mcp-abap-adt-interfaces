// Spec §6: what a consumer installs from npm, not what the workspace links.
// Packs every package, installs the tarballs into a fresh project outside the
// repository, and checks there that the migration guarantee of spec §5.2 holds
// and that each package's declarations compile on their own.
//   npm run build && node tools/check-packed.js
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const { ROOT, COMPILER_OPTIONS } = require('./lib/exports');

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
// The removals `check-surface.js` used to read too. A symbol retired at a major
// is importable from nowhere, so it is left out of the consumer this compiles:
// asking for it would fail on purpose and say nothing about the tarballs.
const removed = fs
  .readFileSync(path.join(ROOT, 'tools', 'surface-removed.txt'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.startsWith('#'))
  .map((line) => line.split(/\s+/)[0]);
const rootManifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
);

let work;
function cleanup() {
  if (work) fs.rmSync(work, { recursive: true, force: true });
}

let files = [];
let checkedTypes = 0;

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

    // 4. Types: a consumer compiles against the packages that declare the
    // names, with the published declarations checked too (no skipLibCheck).
    //
    // This used to import every 44.0.0 name from the `@mcp-abap-adt/interfaces`
    // facade as well, and check that both paths resolved to one declaration.
    // That facade is deleted, so the import would not resolve and would say
    // nothing about the tarballs. What is worth proving is the opposite: each
    // package is installable and self-sufficient.
    const sample = Object.entries(map)
      .filter(([, pkg]) => pkg !== 'interfaces' && pkg !== undefined)
      .filter(([name]) => !removed.includes(name));
    checkedTypes = sample.length;
    const source = [
      ...sample.map(
        ([name, pkg]) =>
          `import type { ${name} as N_${name} } from '@mcp-abap-adt/${pkg}';`,
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
    for (const d of ts.getPreEmitDiagnostics(program))
      problems.push(
        `${d.file ? path.relative(consumer, d.file.fileName) : 'program'}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`,
      );

    // 5. Runtime: every package that ships a value loads on its own. The
    // facade used to be interrogated here — first for its 44.0.0 constants,
    // then for forwarding nothing — and it is deleted.
    const script = `
const out = [];
for (const pkg of ['interfaces-adt', 'interfaces-adt-connection', 'interfaces-auth', 'interfaces-auth-sap', 'interfaces-calm', 'interfaces-network', 'interfaces-utils']) {
  try { require('@mcp-abap-adt/' + pkg); } catch (e) { out.push(pkg + ': ' + e.message); }
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
  `packed: ${files.length} tarballs install cleanly, load on their own, and ${checkedTypes} declarations compile from the packages that declare them`,
);
