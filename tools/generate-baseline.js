// Regenerates the 44.0.0 publish-gate baseline from the built facade. Run this
// deliberately, only after an INTENTIONAL contract change, then review the
// diff of the two files it rewrites (`surface-44.0.0.txt`,
// `baseline-44.0.0.json`) before committing — an unreviewed diff here would
// silently move the gate that `tools/check-surface.js` and
// `tools/check-packed.js` enforce.
//   npm run build && node tools/generate-baseline.js
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, exportsOf } = require('./lib/exports');

const facade = path.join(ROOT, 'packages', 'interfaces', 'dist');
const entries = exportsOf(path.join(facade, 'index.d.ts'));
const runtime = require(path.join(facade, 'index.js'));
const baseline = {};
for (const e of entries) {
  baseline[e.name] = { declaration: e.declaration };
  if (e.kind === 'value')
    baseline[e.name].value = JSON.stringify(runtime[e.name]);
}
const write = (name, text) =>
  fs.writeFileSync(path.join(ROOT, 'tools', name), text);
write(
  'surface-44.0.0.txt',
  `${entries.map((e) => `${e.name} ${e.kind}`).join('\n')}\n`,
);
write('baseline-44.0.0.json', `${JSON.stringify(baseline, null, 2)}\n`);
const values = entries.filter((e) => e.kind === 'value').length;
console.log(entries.length, 'symbols', values, 'values');
