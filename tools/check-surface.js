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
