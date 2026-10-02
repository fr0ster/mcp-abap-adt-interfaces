// Runs one npm command in every package, in `publishOrder` — dependencies
// first. The packages are not workspaces: each installs its own dependencies
// from the registry and builds against them, so nothing here is linked to a
// sibling's source and what passes is what a consumer installs.
//   node tools/each-package.js ci
//   node tools/each-package.js run build
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const { publishOrder } = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
);
const args = process.argv.slice(2);
if (args.length === 0) {
  process.stderr.write('usage: node tools/each-package.js <npm args…>\n');
  process.exit(2);
}

for (const dir of publishOrder) {
  process.stdout.write(`\n>>> ${dir}: npm ${args.join(' ')}\n`);
  const run = spawnSync('npm', args, {
    cwd: path.join(ROOT, dir),
    stdio: 'inherit',
  });
  if (run.status !== 0) {
    process.stderr.write(`${dir}: npm ${args.join(' ')} failed — stopping.\n`);
    process.exit(run.status ?? 1);
  }
}
