// One-off, run on the built 44.0.0 layout (`npm run build` first): records which
// package every public symbol belongs to after the split (spec §3), and the
// 44.0.0 contract to preserve — surface, declarations and constant values.
//   npm run build && node tools/generate-package-map.js
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, exportsOf } = require('./lib/exports');

const NETWORK_HEADERS = new Set([
  'HEADER_AUTHORIZATION',
  'HEADER_CONTENT_TYPE',
  'HEADER_ACCEPT',
  'HEADER_SESSION_ID',
  'HEADER_MCP_SESSION_ID',
  'HEADER_X_MCP_SESSION_ID',
]);
const HEADER_GROUPS = new Set([
  'PROXY_ROUTING_HEADERS',
  'SAP_CONNECTION_HEADERS',
  'UAA_HEADERS',
  'PRESERVED_HEADERS',
  'PROXY_MODIFIED_HEADERS',
]);

function packageFor(relFile, name) {
  if (relFile.startsWith('logging/')) return 'interfaces-utils';
  if (
    relFile === 'connection/IWebSocketTransport.ts' ||
    relFile === 'connection/NetworkErrors.ts' ||
    relFile === 'utils/ITimeoutConfig.ts'
  )
    return 'interfaces-network';
  if (relFile === 'auth/IAuthProvider.ts') return 'interfaces-auth';
  if (relFile === 'auth/ICertificateMaterialLoader.ts')
    return name === 'ICertificateMaterial'
      ? 'interfaces-auth'
      : 'interfaces-adt';
  if (relFile === 'Headers.ts') {
    if (NETWORK_HEADERS.has(name)) return 'interfaces-network';
    if (HEADER_GROUPS.has(name)) return 'interfaces';
    return 'interfaces-adt';
  }
  if (
    relFile.startsWith('storage/') ||
    relFile === 'token/ITokenProviderResult.ts'
  )
    return 'interfaces';
  return 'interfaces-adt';
}

const dist = path.join(ROOT, 'dist');
const entries = exportsOf(path.join(dist, 'index.d.ts'));
const runtime = require(path.join(dist, 'index.js'));
const map = {};
const baseline = {};
for (const e of entries) {
  const relFile = path.relative(dist, e.file).replace(/\.d\.ts$/, '.ts');
  map[e.name] = packageFor(relFile, e.name);
  baseline[e.name] = { declaration: e.declaration };
  if (e.kind === 'value')
    baseline[e.name].value = JSON.stringify(runtime[e.name]);
}
const write = (name, text) =>
  fs.writeFileSync(path.join(ROOT, 'tools', name), text);
write('package-map.json', `${JSON.stringify(map, null, 2)}\n`);
write(
  'surface-44.0.0.txt',
  `${entries.map((e) => `${e.name} ${e.kind}`).join('\n')}\n`,
);
write('baseline-44.0.0.json', `${JSON.stringify(baseline, null, 1)}\n`);
const counts = {};
for (const p of Object.values(map)) counts[p] = (counts[p] ?? 0) + 1;
const values = entries.filter((e) => e.kind === 'value').length;
console.log(entries.length, 'symbols', values, 'values', counts);
