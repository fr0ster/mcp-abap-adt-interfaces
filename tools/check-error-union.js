// Every generic member of `interfaces-adt` answers the library's error too,
// and comes with its plain overload.
//   node tools/check-error-union.js
//
// **Why a check over the source, not a type test.** A type-level test cannot
// tell `IAdtResponse<T, E>` from `IAdtResponse<T, E | IAdtError>` once `E` is
// instantiated at its constraint — both read `IAdtResponse<T, IAdtError>`. So
// this reads the declarations themselves (32.0.0, adt-clients #304), with the
// TypeScript compiler API and no pattern over text:
//
// - a member whose type parameter `E` is constrained to an error type
//   (`IAdtError`, `IAbapGitStructuredError`) answers `IAdtResponse<…, E |
//   <that constraint>>` in every `IAdtResponse` its return type names, and
//   names at least one;
// - its `E` has no default, and its options parameter requires `analyse`: a
//   generic call cannot name the error type without the strategy;
// - and for every distinct generic signature the interface declares a plain
//   one with the same leading parameters, counted one for one, so removing
//   one plain overload of several is caught.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'packages', 'interfaces-adt', 'src');
const ERROR_TYPES = new Set(['IAdtError', 'IAbapGitStructuredError']);

function tsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__typechecks__' ? [] : tsFiles(f);
    return f.endsWith('.ts') ? [f] : [];
  });
}

/** Whether `type` is `E | C` (in either order) for the constraint `C`. */
function unionWith(type, name, constraint, sf) {
  if (!ts.isUnionTypeNode(type) || type.types.length !== 2) return false;
  const texts = type.types.map((t) => t.getText(sf));
  return texts.includes(name) && texts.includes(constraint);
}

const problems = [];
let checked = 0;

const isErrorParam = (tp, sf) =>
  Boolean(
    tp.constraint &&
      ts.isTypeReferenceNode(tp.constraint) &&
      ERROR_TYPES.has(tp.constraint.typeName.getText(sf)),
  );

/**
 * What tells two overloads of one member apart: every parameter but the last
 * (the options, which differ by design between the pair), by type text.
 */
const shapeOf = (member, sf) =>
  member.parameters
    .slice(0, -1)
    .map((p) => {
      // `x?: T` and `x: T | undefined` are one shape: a plain overload makes
      // optional what its generic twin must name.
      if (!p.type) return '?';
      const types = ts.isUnionTypeNode(p.type) ? p.type.types : [p.type];
      return types
        .filter((t) => t.kind !== ts.SyntaxKind.UndefinedKeyword)
        .map((t) => t.getText(sf))
        .join(' | ');
    })
    .join(' , ');

/**
 * Whether a type requires `analyse`: a property `analyse` with no `?`, in the
 * type itself or in a type alias of the same file it refers to (the runtime
 * contracts write `WithAnalyse<E, O>`).
 */
function requiresAnalyse(type, aliases, seen = new Set()) {
  let found = false;
  const walk = (t) => {
    if (ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName)) {
      const alias = aliases.get(t.typeName.text);
      if (alias && !seen.has(alias)) {
        seen.add(alias);
        if (requiresAnalyse(alias.type, aliases, seen)) found = true;
      }
    }
    if (
      ts.isPropertySignature(t) &&
      t.name &&
      ts.isIdentifier(t.name) &&
      t.name.text === 'analyse' &&
      !t.questionToken
    ) {
      found = true;
    }
    ts.forEachChild(t, walk);
  };
  walk(type);
  return found;
}

for (const file of tsFiles(SRC)) {
  const sf = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const where = (node) =>
    `${path.relative(path.join(__dirname, '..'), file)}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}`;
  const aliases = new Map();
  for (const statement of sf.statements) {
    if (ts.isTypeAliasDeclaration(statement)) {
      aliases.set(statement.name.text, statement);
    }
  }
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      const members = node.members.filter(ts.isMethodSignature);
      // The plain counterpart of every distinct generic signature, by shape.
      const plainShapes = new Map();
      for (const m of members) {
        if (!(m.typeParameters ?? []).some((tp) => isErrorParam(tp, sf))) {
          const key = `${m.name.getText(sf)}(${shapeOf(m, sf)})`;
          plainShapes.set(key, (plainShapes.get(key) ?? 0) + 1);
        }
      }
      for (const member of members) {
        const errorParams = (member.typeParameters ?? []).filter((tp) =>
          isErrorParam(tp, sf),
        );
        for (const tp of errorParams) {
          checked += 1;
          const label = member.name.getText(sf);
          const name = tp.name.text;
          const constraint = tp.constraint.getText(sf);
          if (tp.default) {
            problems.push(
              `${where(member)} ${label}: \`${name}\` has a default, so a generic call needs no \`analyse\``,
            );
          }
          const last = member.parameters[member.parameters.length - 1];
          if (
            !last ||
            last.questionToken ||
            !last.type ||
            !requiresAnalyse(last.type, aliases)
          ) {
            problems.push(
              `${where(member)} ${label}: the generic overload does not require \`analyse\``,
            );
          }
          const key = `${label}(${shapeOf(member, sf)})`;
          const left = plainShapes.get(key) ?? 0;
          if (left === 0) {
            problems.push(
              `${where(member)} ${label}: no plain overload of the same parameters beside the generic one`,
            );
          } else {
            plainShapes.set(key, left - 1);
          }
          let answers = 0;
          const inspect = (t) => {
            if (
              ts.isTypeReferenceNode(t) &&
              t.typeName.getText(sf) === 'IAdtResponse'
            ) {
              answers += 1;
              const error = t.typeArguments?.[1];
              if (!(error && unionWith(error, name, constraint, sf)))
                problems.push(
                  `${where(t)} ${label}: answers \`${t.getText(sf)}\`, not one whose error is \`${name} | ${constraint}\``,
                );
            }
            ts.forEachChild(t, inspect);
          };
          if (member.type) inspect(member.type);
          if (answers === 0) {
            problems.push(
              `${where(member)} ${label}: the generic overload answers no \`IAdtResponse\``,
            );
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

if (problems.length > 0) {
  for (const p of problems) console.error(p);
  console.error(`${problems.length} problem(s)`);
  process.exit(1);
}
console.log(
  `error union: ${checked} generic member(s) answer the library's error and have a plain overload`,
);
