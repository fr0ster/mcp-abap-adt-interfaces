// Publishes exactly the packages whose version is not on the registry yet.
//
// Publishing every workspace by hand republishes what has not changed, and npm
// answers each of those with "You cannot publish over the previously published
// versions". Those lines are not harmless: four of them scrolling past teach the
// eye to skip the fifth, which is a real failure. So nothing already published is
// ever attempted, and a publish that errors stops the run.
//
// **A slow registry read does not stop it.** This waited for each version to be
// SERVED before publishing the next package, on the reasoning that nothing
// should go out depending on a version that might not exist. Three releases in
// two days ended the same way: the first package published, the read-through
// took longer than the wait, the run exited, and the second package was never
// attempted. A half-published release, caused entirely by the safeguard.
//
// The wait bought nothing the next publish needs. `npm run check` runs ONCE,
// before any of this, over tarballs built here; it never reads the registry.
// And `npm publish` uploads a tarball, it does not resolve the ranges in the
// manifest it uploads, so publishing B never asks whether A is being served.
// What reads those ranges is a consumer installing afterwards, and by then the
// question is whether A is on the registry at all -- which the verification at
// the end answers, for every package at once.
//
// So: publish everything, then verify everything. A version the registry has
// not served by the end is reported by name and exits 2, distinct from a
// publish that failed. Nothing is lost either way, because re-running skips
// whatever is already there.
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

// How long to wait, at the END of the run, for the registry to serve what was
// just published. Only tools/test-publish-changed.js overrides these, so that
// the case where the registry never serves a version does not take the full
// wait.
//
// 40 x 3s = 120s, and the number matters far less than it used to: this wait no
// longer stands between two publishes, so exceeding it costs a report rather
// than a release. Measured lag, every time after a publish that succeeded: 30s
// (interfaces-auth 1.1.0, 2026-09-20), and over 60s twice on 2026-09-21. Each
// bounds the lag from below only, since the version was being served by the
// time anyone looked again.
const POLL_ATTEMPTS = Number(process.env.PUBLISH_POLL_ATTEMPTS ?? 40);
const POLL_MS = Number(process.env.PUBLISH_POLL_MS ?? 3000);
// A zero, negative or non-numeric override would silently remove the wait, and
// the check it exists for would report a version the registry has not served.
// Attempts are counted, so a fraction is a mistake rather than a shorter wait.
if (!Number.isInteger(POLL_ATTEMPTS) || POLL_ATTEMPTS <= 0) {
  console.error('\npublish: PUBLISH_POLL_ATTEMPTS must be a positive integer.');
  process.exit(1);
}
if (!Number.isFinite(POLL_MS) || POLL_MS <= 0) {
  console.error('\npublish: PUBLISH_POLL_MS must be a positive number.');
  process.exit(1);
}

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

/** The most recent read failure, for the report to quote. */
let lastReadFailure = null;

/**
 * Whether the registry serves this version: `true`, `false`, or `null` for
 * "could not be asked".
 *
 * **Three answers, because there are three states.** `registryJson` turns only
 * `E404` into an answer and rethrows everything else, which is right while
 * planning — publishing on the strength of a read that failed is exactly the
 * mistake to avoid. After publishing it is wrong: a timeout, a 5xx or a reset
 * would come out of the verification loop as an unhandled throw, exiting 1
 * with a stack trace on a release where every publish succeeded — the very
 * code this run uses for "a publish failed".
 *
 * So a read failure here is a third state that keeps its own message. Nothing
 * is republished on the strength of it either way.
 */
function servesVersion(name, version) {
  try {
    return publishedVersions(name).includes(version);
  } catch (error) {
    lastReadFailure = error?.message ?? String(error);
    return null;
  }
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

if (pending.length > 1)
  console.log(
    `\n${pending.length} packages will be published one after another, and npm asks for\n` +
      'two-factor authentication each time. Each prompt waits for you; a prompt that\n' +
      'times out fails that package and stops the run, leaving the ones before it\n' +
      'published. Re-running resumes — they show as up to date.',
  );

console.log('\nRunning npm run check once for the whole release.\n');
try {
  interactive('npm', ['run', 'check']);
} catch {
  fail('npm run check failed. Nothing was published.');
}

// --- publish --------------------------------------------------------------

// Every package goes out before anything is verified. What made a slow read
// fatal was doing both in one loop; see the note at the top of this file.
const published = [];

for (const p of pending) {
  console.log(`\nPublishing ${p.name}@${p.local}\n`);
  let refused = false;
  try {
    // --ignore-scripts: prepublishOnly is `npm run check`, which just ran. It
    // stays in each package.json as the net for a publish by hand.
    const args = ['publish', '--workspace', p.name, '--ignore-scripts'];
    if (NPM_TAG !== null) args.push('--tag', NPM_TAG);
    interactive('npm', args);
  } catch {
    refused = true;
  }

  // **A refused publish is not yet a failed one.** The likeliest reason to be
  // here on a re-run is that the version IS published and the read that built
  // the plan was stale: the registry's read path lags its write path by
  // minutes, which is the whole subject of this file. npm then refuses with
  // "You cannot publish over the previously published versions", and treating
  // that as fatal would stop the run before the packages that still need
  // publishing — the same stranding, one layer down.
  //
  // So ask again, and ask the registry rather than parsing npm's message:
  // `interactive` inherits stdio so the two-factor prompt works, which means
  // there is no output here to read. A version that is now visible was
  // published, by this run or an earlier one, and either way there is nothing
  // left to do for it.
  if (refused) {
    const serves = servesVersion(p.name, p.local);
    if (serves === true) {
      console.log(
        `${p.name}@${p.local} was refused, and the registry serves it: ` +
          'already published. Continuing.',
      );
      continue;
    }
    fail(
      `${p.name}@${p.local} did not publish. Later packages were not attempted.\n` +
        (published.length === 0
          ? 'Nothing was published by this run.\n'
          : `Already published by this run: ${published
              .map((d) => `${d.name}@${d.local}`)
              .join(', ')}.\n`) +
        // **`false` and `null` are not the same finding.** One says the
        // registry does not have this version; the other says it could not be
        // asked, and a publish may well have been accepted. Reporting the
        // second as the first would tell an operator to act on a fact nobody
        // established.
        (serves === null
          ? 'The registry could not be read, so whether this version is published\n' +
            `is UNKNOWN${lastReadFailure ? `:\n  ${lastReadFailure.split('\n')[0]}` : '.'}\n` +
            'It may have been accepted. Check before doing anything else:\n' +
            `  npm view ${p.name} versions --prefer-online\n`
          : 'The registry does not serve this version either, so it is not a\n' +
            'publish that had already happened. If the two-factor prompt timed\n' +
            'out, that is all this was.\n') +
        // The advice the review caught twice: "re-run" is only safe once the
        // read path has caught up with what THIS run published. Before that,
        // those packages go back into the plan, npm refuses them, and the run
        // stops here again — which is the failure this whole file is about.
        (published.length === 0
          ? 'Re-run when the cause is dealt with: nothing is on the registry to\n' +
            'collide with.'
          : 'Before re-running, wait until each version listed above is visible:\n' +
            '  npm view <package> versions --prefer-online\n' +
            'A re-run before then puts them back in the plan, npm refuses them,\n' +
            'and the run stops here again.'),
    );
  }
  published.push(p);
}

// --- verify, once, at the end ---------------------------------------------

// The publish printing "+ name@version" is npm reporting what it SENT, not the
// registry reporting what it SERVES. Those differ for a while after a publish,
// and asking is the only way to tell a real failure from a late read.
//
// One budget for the whole release rather than one per package: the lag is the
// registry's, not each package's, and by the time the last publish is done the
// first has usually caught up. Whatever is still missing is asked about again
// each round, so nothing waits on a package ahead of it.
const waiting = published.map((p) => ({ package: p, lastAnswer: false }));
for (
  let attempt = 1;
  attempt <= POLL_ATTEMPTS && waiting.length > 0;
  attempt += 1
) {
  for (let i = waiting.length - 1; i >= 0; i -= 1) {
    const entry = waiting[i];
    entry.lastAnswer = servesVersion(entry.package.name, entry.package.local);
    if (entry.lastAnswer !== true) continue;
    console.log(
      `${entry.package.name}@${entry.package.local} is on the registry.`,
    );
    waiting.splice(i, 1);
  }
  if (waiting.length > 0) sleep(POLL_MS);
}

console.log(`\nPublished ${published.length} package(s).`);

if (waiting.length > 0) {
  // Not `fail`: nothing here went wrong. Every version was accepted, and the
  // exit code says "published, not yet visible" rather than "publish failed",
  // because those call for different next steps and looked identical before.
  const unreadable = waiting.filter((e) => e.lastAnswer === null);
  const named = waiting
    .map((e) => `  ${e.package.name}@${e.package.local}`)
    .join('\n');
  console.error(
    `\npublish: ${waiting.length} of ${published.length} IS PUBLISHED but not confirmed, ` +
      `after ${Math.round((POLL_ATTEMPTS * POLL_MS) / 1000)}s:\n` +
      `${named}\n` +
      (unreadable.length > 0
        ? 'The registry could not be read, so whether it serves them is unknown' +
          `${lastReadFailure ? `:\n  ${lastReadFailure.split('\n')[0]}` : '.'}\n`
        : 'The registry accepted them; only its read path is behind.\n') +
      'Nothing is lost and nothing needs publishing again. Check with:\n' +
      '  npm view <package> versions --prefer-online\n' +
      'and re-run only once that shows the version — a re-run before it would\n' +
      'put the package back in the plan and npm would refuse it.\n' +
      'PUBLISH_POLL_ATTEMPTS raises the wait.',
  );
  process.exit(2);
}
