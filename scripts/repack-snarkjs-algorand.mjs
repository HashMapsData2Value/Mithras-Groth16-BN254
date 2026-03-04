#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  if (res.status !== 0) {
    fail(`Command failed: ${cmd} ${args.join(' ')} (cwd=${cwd})`);
  }
}

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function writeText(p, s) {
  fs.writeFileSync(p, s, 'utf8');
}

function replaceOrFail(filePath, replacers) {
  let content = readText(filePath);
  let changed = false;

  for (const { name, search, replace } of replacers) {
    const next = content.replace(search, replace);
    if (next === content) {
      fail(`Patch '${name}' did not apply to ${filePath}`);
    }
    content = next;
    changed = true;
  }

  if (changed) writeText(filePath, content);
}

const repoRoot = process.cwd();
const inTgz = process.argv[2]
  ? path.resolve(repoRoot, process.argv[2])
  : path.resolve(repoRoot, 'snarkjs-algorand-0.12.0.tgz');

if (!fs.existsSync(inTgz)) {
  fail(`Input tgz not found: ${inTgz}`);
}

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snarkjs-algorand-repack-'));
const extractDir = path.join(workDir, 'extract');
fs.mkdirSync(extractDir, { recursive: true });

// Extract
run('tar', ['-xzf', inTgz, '-C', extractDir], repoRoot);

const pkgDir = path.join(extractDir, 'package');
const distDir = path.join(pkgDir, 'dist');
if (!fs.existsSync(distDir)) {
  fail(`Unexpected tgz layout; missing: ${distDir}`);
}

// Runtime patch: allow passing precompiled verifier LogicSig program bytes so
// verificationParams() does NOT call lsigAccount() -> ensureCurveInstantiation() -> WASM.
const jsFiles = [
  'index.js',
  'index.cjs',
  'index.native.js',
  'index.native.cjs',
].map((f) => path.join(distDir, f));

for (const f of jsFiles) {
  if (!fs.existsSync(f)) continue;

  replaceOrFail(f, [
    {
      name: 'lsig sender injection',
      search: /sender:\s*await this\.lsigAccount\(\),/g,
      replace:
        'sender: args.lsigSender ?? (args.lsigProgram ? this.algorand.account.logicsig(args.lsigProgram, args.lsigArgs) : await this.lsigAccount()),',
    },
  ]);
}

// Type patch: extend LsigVerificationArgs with optional lsigProgram/lsigSender.
const dtsFiles = ['index.d.ts', 'index.d.cts'].map((f) => path.join(distDir, f));
for (const f of dtsFiles) {
  if (!fs.existsSync(f)) continue;

  replaceOrFail(f, [
    {
      name: 'add lsigProgram fields',
      // Insert right after addExtraLsigs?: boolean;
      search: /addExtraLsigs\?: boolean;\s*/,
      replace:
        'addExtraLsigs?: boolean;\n    /** Precompiled verifier LogicSig program bytes. When provided, verificationParams will not call lsigAccount() (no curve/WASM). */\n    lsigProgram?: Uint8Array;\n    /** Optional (binary) arguments for the verifier LogicSig. */\n    lsigArgs?: Array<Uint8Array>;\n    /** Optional pre-built LogicSig sender wrapper (e.g. from algorand.account.logicsig(...)). */\n    lsigSender?: Address & _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount & {\n        account: algosdk.LogicSigAccount;\n    };\n    ',
    },
  ]);
}

// Repack
run('npm', ['pack', '--silent'], pkgDir);

// Find the output tgz
const packed = fs
  .readdirSync(pkgDir)
  .filter((n) => n.endsWith('.tgz'))
  .map((n) => path.join(pkgDir, n))
  .sort();

if (packed.length !== 1) {
  fail(`Expected exactly 1 packed tgz in ${pkgDir}, found: ${packed.join(', ')}`);
}

const outTgz = packed[0];
const outName = path.basename(outTgz);

const targets = [
  path.resolve(repoRoot, outName),
  path.resolve(repoRoot, 'packages/mithras-contracts-and-circuits', outName),
  path.resolve(repoRoot, 'packages/mithras-subscriber', outName),
  path.resolve(repoRoot, 'mithras-mobile/react-native', outName),
];

for (const t of targets) {
  const dir = path.dirname(t);
  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(t)) {
    const bak = `${t}.bak`;
    fs.copyFileSync(t, bak);
  }

  fs.copyFileSync(outTgz, t);
  console.log(`Wrote ${t}`);
}

console.log('\nDone. This build makes verificationParams() Hermes-safe when you pass { lsigProgram, proof, signals }.');
console.log('Example usage:\n  await verifier.verificationParams({ composer, proof, signals, lsigProgram, paramsCallback })');
