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
//   (`IAdtError`, `IAbapGitStructuredError`) must answer `IAdtResponse<…, E |
//   <that constraint>>` wherever its return type names `IAdtResponse<…, E>`;
// - its `E` has no default: a defaulted `E` lets a caller name the error type
//   and pass no `analyse`;
// - and the interface declares a plain overload of the same name, with no
//   error type parameter.
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
for (const file of tsFiles(SRC)) {
  const sf = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const where = (node) =>
    `${path.relative(path.join(__dirname, '..'), file)}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}`;
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      const members = node.members.filter(ts.isMethodSignature);
      for (const member of members) {
        const errorParams = (member.typeParameters ?? []).filter(
          (tp) =>
            tp.constraint &&
            ts.isTypeReferenceNode(tp.constraint) &&
            ERROR_TYPES.has(tp.constraint.typeName.getText(sf)),
        );
        for (const tp of errorParams) {
          checked += 1;
          const name = tp.name.text;
          const constraint = tp.constraint.getText(sf);
          if (tp.default) {
            problems.push(
              `${where(member)} ${member.name.getText(sf)}: \`${name}\` has a default, so a generic call needs no \`analyse\``,
            );
          }
          const isErrorParam = (tp) =>
            tp.constraint &&
            ts.isTypeReferenceNode(tp.constraint) &&
            ERROR_TYPES.has(tp.constraint.typeName.getText(sf));
          const plain = members.some(
            (other) =>
              other !== member &&
              other.name.getText(sf) === member.name.getText(sf) &&
              !(other.typeParameters ?? []).some(isErrorParam),
          );
          if (!plain) {
            problems.push(
              `${where(member)} ${member.name.getText(sf)}: no plain overload beside the generic one`,
            );
          }
          const inspect = (t) => {
            if (
              ts.isTypeReferenceNode(t) &&
              t.typeName.getText(sf) === 'IAdtResponse' &&
              t.typeArguments?.length === 2
            ) {
              const error = t.typeArguments[1];
              const mentions =
                error.getText(sf) === name ||
                (ts.isUnionTypeNode(error) &&
                  error.types.some((x) => x.getText(sf) === name));
              if (mentions && !unionWith(error, name, constraint, sf)) {
                problems.push(
                  `${where(t)} ${member.name.getText(sf)}: answers \`${error.getText(sf)}\`, not \`${name} | ${constraint}\``,
                );
              }
            }
            ts.forEachChild(t, inspect);
          };
          if (member.type) inspect(member.type);
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
