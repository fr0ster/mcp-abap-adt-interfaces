#!/usr/bin/env node
/**
 * type-promotion-diff.mjs — throwaway tooling for Task A1 (type-promotion migration).
 *
 * Bidirectional structural diff between:
 *   - adt-clients:  ../mcp-abap-adt-clients/src/core/*\/types.ts   (source of truth)
 *   - interfaces:   ../mcp-abap-adt-interfaces/src/**\/*.ts        (drifted copies + shared types)
 *
 * Forward direction: every exported interface/type in each adt-clients core/*\/types.ts
 * is looked up by name anywhere under interfaces src/. Classified ADD / MATCH / DIFF.
 *
 * Reverse direction: every exported param/config/state/option-shaped type anywhere under
 * interfaces src/ with no same-named declaration in any adt-clients core/*\/types.ts is
 * classified INTERFACES_ONLY (candidate for removal — a breaking change).
 *
 * Text-level block comparison (whitespace + line-comment normalized). This is a worklist,
 * not a compiler — deliberately simple regex/brace-matching, no TS AST.
 *
 * Deleted in Task A7 once the promotion migration is complete.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INTERFACES_ROOT = join(__dirname, '..');
const CLIENTS_ROOT = join(INTERFACES_ROOT, '..', 'mcp-abap-adt-clients');
const CLIENTS_CORE = join(CLIENTS_ROOT, 'src', 'core');
const INTERFACES_SRC = join(INTERFACES_ROOT, 'src');

// --- Exclusions (per task brief: atc module + unitTest sync types are out of scope) ---
const EXCLUDED_NAMES = new Set([
  'IUnitTestRunSyncOptions',
  'IUnitTestSummary',
  'IUnitTestAlert',
  'IUnitTestMethodResult',
  'UnitTestObjectType',
  'UnitTestRunScope',
]);
const EXCLUDED_MODULE_DIRS = new Set(['atc']);
const EXCLUDED_FILE_RE = /atc/i; // e.g. src/runtime/IAtcLog.ts

// Reverse-direction candidate filter: only "param/config/state/option"-shaped exported
// declarations are worklist material (per brief). Everything else (ILogger, IAbapConnection,
// store/session plumbing, etc.) is infrastructure, not a promotion candidate.
const CANDIDATE_NAME_RE = /(Params|Config|State|Options|Result)$/;

// --- Filesystem walk ---
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (entry.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

// Strip comments before block extraction so `export interface X {...}` inside a JSDoc
// example (e.g. src/adt/IAdtObjectState.ts's "Example:" blocks) is never mistaken for a
// real declaration. Preserves line structure (comment content replaced with spaces/newlines
// kept) so offsets used for reporting stay sane, and string/template literals are left
// untouched (best-effort: comments never legitimately appear inside them here).
function stripComments(source) {
  let out = '';
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      out += '\n';
      continue;
    }
    if (source[i] === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        out += source[i] === '\n' ? '\n' : ' ';
        i++;
      }
      i += 1; // land on the trailing '/', loop's i++ consumes it
      continue;
    }
    out += source[i];
  }
  return out;
}

// --- Block extraction: export interface Name { ... } / export type Name = ... ; ---
function extractBlocks(source) {
  source = stripComments(source);
  const blocks = []; // { name, kind, text }
  const declRe = /export\s+(interface|type)\s+([A-Za-z0-9_]+)/g;
  let m;
  while ((m = declRe.exec(source)) !== null) {
    const kind = m[1];
    const name = m[2];
    const startIdx = m.index;

    if (kind === 'interface') {
      // find first '{' after the match (skips generics/extends clause), then brace-match.
      let i = declRe.lastIndex;
      while (i < source.length && source[i] !== '{') i++;
      if (i >= source.length) continue;
      let depth = 0;
      let j = i;
      for (; j < source.length; j++) {
        if (source[j] === '{') depth++;
        else if (source[j] === '}') {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      const text = source.slice(startIdx, j);
      blocks.push({ name, kind, text });
      declRe.lastIndex = j;
    } else {
      // type alias: find '=' then scan to a top-level ';' (or EOF), tracking nesting of
      // {}, (), [], <> so semicolons inside nested members don't terminate early.
      let i = declRe.lastIndex;
      while (i < source.length && source[i] !== '=') i++;
      if (i >= source.length) continue;
      let depth = 0;
      let j = i;
      for (; j < source.length; j++) {
        const c = source[j];
        if ('{(['.includes(c)) depth++;
        else if ('})]'.includes(c)) depth--;
        else if (c === '<') depth++;
        else if (c === '>') {
          // avoid treating '=>' arrow or '>=' as generic close mismatches; best-effort only
          if (depth > 0) depth--;
        } else if (c === ';' && depth <= 0) {
          j++;
          break;
        } else if (c === '\n' && depth <= 0) {
          // stop at a top-level newline followed by another export/blank (no trailing ';')
          const rest = source.slice(j + 1, j + 50);
          if (/^\s*(export|\n|$)/.test(rest)) {
            break;
          }
        }
      }
      const text = source.slice(startIdx, j);
      blocks.push({ name, kind, text });
      declRe.lastIndex = j;
    }
  }
  return blocks;
}

function normalize(text) {
  return text
    .split('\n')
    .map((l) => l.replace(/\/\/.*$/, '').trim())
    .filter((l) => l.length > 0)
    .join('\n');
}

function diffLines(a, b) {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const bSet = new Set(bLines);
  const aSet = new Set(aLines);
  const onlyInClients = aLines.filter((l) => !bSet.has(l));
  const onlyInInterfaces = bLines.filter((l) => !aSet.has(l));
  return { onlyInClients, onlyInInterfaces };
}

// --- Collect adt-clients side: per-module blocks from core/*/types.ts ---
const clientsModules = readdirSync(CLIENTS_CORE)
  .filter((d) => statSync(join(CLIENTS_CORE, d)).isDirectory())
  .filter((d) => !EXCLUDED_MODULE_DIRS.has(d))
  .sort();

const clientsByModule = new Map(); // module -> [{name, kind, text}]
for (const mod of clientsModules) {
  const typesFile = join(CLIENTS_CORE, mod, 'types.ts');
  try {
    const src = readFileSync(typesFile, 'utf8');
    const blocks = extractBlocks(src).filter((b) => !EXCLUDED_NAMES.has(b.name));
    clientsByModule.set(mod, blocks);
  } catch {
    // no types.ts for this module — skip
  }
}

// name -> module (for reverse-lookup / dedupe reporting)
const clientsNameToModule = new Map();
const clientsNameToBlock = new Map();
for (const [mod, blocks] of clientsByModule) {
  for (const b of blocks) {
    clientsNameToModule.set(b.name, mod);
    clientsNameToBlock.set(b.name, b);
  }
}

// --- Collect interfaces side: all blocks across src/**/*.ts ---
const interfaceFiles = walk(INTERFACES_SRC).filter((f) => !EXCLUDED_FILE_RE.test(relative(INTERFACES_SRC, f)));
const interfacesBlocksByName = new Map(); // name -> [{file, block}]
for (const file of interfaceFiles) {
  const src = readFileSync(file, 'utf8');
  const blocks = extractBlocks(src).filter((b) => !EXCLUDED_NAMES.has(b.name));
  for (const b of blocks) {
    const relFile = relative(INTERFACES_ROOT, file);
    if (!interfacesBlocksByName.has(b.name)) interfacesBlocksByName.set(b.name, []);
    interfacesBlocksByName.get(b.name).push({ file: relFile, block: b });
  }
}

// --- Forward pass: classify each adt-clients type ---
const forwardResults = new Map(); // module -> [{name, status, files, diff}]
let totalAdd = 0;
let totalMatch = 0;
let totalDiff = 0;

for (const [mod, blocks] of clientsByModule) {
  const rows = [];
  for (const b of blocks) {
    const matches = interfacesBlocksByName.get(b.name);
    if (!matches || matches.length === 0) {
      rows.push({ name: b.name, status: 'ADD' });
      totalAdd++;
      continue;
    }
    const normClients = normalize(b.text);
    let matched = null;
    let firstDiff = null;
    for (const cand of matches) {
      const normIface = normalize(cand.block.text);
      if (normClients === normIface) {
        matched = cand;
        break;
      }
      if (!firstDiff) firstDiff = cand;
    }
    if (matched) {
      rows.push({ name: b.name, status: 'MATCH', files: matches.map((m) => m.file) });
      totalMatch++;
    } else {
      const { onlyInClients, onlyInInterfaces } = diffLines(normClients, normalize(firstDiff.block.text));
      rows.push({
        name: b.name,
        status: 'DIFF',
        files: matches.map((m) => m.file),
        onlyInClients,
        onlyInInterfaces,
      });
      totalDiff++;
    }
  }
  forwardResults.set(mod, rows);
}

// --- Reverse pass: INTERFACES_ONLY ---
const interfacesOnly = [];
for (const [name, occurrences] of interfacesBlocksByName) {
  if (clientsNameToModule.has(name)) continue;
  if (!CANDIDATE_NAME_RE.test(name)) continue;
  interfacesOnly.push({ name, files: occurrences.map((o) => o.file) });
}
interfacesOnly.sort((a, b) => a.name.localeCompare(b.name));

// --- Classify incompatibility for DIFF/ADD entries (heuristic, for the version decision) ---
function classifyDiffSeverity(row) {
  // ADD = brand new type in adt-clients not present at all in interfaces -> always
  // "additive" from interfaces' perspective (nothing to break), UNLESS the interfaces
  // side already exports something else under that name that would be shadowed
  // (handled separately as DIFF, not ADD, by construction).
  if (row.status === 'ADD') return { severity: 'additive', reasons: ['new type, no existing consumer to break'] };

  const reasons = [];
  let severity = 'additive';

  const clientsFieldRe = /^([A-Za-z0-9_]+)(\??):/;
  const clientsFields = new Map();
  for (const line of row.onlyInClients || []) {
    const fm = clientsFieldRe.exec(line);
    if (fm) clientsFields.set(fm[1], fm[2] === '?');
  }
  const ifaceFields = new Map();
  for (const line of row.onlyInInterfaces || []) {
    const fm = clientsFieldRe.exec(line);
    if (fm) ifaceFields.set(fm[1], fm[2] === '?');
  }

  // Field present in interfaces but removed in adt-clients -> field removal (from interfaces' view)
  for (const [fname] of ifaceFields) {
    if (!clientsFields.has(fname)) {
      severity = 'incompatible';
      reasons.push(`field '${fname}' removed (present in interfaces, absent in adt-clients)`);
    }
  }
  // Field present in adt-clients but not interfaces
  for (const [fname, isOptionalInClients] of clientsFields) {
    if (!ifaceFields.has(fname)) {
      if (isOptionalInClients) {
        reasons.push(`field '${fname}' added (optional)`);
      } else {
        severity = 'incompatible';
        reasons.push(`field '${fname}' added (REQUIRED)`);
      }
      continue;
    }
    const wasOptional = ifaceFields.get(fname);
    if (wasOptional && !isOptionalInClients) {
      severity = 'incompatible';
      reasons.push(`field '${fname}' optionality tightened (was optional in interfaces, required in adt-clients)`);
    }
  }
  // Any non-field-shaped differing lines (nested shape changes, e.g. IFixedValue) -> incompatible
  const nonFieldClients = (row.onlyInClients || []).filter((l) => !clientsFieldRe.test(l));
  const nonFieldIface = (row.onlyInInterfaces || []).filter((l) => !clientsFieldRe.test(l));
  if (nonFieldClients.length || nonFieldIface.length) {
    severity = 'incompatible';
    reasons.push('non-field structural difference (nested shape / type literal changed)');
  }
  if (reasons.length === 0) reasons.push('differing lines could not be field-classified — treated as incompatible');
  if (severity !== 'additive' && !reasons.some((r) => r.includes('incompatible') || true)) {
    // no-op guard, severity already set correctly above
  }
  return { severity, reasons };
}

// --- Render markdown ---
const lines = [];
const push = (s = '') => lines.push(s);

push('# Type Promotion Diff Report (Task A1)');
push('');
push(`Generated: ${new Date().toISOString()}`);
push('');
push('## Version Decision (surfaced, not finalized)');
push('');

let incompatibleCount = 0;
const incompatibleList = [];
const additiveOnlyDiffAdd = [];
for (const [mod, rows] of forwardResults) {
  for (const row of rows) {
    if (row.status === 'ADD' || row.status === 'DIFF') {
      const { severity, reasons } = classifyDiffSeverity(row);
      row._severity = severity;
      row._reasons = reasons;
      if (severity === 'incompatible') {
        incompatibleCount++;
        incompatibleList.push({ module: mod, name: row.name, status: row.status, reasons });
      } else {
        additiveOnlyDiffAdd.push({ module: mod, name: row.name, status: row.status, reasons });
      }
    }
  }
}

const hasInterfacesOnly = interfacesOnly.length > 0;
const verdict = incompatibleCount > 0 || hasInterfacesOnly ? 'major (11.0.0)' : 'minor (10.1.0)';

push(`- Incompatible DIFF/ADD entries: **${incompatibleCount}**`);
push(`- Purely-additive DIFF/ADD entries: **${additiveOnlyDiffAdd.length}**`);
push(`- INTERFACES_ONLY types (candidates for removal): **${interfacesOnly.length}**`);
push('');
push('Rule: minor (10.1.0) if additive-only AND no INTERFACES_ONLY removals; else major (11.0.0).');
push('');
push(`**Verdict: ${verdict}**`);
push(
  incompatibleCount > 0
    ? `  — reason: ${incompatibleCount} incompatible DIFF/ADD entr${incompatibleCount === 1 ? 'y' : 'ies'} found (required-field addition / field removal / tightened optionality / changed nested shape).`
    : hasInterfacesOnly
      ? '  — reason: no incompatible field-level diffs, but INTERFACES_ONLY entries exist; default disposition for unused params is removal, which is breaking.'
      : '  — reason: all differences are additive-optional and no INTERFACES_ONLY removals are needed.',
);
push('');

if (incompatibleList.length) {
  push('### Incompatible DIFF/ADD entries');
  push('');
  for (const it of incompatibleList) {
    push(`- \`${it.module}\`.**${it.name}** (${it.status}): ${it.reasons.join('; ')}`);
  }
  push('');
}

if (interfacesOnly.length) {
  push('### INTERFACES_ONLY types — dispositions');
  push('');
  push(
    'Default disposition: **remove** (no adt-clients core/*/types.ts consumer references it by name).',
  );
  push('Exceptions are called out explicitly where the type is legitimately consumed outside');
  push('`src/core/*/types.ts` (e.g. connection/auth/runtime/session/token infrastructure that');
  push('adt-clients imports directly from `@mcp-abap-adt/interfaces`, not via core types).');
  push('');
  push('| Type | Found in | Disposition |');
  push('| --- | --- | --- |');
  const INFRA_HINT_RE = /^(src\/(auth|connection|runtime|token|storage|session|validation|sap|feeds|execution|service|utils)\/)/;
  for (const t of interfacesOnly) {
    const infra = t.files.some((f) => INFRA_HINT_RE.test(f));
    const disposition = infra
      ? 'KEEP — infrastructure type (auth/connection/runtime/token/session/etc.), not a core CRUD leftover; adt-clients consumes it outside core/*/types.ts'
      : 'REMOVE — stale core-CRUD-shaped export with no adt-clients core/*/types.ts consumer';
    push(`| \`${t.name}\` | ${t.files.join(', ')} | ${disposition} |`);
  }
  push('');
}

push('---');
push('');

// Per-module tables
for (const [mod, rows] of forwardResults) {
  push(`## Module: \`${mod}\``);
  push('');
  push('| Type | Status | Notes |');
  push('| --- | --- | --- |');
  for (const row of rows) {
    let notes = '';
    if (row.status === 'MATCH') {
      notes = `found in: ${row.files.join(', ')}`;
    } else if (row.status === 'ADD') {
      notes = 'not found anywhere in interfaces src/';
    } else if (row.status === 'DIFF') {
      notes = `found in: ${row.files.join(', ')}; severity: **${row._severity}**`;
    }
    push(`| \`${row.name}\` | ${row.status} | ${notes} |`);
  }
  push('');

  const diffRows = rows.filter((r) => r.status === 'DIFF');
  if (diffRows.length) {
    push('### DIFF details');
    push('');
    for (const row of diffRows) {
      push(`#### \`${row.name}\` (in \`${row.files.join(', ')}\`)`);
      push('');
      push(`Severity: **${row._severity}** — ${row._reasons.join('; ')}`);
      push('');
      if (row.onlyInClients.length) {
        push('Lines only in adt-clients (source of truth):');
        push('```ts');
        for (const l of row.onlyInClients) push(l);
        push('```');
      }
      if (row.onlyInInterfaces.length) {
        push('Lines only in interfaces:');
        push('```ts');
        for (const l of row.onlyInInterfaces) push(l);
        push('```');
      }
      push('');
    }
  }
  push('');
}

push('---');
push('');
push('## INTERFACES_ONLY (full list)');
push('');
if (interfacesOnly.length === 0) {
  push('None.');
} else {
  push('| Type | Found in |');
  push('| --- | --- |');
  for (const t of interfacesOnly) {
    push(`| \`${t.name}\` | ${t.files.join(', ')} |`);
  }
}
push('');

push('---');
push('');
push('## Totals');
push('');
push(`- ADD: ${totalAdd}`);
push(`- MATCH: ${totalMatch}`);
push(`- DIFF: ${totalDiff}`);
push(`- INTERFACES_ONLY: ${interfacesOnly.length}`);
push('');

process.stdout.write(lines.join('\n') + '\n');
