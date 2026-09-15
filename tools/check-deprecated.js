// Every symbol a consumer imports from @mcp-abap-adt/interfaces is reported
// deprecated (TS6385) — the moved ones point at their new package, the
// unaccepted ones announce their removal. Run after `npm run build`.
//   node tools/check-deprecated.js [--expect-none-for <dir>]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const { ROOT, COMPILER_OPTIONS } = require('./lib/exports');

const map = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tools', 'package-map.json'), 'utf8'),
);
const surface = fs
  .readFileSync(path.join(ROOT, 'tools', 'surface-44.0.0.txt'), 'utf8')
  .trim()
  .split('\n')
  .map((l) => l.split(' '));

// Symbols whose package already exists are checked; the rest are still at home.
const existing = new Set(
  fs
    .readdirSync(path.join(ROOT, 'packages'))
    .filter((d) =>
      fs.existsSync(path.join(ROOT, 'packages', d, 'package.json')),
    ),
);
const checked = surface.filter(([name]) => existing.has(map[name]));

const dir = fs.mkdtempSync(path.join(ROOT, 'node_modules', '.deprecated-'));
const consumer = path.join(dir, 'consumer.ts');
const types = checked.filter(([, k]) => k === 'type').map(([n]) => n);
const values = checked.filter(([, k]) => k === 'value').map(([n]) => n);
fs.writeFileSync(
  consumer,
  [
    `import type { ${types.join(', ')} } from '@mcp-abap-adt/interfaces';`,
    `import { ${values.join(', ')} } from '@mcp-abap-adt/interfaces';`,
    '',
  ].join('\n'),
);

const host = {
  getScriptFileNames: () => [consumer],
  getScriptVersion: () => '1',
  getScriptSnapshot: (f) =>
    fs.existsSync(f)
      ? ts.ScriptSnapshot.fromString(fs.readFileSync(f, 'utf8'))
      : undefined,
  getCurrentDirectory: () => ROOT,
  getCompilationSettings: () => COMPILER_OPTIONS,
  getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists,
  getDirectories: ts.sys.getDirectories,
};
const service = ts.createLanguageService(host);
const errors = service.getSemanticDiagnostics(consumer);
const reported = new Set(
  service
    .getSuggestionDiagnostics(consumer)
    .filter((d) => d.code === 6385)
    .map(
      (d) =>
        ts
          .flattenDiagnosticMessageText(d.messageText, ' ')
          .match(/'([^']+)'/)[1],
    ),
);
fs.rmSync(dir, { recursive: true, force: true });

const problems = errors.map(
  (d) =>
    `consumer does not compile: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`,
);
for (const [name] of checked)
  if (!reported.has(name))
    problems.push(`not deprecated in the facade: ${name}`);

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`${problems.length} problem(s)`);
  process.exit(1);
}
console.log(
  `deprecated: all ${checked.length} checked symbols are reported deprecated`,
);
