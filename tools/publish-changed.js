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
// What it guarantees: the tarball holds the tree the release tag names. A tag
// that is merely an ancestor of HEAD does not give that — a commit after the tag
// can change a package without bumping its version, and the tarball then carries
// content the tagged version never had. So the tree must equal the tag's tree.
//
//   npm run release:publish
//   npm run release:publish -- --dry-run
//   npm run release:publish -- --tag=next     # for a prerelease version
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const semver = require('semver');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
// The npm dist-tag to publish under. Without it npm publishes to `latest`,
// which is why a prerelease requires it explicitly.
const NPM_TAG =
  process.argv.find((a) => a.startsWith('--tag='))?.slice('--tag='.length) ??
  null;
// `latest` is the tag a plain `npm publish` moves, so naming it explicitly must
// not buy anything. Both dist-tag guards key on this rather than on whether a
// --tag was passed: `--tag=latest` bypassed both when they asked the latter.
const TARGETS_LATEST = NPM_TAG === null || NPM_TAG === 'latest';

// How long to wait for the registry to serve a version it has just accepted.
// Only tools/test-publish-changed.js overrides these, so that the case where the
// registry never serves the version does not take the full wait.
const POLL_ATTEMPTS = Number(process.env.PUBLISH_POLL_ATTEMPTS ?? 10);
const POLL_MS = Number(process.env.PUBLISH_POLL_MS ?? 3000);

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

/** Asks the registry, never the cache. Returns null when it has no answer. */
function registryJson(name, field) {
  try {
    // --prefer-online: npm's metadata cache answered a just-published version
    // with the previous one, which is indistinguishable from a failed publish.
    return JSON.parse(
      capture('npm', ['view', name, field, '--json', '--prefer-online']),
    );
  } catch (error) {
    const text = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    if (text.includes('E404')) return null;
    throw error;
  }
}

/** Every version of a package on the registry; [] when it has none. */
function publishedVersions(name) {
  const parsed = registryJson(name, 'versions');
  if (parsed === null) return [];
  return Array.isArray(parsed) ? parsed : [parsed];
}

/** What the package's `latest` dist-tag points at, or null. */
function latestTag(name) {
  return registryJson(name, 'dist-tags')?.latest ?? null;
}

/** The release tag this package's version is published from. */
function tagFor(dir, version) {
  return dir === 'interfaces' ? `v${version}` : `${dir}-v${version}`;
}

/** True when `git <args>` exits 0; for the questions git answers by status. */
function gitSucceeds(args) {
  try {
    capture('git', args);
    return true;
  } catch {
    return false;
  }
}

// --- the argument ---------------------------------------------------------

// npm refuses a dist-tag that is a valid SemVer range, the empty string
// included. It refuses it at publish time, though — after the check has run and,
// in a multi-package release, after earlier packages have already gone out. A
// malformed tag should cost nothing, so it fails here instead.
if (NPM_TAG !== null && semver.validRange(NPM_TAG) !== null)
  fail(
    `--tag=${NPM_TAG === '' ? '' : NPM_TAG} is not a usable dist-tag: npm refuses a tag name that is a\n` +
      'valid SemVer range, and would refuse it only once publishing had started.',
  );

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
    latest: versions.length > 0 ? latestTag(manifest.name) : null,
    published: versions.includes(manifest.version),
  };
});

const width = Math.max(...plan.map((p) => p.name.length));
console.log(`${'PACKAGE'.padEnd(width)}  LOCAL       LATEST      ACTION`);
for (const p of plan) {
  const action = p.published ? 'up to date' : 'PUBLISH';
  console.log(
    `${p.name.padEnd(width)}  ${p.local.padEnd(10)}  ${(p.latest ?? 'none').padEnd(10)}  ${action}`,
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
// repository's history, or that would move the `latest` dist-tag backwards.

if (capture('git', ['status', '--porcelain']).trim() !== '')
  fail(
    'the working tree is dirty. Publish only what is committed, or the tarball\n' +
      'holds changes no commit and no tag describes.',
  );

for (const p of pending) {
  if (!semver.valid(p.local))
    fail(`${p.name} has version "${p.local}", which is not valid semver.`);

  const tag = tagFor(p.dir, p.local);

  if (!gitSucceeds(['rev-parse', '-q', '--verify', `refs/tags/${tag}`]))
    fail(
      `${p.name} ${p.local} has no tag ${tag}.\n` +
        'A published version that is not tagged cannot be checked out again.',
    );

  if (!gitSucceeds(['merge-base', '--is-ancestor', tag, 'HEAD']))
    fail(
      `${tag} is not an ancestor of HEAD.\n` +
        'HEAD is not the history that tag belongs to.',
    );

  // Ancestry alone is not traceability: a commit after the tag can change a
  // package without bumping it, and the tarball would then carry content the
  // tagged version never had. The tree has to BE the tagged tree.
  if (!gitSucceeds(['diff', '--quiet', tag, 'HEAD'])) {
    const changed = capture('git', ['diff', '--name-only', tag, 'HEAD'])
      .trim()
      .split('\n')
      .slice(0, 10);
    fail(
      `HEAD differs from ${tag}, so the tarball would not be what that tag names:\n` +
        `${changed.map((f) => `  ${f}`).join('\n')}\n` +
        `Publish the tagged tree (git checkout ${tag}) or bump and tag again.`,
    );
  }

  // A prerelease published without a dist-tag becomes `latest`, which is how a
  // beta reaches everyone who asked for the stable line.
  if (semver.prerelease(p.local) && TARGETS_LATEST)
    fail(
      `${p.name} ${p.local} is a prerelease and this publish targets \`latest\`\n` +
        `(${NPM_TAG === null ? 'no --tag was given' : '--tag=latest names it explicitly'}).\n` +
        'A prerelease on `latest` reaches everyone who asked for the stable line.\n' +
        'Pass --tag=next, or another name that is not `latest`.',
    );

  // Only `latest` can be moved backwards, so this asks about the dist-tag
  // rather than about the greatest version that exists.
  if (TARGETS_LATEST && p.latest !== null && semver.gt(p.latest, p.local))
    fail(
      `${p.name} ${p.local} is lower than the published latest ${p.latest}.\n` +
        'Publishing it to `latest` would move that tag backwards. Pass a --tag\n' +
        'other than `latest` to publish it somewhere else.',
    );
}

console.log(
  `\nTo publish${NPM_TAG ? ` under the "${NPM_TAG}" tag` : ''}, in dependency order: ${pending
    .map((p) => `${p.name}@${p.local}`)
    .join(', ')}`,
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
    const args = ['publish', '--workspace', p.name, '--ignore-scripts'];
    if (NPM_TAG !== null) args.push('--tag', NPM_TAG);
    interactive('npm', args);
  } catch {
    fail(
      `${p.name}@${p.local} did not publish. Later packages were not attempted.`,
    );
  }

  // The publish printing "+ name@version" is npm reporting what it sent, not
  // the registry reporting what it serves. Ask the registry.
  let serving = false;
  for (let attempt = 1; attempt <= POLL_ATTEMPTS && !serving; attempt += 1) {
    serving = publishedVersions(p.name).includes(p.local);
    if (!serving) sleep(POLL_MS);
  }
  if (!serving)
    fail(
      `${p.name}@${p.local} was published but the registry does not serve it after ` +
        `${Math.round((POLL_ATTEMPTS * POLL_MS) / 1000)}s.\n` +
        'Check it before publishing anything that depends on it.',
    );
  console.log(`${p.name}@${p.local} is on the registry.`);
}

console.log(`\nPublished ${pending.length} package(s).`);
