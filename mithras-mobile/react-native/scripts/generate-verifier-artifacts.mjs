#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { Groth16Bn254LsigVerifier } from 'snarkjs-algorand';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function requireFile(p) {
  if (!fs.existsSync(p)) {
    throw new Error(`Missing required file: ${p}`);
  }
}

async function main() {
  // Run from mithras-mobile/react-native
  const projectRoot = path.resolve(__dirname, '..');
  const assetsKeysDir = path.join(projectRoot, 'assets', 'keys');

  const depositZKey = path.join(assetsKeysDir, 'deposit_test.zkey');
  const depositWasm = path.join(assetsKeysDir, 'deposit.wasm');
  const spendZKey = path.join(assetsKeysDir, 'spend_test.zkey');
  const spendWasm = path.join(assetsKeysDir, 'spend.wasm');

  requireFile(depositZKey);
  requireFile(depositWasm);
  requireFile(spendZKey);
  requireFile(spendWasm);

  const algorand = AlgorandClient.defaultLocalNet();

  const depositVerifier = new Groth16Bn254LsigVerifier({
    algorand,
    zKey: depositZKey,
    wasmProver: depositWasm,
    totalLsigs: 7,
    appOffset: 1,
  });

  const spendVerifier = new Groth16Bn254LsigVerifier({
    algorand,
    zKey: spendZKey,
    wasmProver: spendWasm,
    totalLsigs: 12,
    appOffset: 1,
  });

  const depositLsig = await depositVerifier.lsigAccount();
  const spendLsig = await spendVerifier.lsigAccount();

  const depositProgram = depositLsig?.account?.lsig?.logic;
  const spendProgram = spendLsig?.account?.lsig?.logic;

  if (!(depositProgram instanceof Uint8Array) || !(spendProgram instanceof Uint8Array)) {
    throw new Error('Failed to extract LogicSig program bytes from lsigAccount()');
  }

  const depositAddr = depositLsig?.addr?.toString?.() ?? depositLsig?.toString?.();
  const spendAddr = spendLsig?.addr?.toString?.() ?? spendLsig?.toString?.();

  if (typeof depositAddr !== 'string' || typeof spendAddr !== 'string') {
    throw new Error('Failed to extract LogicSig addresses from lsigAccount()');
  }

  const out = {
    depositVerifierAddr: depositAddr,
    depositVerifierProgramB64: Buffer.from(depositProgram).toString('base64'),
    spendVerifierAddr: spendAddr,
    spendVerifierProgramB64: Buffer.from(spendProgram).toString('base64'),
    meta: {
      curve: 'bn254',
      totalLsigs: { deposit: 7, spend: 12 },
      appOffset: 1,
      generatedAt: new Date().toISOString(),
    },
  };

  const outPath = path.join(assetsKeysDir, 'verifier_artifacts.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);
  // eslint-disable-next-line no-console
  console.log(`depositVerifierAddr=${depositAddr}`);
  // eslint-disable-next-line no-console
  console.log(`spendVerifierAddr=${spendAddr}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
