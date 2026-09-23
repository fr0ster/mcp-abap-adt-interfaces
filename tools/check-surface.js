// The facade duplicates nothing, and every symbol is declared in the package
// the split assigns it to. Run after `npm run build`.
//   node tools/check-surface.js                      duplication only
//   node tools/check-surface.js --placement <dir>    + placement for one package
//   node tools/check-surface.js --placement all      + placement for every symbol
//
// **What this used to check, and why it does not any more.** Until 52.0.0 it
// proved the built facade exported exactly the 44.0.0 contract — the same
// names, kinds, declarations and constant values — against
// `tools/baseline-44.0.0.json`, with every addition, removal and change since
// the split written down one by one. That was the right guard while the
// facade's job was to keep a pre-split consumer compiling.
//
// It is the wrong guard now. Forwarding the split packages was duplication
// with a cost: a change to any of the four made a release here, and a consumer
// holding this package moved at the pace of contracts it does not use. The
// facade stopped forwarding, so "it still exports everything" is exactly the
// property we no longer want, and a check that enforced it would enforce the
// coupling. The baseline files go with it; git holds what they proved.
//
// The placement half survives unchanged, because it never depended on the
// facade: it asks whether each symbol is declared where `tools/package-map.json`
// says it belongs.
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, exportsOf } = require('./lib/exports');

const facadeEntry = path.join(
  ROOT,
  'packages',
  'interfaces',
  'dist',
  'index.d.ts',
);
const facadeSrc = path.join(ROOT, 'packages', 'interfaces', 'src');

const placementArg = process.argv.indexOf('--placement');
const only = placementArg === -1 ? null : process.argv[placementArg + 1];

const problems = [];
const facade = exportsOf(facadeEntry);

// 1. The facade declares what it exports. A symbol whose declaration lives in
//    another package is a re-export, which is the duplication this forbids.
for (const e of facade) {
  if (!e.file) {
    problems.push(`no declaration file for ${e.name}`);
    continue;
  }
  const declaredHere =
    e.file.startsWith(facadeSrc) ||
    e.file.startsWith(path.join(ROOT, 'packages', 'interfaces', 'dist'));
  if (!declaredHere)
    problems.push(
      `facade re-exports ${e.name}, declared in ${path.relative(ROOT, e.file)}`,
    );
}

// 2. Placement: every symbol a package exports is declared in the package the
//    map assigns it to.
const map = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tools', 'package-map.json'), 'utf8'),
);
const packages = [
  'interfaces-adt',
  'interfaces-auth',
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
      if (want === undefined) continue; // a symbol added since the map; not this check's business
      placed += 1;
      if (e.packageDir && e.packageDir !== want)
        problems.push(
          `${e.name} is exported by ${pkg} but declared in ${e.packageDir}; the map says ${want}`,
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
  `surface: the facade forwards nothing — ${facade.length} symbol(s), all declared in it` +
    (only ? `; placement ok (${only}, ${placed} symbol(s) checked)` : ''),
);
