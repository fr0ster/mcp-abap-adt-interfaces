// Every symbol is declared in the package the split assigns it to. Run after
// `npm run build`.
//   node tools/check-surface.js                      nothing to check
//   node tools/check-surface.js --placement <dir>    one package
//   node tools/check-surface.js --placement all      every symbol
//
// **What this used to check, twice over.** Until 52.0.0 it proved the built
// `@mcp-abap-adt/interfaces` facade exported exactly the 44.0.0 contract —
// names, kinds, declarations and constant values — against
// `tools/baseline-44.0.0.json`, with every addition, removal and change since
// the split written down one by one. When the facade stopped forwarding, it
// proved the opposite: that it forwarded nothing.
//
// The facade is deleted, so neither question exists. What survives is the half
// that never depended on it: is each symbol declared where
// `tools/package-map.json` says it belongs. That is the question the split was
// made to keep answerable, and it is the one that stays worth asking.
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, exportsOf } = require('./lib/exports');

const placementArg = process.argv.indexOf('--placement');
const only = placementArg === -1 ? null : process.argv[placementArg + 1];

const problems = [];
const map = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tools', 'package-map.json'), 'utf8'),
);
const packages = [
  'interfaces-adt',
  'interfaces-adt-connection',
  'interfaces-auth',
  'interfaces-auth-sap',
  'interfaces-calm',
  'interfaces-network',
  'interfaces-utils',
];
let placed = 0;
if (only) {
  for (const pkg of packages) {
    if (only !== 'all' && only !== pkg) continue;
    const entry = path.join(ROOT, 'packages', pkg, 'dist', 'index.d.ts');
    if (!fs.existsSync(entry)) {
      problems.push(`${pkg} is not built`);
      continue;
    }
    for (const e of exportsOf(entry)) {
      const want = map[e.name];
      if (want === undefined) continue;
      placed += 1;
      if (e.packageDir && e.packageDir !== want)
        problems.push(
          `${e.name} is exported by ${pkg} but declared in ${e.packageDir}; the map says ${want}`,
        );
      if (want === 'interfaces')
        problems.push(
          `${e.name} is mapped to the deleted facade; give it a package`,
        );
    }
  }
}

if (problems.length) {
  for (const p of problems) console.error(p);
  console.error(`${problems.length} problem(s)`);
  process.exit(1);
}

console.log(
  only
    ? `surface: placement ok (${only}, ${placed} symbol(s) checked)`
    : 'surface: nothing to check without --placement',
);
