// Every package imports only what spec §3.6 allows, declares it in
// package.json, imports everything it declares, and never reaches outside its
// own src with a relative path.
//   node tools/check-graph.js
//
// **The "imports everything it declares" half was added after a review caught
// what this file could not.** `interfaces-adt` kept `interfaces-utils` in its
// manifest and its project references after `XmlNode` left, and so did
// `interfaces-auth-sap` — a dependency edge, an install and a build edge for a
// package neither one imports. Checking one direction only says a declared
// dependency is permitted; it never asked whether it is used.
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./lib/exports');

const ALLOWED = {
  'interfaces-utils': [],
  'interfaces-network': [],
  'interfaces-auth': ['interfaces-utils'],
  'interfaces-auth-sap': ['interfaces-auth'],
  'interfaces-calm': ['interfaces-network'],
  'interfaces-adt-connection': ['interfaces-network'],
  'interfaces-adt': ['interfaces-adt-connection'],
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
  const imported = new Set();
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
      else imported.add(spec);
    }
  }

  // A dependency nothing imports is an edge the tree pays for and the contract
  // does not need. Types-only packages have no runtime use for one.
  for (const dep of declared) {
    if (!dep.startsWith('@mcp-abap-adt/')) continue;
    if (!imported.has(dep))
      problems.push(
        `${dir}: package.json depends on ${dep}, which no file in src imports`,
      );
  }

  // The project references have to agree with the manifest, or a build edge
  // outlives the import that justified it.
  for (const name of ['tsconfig.json', 'tsconfig.build.json']) {
    const file = path.join(pkgRoot, name);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/"path"\s*:\s*"\.\.\/(interfaces-[^/"]+)/g)) {
      const dep = `@mcp-abap-adt/${m[1]}`;
      if (!imported.has(dep))
        problems.push(
          `${dir}/${name}: references ${m[1]}, which no file in src imports`,
        );
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('graph: every import is allowed and declared');
