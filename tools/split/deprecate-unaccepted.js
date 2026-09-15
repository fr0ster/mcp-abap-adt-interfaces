// Spec §3.5: what no package imports stays in @mcp-abap-adt/interfaces, marked
// deprecated, until the facade's next major removes it.
//   node tools/split/deprecate-unaccepted.js
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('../lib/exports');

const NOTE =
  'No package imports this; it is removed in the next major of `@mcp-abap-adt/interfaces`.';
const SRC = path.join(ROOT, 'packages', 'interfaces', 'src');
const TARGETS = {
  'Headers.ts': [
    'PROXY_ROUTING_HEADERS',
    'SAP_CONNECTION_HEADERS',
    'UAA_HEADERS',
    'PRESERVED_HEADERS',
    'PROXY_MODIFIED_HEADERS',
  ],
  'storage/ISessionState.ts': ['ISessionState'],
  'storage/ISessionStorage.ts': ['ISessionStorage'],
};

for (const [rel, names] of Object.entries(TARGETS)) {
  const file = path.join(SRC, rel);
  let text = fs.readFileSync(file, 'utf8');
  for (const name of names) {
    // The declaration, with the JSDoc block directly above it if there is one.
    const declaration = new RegExp(
      `(\\n)((?:/\\*\\*(?:(?!\\*/)[\\s\\S])*?\\*/\\n)?)(export (?:const|interface|type) ${name}\\b)`,
    );
    const match = text.match(declaration);
    if (!match) throw new Error(`${name} not found in ${rel}`);
    if (match[2].includes('@deprecated')) continue;
    const doc = match[2]
      ? match[2].replace(/\n?\s*\*\/\n$/, `\n *\n * @deprecated ${NOTE}\n */\n`)
      : `/** @deprecated ${NOTE} */\n`;
    text = text.replace(declaration, `$1${doc}$3`);
  }
  fs.writeFileSync(file, text);
  console.log(`${rel}: ${names.join(', ')}`);
}
