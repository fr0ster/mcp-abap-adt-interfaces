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
