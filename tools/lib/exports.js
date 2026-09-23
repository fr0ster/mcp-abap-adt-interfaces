// Reads the public surface of a package entry point with the TypeScript compiler.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..', '..');

const COMPILER_OPTIONS = {
  strict: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  types: ['node'],
  typeRoots: [path.join(ROOT, 'node_modules', '@types')],
  skipLibCheck: true,
  noEmit: true,
};

function isTypeOnlyExport(symbol) {
  return (symbol.declarations ?? []).some(
    (d) =>
      ts.isExportSpecifier(d) && (d.isTypeOnly || d.parent.parent.isTypeOnly),
  );
}

/** The package directory under packages/ that declares a file, or null. */
function packageDirOf(fileName) {
  const real = fs.realpathSync(fileName);
  const m = real.match(/[\\/]packages[\\/]([^\\/]+)[\\/]/);
  return m ? m[1] : null;
}

/**
 * A declaration as a contract: its tokens, without comments, JSDoc or layout.
 * Moving a file changes its imports and JSDoc, never these tokens.
 */
function normalizedDeclaration(symbol) {
  return (symbol.declarations ?? [])
    .map((declaration) => {
      const scanner = ts.createScanner(
        ts.ScriptTarget.Latest,
        true,
        ts.LanguageVariant.Standard,
        declaration.getText(),
      );
      const tokens = [];
      for (
        let kind = scanner.scan();
        kind !== ts.SyntaxKind.EndOfFileToken;
        kind = scanner.scan()
      )
        tokens.push(scanner.getTokenText());
      return tokens.join(' ');
    })
    .sort()
    .join('\n');
}

/**
 * Every export of `entry`: its public name, whether it is usable as a value,
 * the file and package that declare what it resolves to, and that declaration
 * normalised.
 */
function exportsOf(entry, options = COMPILER_OPTIONS) {
  const program = ts.createProgram([entry], options);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  if (!source) throw new Error(`cannot read ${entry}`);
  const moduleSymbol = checker.getSymbolAtLocation(source);
  return checker
    .getExportsOfModule(moduleSymbol)
    .map((symbol) => {
      const target =
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      const declaration = target.declarations?.[0];
      const file = declaration ? declaration.getSourceFile().fileName : null;
      return {
        name: symbol.name,
        kind:
          target.flags & ts.SymbolFlags.Value && !isTypeOnlyExport(symbol)
            ? 'value'
            : 'type',
        file,
        packageDir: file ? packageDirOf(file) : null,
        declaration: normalizedDeclaration(target),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = {
  ROOT,
  COMPILER_OPTIONS,
  exportsOf,
  normalizedDeclaration,
  packageDirOf,
};
