// Exercises the publish path of tools/publish-changed.js without publishing.
//
// Everything up to the publish is covered by running the script against the real
// repository, but what it does with npm — the arguments, the order, stopping
// after a failure, and the poll that asks whether the registry serves what was
// just sent — only happens during a real `npm publish`. That is the part a
// botched release would hit first, so it is exercised here instead.
//
// Each case builds a throwaway git repository, copies the script into it (the
// script takes its root from its own location, so a fixture repo is the only way
// to run it against anything but this one), and puts a fake `npm` first on PATH.
// The fake records every argv and answers from a JSON state file. `git` is not
// shadowed: the guards run for real.
//
//   node tools/test-publish-changed.js
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'tools', 'publish-changed.js');
const SEMVER = path.join(ROOT, 'node_modules', 'semver');
// Read on demand, never at load: reading it here threw MODULE_NOT_FOUND before
// the explicit "run npm ci" check below could report the same thing in words.
const declaredSemverVersion = () =>
  JSON.parse(fs.readFileSync(path.join(SEMVER, 'package.json'), 'utf8'))
    .version;

const git = (cwd, args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });

/**
 * A repository with `packages` ({ dir, version }) in that order, each committed
 * and tagged the way tagFor() expects, plus the script and a fake npm.
 */
function fixture(packages) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-changed-'));

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify(
      {
        name: 'fixture',
        private: true,
        workspaces: packages.map((p) => `packages/${p.dir}`),
      },
      null,
      2,
    ),
  );

  for (const p of packages) {
    const pkgDir = path.join(dir, 'packages', p.dir);
    fs.mkdirSync(pkgDir, { recursive: true });
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify(
        { name: `@fixture/${p.dir}`, version: p.version },
        null,
        2,
      ),
    );
  }

  fs.mkdirSync(path.join(dir, 'tools'));
  fs.copyFileSync(SCRIPT, path.join(dir, 'tools', 'publish-changed.js'));

  // Only `semver` is linked, and only into the fixture's own node_modules, so
  // the copied script resolves the dependency this repository declares.
  //
  // Symlinking the whole node_modules looked equivalent and was not: when the
  // repository's copy is missing, node walks past the empty link and resolves
  // whatever an ancestor of the temporary directory happens to hold. On this
  // machine /tmp/node_modules holds a stray semver, so the suite passed with the
  // declared dependency uninstalled — green, and meaningless.
  if (!fs.existsSync(SEMVER))
    throw new Error(
      `${SEMVER} is missing. Run npm ci: this suite must resolve the semver this` +
        ' repository declares, never one that happens to be installed elsewhere.',
    );
  fs.mkdirSync(path.join(dir, 'node_modules'));
  fs.symlinkSync(SEMVER, path.join(dir, 'node_modules', 'semver'));

  git(dir, ['init', '-q']);
  git(dir, ['config', 'user.email', 'test@example.com']);
  git(dir, ['config', 'user.name', 'test']);
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'fixture']);
  for (const p of packages) git(dir, ['tag', `${p.dir}-v${p.version}`]);

  return dir;
}

/**
 * The fake npm: records argv, answers from state, and publishes into state.
 *
 * Its files live outside the fixture repository. Putting them inside left the
 * tree dirty after the fixture commit, and the script's first guard refused the
 * run — correctly, which is how this was found.
 */
function installFakeNpm(_dir, state) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-changed-npm-'));
  const bin = path.join(home, 'bin');
  fs.mkdirSync(bin);
  const statePath = path.join(home, 'npm-state.json');
  const logPath = path.join(home, 'npm-log.jsonl');
  fs.writeFileSync(statePath, JSON.stringify(state));
  fs.writeFileSync(logPath, '');

  fs.writeFileSync(
    path.join(bin, 'npm'),
    `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(logPath)}, JSON.stringify(args) + '\\n');
const statePath = ${JSON.stringify(statePath)};
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

if (args[0] === 'view') {
  const name = args[1];
  const field = args[2];
  const versions = state.versions[name] ?? null;
  if (versions === null) {
    process.stderr.write('npm error code E404\\n');
    process.exit(1);
  }
  if (field === 'versions') process.stdout.write(JSON.stringify(versions));
  else process.stdout.write(JSON.stringify({ latest: versions[versions.length - 1] }));
  process.exit(0);
}

if (args[0] === 'run' && args[1] === 'check') process.exit(state.failCheck ? 1 : 0);

if (args[0] === 'publish') {
  const name = args[args.indexOf('--workspace') + 1];
  if (state.failPublish === name) process.exit(1);
  if (!state.neverServe) {
    const local = JSON.parse(
      fs.readFileSync(state.manifests[name], 'utf8'),
    ).version;
    state.versions[name] = [...(state.versions[name] ?? []), local];
    fs.writeFileSync(statePath, JSON.stringify(state));
  }
  process.exit(0);
}

process.stderr.write('fake npm: unexpected ' + JSON.stringify(args) + '\\n');
process.exit(1);
`,
  );
  fs.chmodSync(path.join(bin, 'npm'), 0o755);
  return { bin, logPath };
}

function run(dir, bin, args = []) {
  return spawnSync(
    process.execPath,
    [path.join(dir, 'tools', 'publish-changed.js'), ...args],
    {
      cwd: dir,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${bin}${path.delimiter}${process.env.PATH}`,
        PUBLISH_POLL_ATTEMPTS: '3',
        PUBLISH_POLL_MS: '1',
      },
    },
  );
}

const readLog = (logPath) =>
  fs
    .readFileSync(logPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));

const publishes = (log) =>
  log.filter((args) => args[0] === 'publish').map((args) => args.join(' '));

const failures = [];
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.log(`FAIL  ${name}`);
  }
};

// --- cases ----------------------------------------------------------------

check('the fixture resolves the semver this repository declares', () => {
  const dir = fixture([{ dir: 'alpha', version: '1.0.0' }]);
  const probe = path.join(dir, 'tools', 'probe.js');
  fs.writeFileSync(
    probe,
    "console.log(JSON.stringify({ path: require.resolve('semver'), version: require('semver/package.json').version }));",
  );
  const result = spawnSync(process.execPath, [probe], {
    cwd: dir,
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  const { path: resolved, version } = JSON.parse(result.stdout);
  // node resolves symlinks, so the answer is the realpath of the link's target,
  // not a path under the fixture. What matters is WHICH copy that is: this
  // repository's, rather than one an ancestor of the temporary directory holds.
  assert.ok(
    resolved.startsWith(fs.realpathSync(SEMVER) + path.sep),
    `resolved ${resolved}, which is not ${fs.realpathSync(SEMVER)}`,
  );
  assert.strictEqual(version, declaredSemverVersion());
});

check('publishes every pending package, in workspace order', () => {
  const dir = fixture([
    { dir: 'alpha', version: '1.1.0' },
    { dir: 'beta', version: '2.1.0' },
  ]);
  const { bin, logPath } = installFakeNpm(dir, {
    versions: { '@fixture/alpha': ['1.0.0'], '@fixture/beta': ['2.0.0'] },
    manifests: {
      '@fixture/alpha': path.join(dir, 'packages/alpha/package.json'),
      '@fixture/beta': path.join(dir, 'packages/beta/package.json'),
    },
  });

  const result = run(dir, bin);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  assert.deepStrictEqual(publishes(readLog(logPath)), [
    'publish --workspace @fixture/alpha --ignore-scripts',
    'publish --workspace @fixture/beta --ignore-scripts',
  ]);
  assert.match(result.stdout, /Published 2 package\(s\)/);
});

check('passes --tag through to npm publish', () => {
  const dir = fixture([{ dir: 'alpha', version: '1.1.0-beta.1' }]);
  const { bin, logPath } = installFakeNpm(dir, {
    versions: { '@fixture/alpha': ['1.0.0'] },
    manifests: {
      '@fixture/alpha': path.join(dir, 'packages/alpha/package.json'),
    },
  });

  const result = run(dir, bin, ['--tag=next']);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  assert.deepStrictEqual(publishes(readLog(logPath)), [
    'publish --workspace @fixture/alpha --ignore-scripts --tag next',
  ]);
});

check('a failed publish stops the run before the next package', () => {
  const dir = fixture([
    { dir: 'alpha', version: '1.1.0' },
    { dir: 'beta', version: '2.1.0' },
  ]);
  const { bin, logPath } = installFakeNpm(dir, {
    versions: { '@fixture/alpha': ['1.0.0'], '@fixture/beta': ['2.0.0'] },
    manifests: {
      '@fixture/alpha': path.join(dir, 'packages/alpha/package.json'),
      '@fixture/beta': path.join(dir, 'packages/beta/package.json'),
    },
    failPublish: '@fixture/alpha',
  });

  const result = run(dir, bin);
  assert.strictEqual(result.status, 1);
  assert.match(
    result.stderr,
    /did not publish\. Later packages were not attempted/,
  );
  assert.deepStrictEqual(publishes(readLog(logPath)), [
    'publish --workspace @fixture/alpha --ignore-scripts',
  ]);
});

check('a version the registry never serves fails the run', () => {
  const dir = fixture([{ dir: 'alpha', version: '1.1.0' }]);
  const { bin } = installFakeNpm(dir, {
    versions: { '@fixture/alpha': ['1.0.0'] },
    manifests: {
      '@fixture/alpha': path.join(dir, 'packages/alpha/package.json'),
    },
    neverServe: true,
  });

  const result = run(dir, bin);
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /the registry does not serve it/);
});

check('a failing check publishes nothing', () => {
  const dir = fixture([{ dir: 'alpha', version: '1.1.0' }]);
  const { bin, logPath } = installFakeNpm(dir, {
    versions: { '@fixture/alpha': ['1.0.0'] },
    manifests: {
      '@fixture/alpha': path.join(dir, 'packages/alpha/package.json'),
    },
    failCheck: true,
  });

  const result = run(dir, bin);
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /npm run check failed\. Nothing was published/);
  assert.deepStrictEqual(publishes(readLog(logPath)), []);
});

check('a package the registry has never seen is publishable', () => {
  const dir = fixture([{ dir: 'alpha', version: '1.0.0' }]);
  const { bin, logPath } = installFakeNpm(dir, {
    versions: {},
    manifests: {
      '@fixture/alpha': path.join(dir, 'packages/alpha/package.json'),
    },
  });

  const result = run(dir, bin);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  assert.deepStrictEqual(publishes(readLog(logPath)), [
    'publish --workspace @fixture/alpha --ignore-scripts',
  ]);
});

if (failures.length) {
  console.error(`\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(
  'publish path: arguments, order, failure handling and the registry poll',
);
