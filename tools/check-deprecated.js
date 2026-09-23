// Every symbol @mcp-abap-adt/interfaces still exports is reported deprecated
// (TS6385). Run after `npm run build`.
//   node tools/check-deprecated.js
//
// **What this used to check.** Until 52.0.0 the facade forwarded the whole
// 44.0.0 contract, and this walked all of it: each moved symbol had to carry a
// `@deprecated` clause naming the package that declares it, so a consumer's
// editor told them where to go. That was the deprecation clause of decision 26
// kept honest, symbol by symbol.
//
// The facade forwards nothing now, so no moved symbol is left here to point
// anywhere, and what it declared itself went with them. The check survives
// because the package might gain an export by accident: anything that appears
// here must say it is deprecated, and the count in the summary is the evidence
// that the answer is still nothing.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { ROOT, COMPILER_OPTIONS } = require('./lib/exports');

const entry = path.join(ROOT, 'packages', 'interfaces', 'dist', 'index.d.ts');
if (!fs.existsSync(entry)) {
  console.error('the facade is not built');
  process.exit(1);
}

const program = ts.createProgram([entry], COMPILER_OPTIONS);
const checker = program.getTypeChecker();
const source = program.getSourceFile(entry);
const exported = checker.getExportsOfModule(
  checker.getSymbolAtLocation(source),
);

const problems = [];
for (const symbol of exported) {
  const target =
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  const tags = [
    ...symbol.getJsDocTags(checker),
    ...target.getJsDocTags(checker),
  ];
  if (!tags.some((t) => t.name === 'deprecated'))
    problems.push(`not deprecated: ${symbol.name}`);
}

if (problems.length) {
  for (const p of problems) console.error(p);
  console.error(`${problems.length} problem(s)`);
  process.exit(1);
}

console.log(
  `deprecated: the facade exports ${exported.length} symbol(s)` +
    (exported.length ? ', all of them deprecated' : ' — nothing to deprecate'),
);
