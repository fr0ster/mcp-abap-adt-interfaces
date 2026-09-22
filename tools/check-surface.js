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
// Additions since the split, declared one by one. Without this the check
// forbids the facade ever gaining a symbol, which is not what it is for: it is
// for proving the split preserved 44.0.0, and for catching a symbol that
// leaked out of a package by accident. An addition nobody wrote down still
// fails.
const added = fs
  .readFileSync(path.join(ROOT, 'tools', 'surface-added.txt'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.startsWith('#'));
// Declarations that have deliberately changed since 44.0.0. Same shape as
// `surface-added.txt` and the same reason: the baseline is a proof, so it is
// not regenerated, and a change nobody wrote down still fails.
const changed = fs
  .readFileSync(path.join(ROOT, 'tools', 'surface-changed.txt'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.startsWith('#'));
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
  if (!expected.includes(line) && !added.includes(line))
    problems.push(
      `not in 44.0.0 and not declared in surface-added.txt: ${line}`,
    );
for (const line of added)
  if (!actual.includes(line))
    problems.push(`declared as added but not in the facade: ${line}`);
// A name listed as changed that matches the baseline again is bookkeeping left
// behind, and it would quietly excuse the next real drift of that symbol.
for (const name of changed) {
  const e = entries.find((entry) => entry.name === name);
  const base = baseline[name];
  if (e && base && e.declaration === base.declaration)
    problems.push(`declared as changed but matches 44.0.0: ${name}`);
}

const runtime = require(path.join(facade, 'index.js'));
for (const e of entries) {
  const base = baseline[e.name];
  if (!base) continue;
  if (e.declaration !== base.declaration && !changed.includes(e.name))
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
  `surface: ${actual.length} symbols — ${expected.length} from 44.0.0 in name, kind, declaration and value, ${added.length} declared addition(s), ${changed.length} declared change(s)${only ? `; placement ok (${only})` : ''}`,
);
