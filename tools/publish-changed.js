// Publishes exactly the packages whose version is not on the registry yet.
//
// Publishing every workspace by hand republishes what has not changed, and npm
// answers each of those with "You cannot publish over the previously published
// versions". Those lines are not harmless: four of them scrolling past teach the
// eye to skip the fifth, which is a real failure. So nothing already published is
// ever attempted, and any error at all stops the run.
//
// It also runs `npm run check` ONCE. Publishing five workspaces ran every
// package's prepublishOnly, which is the same full check five times over; the
// publishes here pass --ignore-scripts because the check has already run.
//
//   npm run release:publish
//   npm run release:publish -- --dry-run
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

/** Sleep without going async, so the whole run stays a readable sequence. */
const sleep = (ms) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** Captured output; for commands whose result this script reads. */
const capture = (cmd, args, options = {}) =>
  execFileSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });

/**
 * Inherited stdio; for commands the operator must see and answer.
 * `npm publish` prompts for two-factor authentication and waits on ENTER —
 * piping its stdio would hang the run with the prompt invisible.
 */
const interactive = (cmd, args) =>
  execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });

const fail = (message) => {
  console.error(`\npublish: ${message}`);
  process.exit(1);
};

/** Every version of a package on the registry; [] when it has none. */
function publishedVersions(name) {
  let out;
  try {
    // --prefer-online: npm's metadata cache answered a just-published version
    // with the previous one, which is indistinguishable from a failed publish.
    out = capture('npm', [
      'view',
      name,
      'versions',
      '--json',
      '--prefer-online',
    ]);
  } catch (error) {
    const text = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    if (text.includes('E404')) return [];
    throw error;
  }
  const parsed = JSON.parse(out);
  return Array.isArray(parsed) ? parsed : [parsed];
}

/** The release tag this package's version is published from. */
function tagFor(dir, version) {
  return dir === 'interfaces' ? `v${version}` : `${dir}-v${version}`;
}

function tagExists(tag) {
  try {
    capture('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`]);
    return true;
  } catch {
    return false;
  }
}

function tagIsAncestorOfHead(tag) {
  try {
    capture('git', ['merge-base', '--is-ancestor', tag, 'HEAD']);
    return true;
  } catch {
    return false;
  }
}

// --- the plan -------------------------------------------------------------

// The workspaces array is in dependency order, and publishing follows it: a
// package must never reach the registry before something it depends on.
const { workspaces } = readJson(path.join(ROOT, 'package.json'));

const plan = workspaces.map((workspace) => {
  const dir = path.basename(workspace);
  const manifest = readJson(path.join(ROOT, workspace, 'package.json'));
  const versions = publishedVersions(manifest.name);
  return {
    dir,
    name: manifest.name,
    local: manifest.version,
    versions,
    published: versions.includes(manifest.version),
  };
});

const width = Math.max(...plan.map((p) => p.name.length));
console.log(`${'PACKAGE'.padEnd(width)}  LOCAL       REGISTRY    ACTION`);
for (const p of plan) {
  const latest = p.versions.at(-1) ?? 'none';
  const action = p.published ? 'up to date' : 'PUBLISH';
  console.log(
    `${p.name.padEnd(width)}  ${p.local.padEnd(10)}  ${latest.padEnd(10)}  ${action}`,
  );
}

const pending = plan.filter((p) => !p.published);

if (pending.length === 0) {
  console.log('\nNothing to publish: every local version is on the registry.');
  process.exit(0);
}

// --- the guards -----------------------------------------------------------
//
// Each one refuses to publish something that cannot be traced back to this
// repository's history.

if (capture('git', ['status', '--porcelain']).trim() !== '')
  fail(
    'the working tree is dirty. Publish only what is committed, or the tarball\n' +
      'holds changes no commit and no tag describes.',
  );

for (const p of pending) {
  const tag = tagFor(p.dir, p.local);
  if (!tagExists(tag))
    fail(
      `${p.name} ${p.local} has no tag ${tag}.\n` +
        'A published version that is not tagged cannot be checked out again.',
    );
  if (!tagIsAncestorOfHead(tag))
    fail(
      `${tag} is not an ancestor of HEAD.\n` +
        'HEAD would publish something the tagged release does not contain.',
    );
  const newer = p.versions.filter(
    (v) => v.localeCompare(p.local, undefined, { numeric: true }) > 0,
  );
  if (newer.length > 0)
    fail(
      `${p.name} ${p.local} is older than the published ${newer.at(-1)}.\n` +
        'Publishing it would move the latest tag backwards.',
    );
}

console.log(
  `\nTo publish, in dependency order: ${pending.map((p) => `${p.name}@${p.local}`).join(', ')}`,
);

if (DRY_RUN) {
  console.log('--dry-run: nothing was published.');
  process.exit(0);
}

// --- the gate, once -------------------------------------------------------

console.log('\nRunning npm run check once for the whole release.\n');
try {
  interactive('npm', ['run', 'check']);
} catch {
  fail('npm run check failed. Nothing was published.');
}

// --- publish --------------------------------------------------------------

for (const p of pending) {
  console.log(`\nPublishing ${p.name}@${p.local}\n`);
  try {
    // --ignore-scripts: prepublishOnly is `npm run check`, which just ran. It
    // stays in each package.json as the net for a publish by hand.
    interactive('npm', ['publish', '--workspace', p.name, '--ignore-scripts']);
  } catch {
    fail(
      `${p.name}@${p.local} did not publish. Later packages were not attempted.`,
    );
  }

  // The publish printing "+ name@version" is npm reporting what it sent, not
  // the registry reporting what it serves. Ask the registry.
  let serving = false;
  for (let attempt = 1; attempt <= 10 && !serving; attempt += 1) {
    serving = publishedVersions(p.name).includes(p.local);
    if (!serving) sleep(3000);
  }
  if (!serving)
    fail(
      `${p.name}@${p.local} was published but the registry does not serve it after 30s.\n` +
        'Check it before publishing anything that depends on it.',
    );
  console.log(`${p.name}@${p.local} is on the registry.`);
}

console.log(`\nPublished ${pending.length} package(s).`);
