import algosdk from 'algosdk';
import { Buffer } from '@craftzdog/react-native-buffer';
import {
  HpkeEnvelope,
  TransactionMetadata,
  UtxoSecrets,
  deriveStealthPubkey,
  bytesToNumberBE,
} from 'mithras-crypto';

import { getAlgorandClient } from '../blockchain/network';
import { storage } from './storage';
import { getShieldedAddressEntries, getShieldedSpendPublicKey, getShieldedViewKeypair } from './shWallet';
import { markUtxoSpent, setUtxoSecretsBytes, upsertUtxoRecord } from './utxoStore';

const SHIELDED_LAST_SCANNED_ROUND_KEY = 'shielded:lastScannedRound';

function readLastScannedRound(): number | undefined {
  const raw = storage.getString(SHIELDED_LAST_SCANNED_ROUND_KEY);
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}

function writeLastScannedRound(round: number): void {
  const r = Math.floor(round);
  if (!Number.isFinite(r) || r <= 0) return;

  const existing = readLastScannedRound() ?? 0;
  if (r <= existing) return;
  storage.set(SHIELDED_LAST_SCANNED_ROUND_KEY, String(r));
}

const DEPOSIT_SIGNATURE =
  'deposit(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256),byte[250],pay,txn)void';
const SPEND_SIGNATURE =
  'spend(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256),byte[250],byte[250],txn)void';

const DEPOSIT_SELECTOR = algosdk.ABIMethod.fromSignature(DEPOSIT_SIGNATURE).getSelector();
const SPEND_SELECTOR = algosdk.ABIMethod.fromSignature(SPEND_SIGNATURE).getSelector();

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

type MithrasMethodParsed =
  | {
    type: 'deposit';
    hpkeEnvelopes: HpkeEnvelope[];
    commitments: bigint[];
  }
  | {
    type: 'spend';
    hpkeEnvelopes: HpkeEnvelope[];
    commitments: bigint[];
    nullifier: bigint;
  };

function parseMithrasMethodFromArgs(args: readonly Uint8Array[]): MithrasMethodParsed | null {
  if (args.length === 0) return null;
  const selector = args[0];

  if (equalBytes(selector, DEPOSIT_SELECTOR)) {
    if (args.length !== 4) return null;
    const signals = args[1];
    if (!(signals instanceof Uint8Array) || signals.length < 34) return null;
    const commitment = signals.slice(0 + 2, 32 + 2);
    const hpkeEnvelope = HpkeEnvelope.fromBytes(args[args.length - 1]);
    return {
      type: 'deposit',
      hpkeEnvelopes: [hpkeEnvelope],
      commitments: [bytesToNumberBE(commitment)],
    };
  }

  if (equalBytes(selector, SPEND_SELECTOR)) {
    if (args.length !== 5) return null;
    const signals = args[1];
    if (!(signals instanceof Uint8Array) || signals.length < 130) return null;
    const commitment0 = signals.slice(0 + 2, 32 + 2);
    const commitment1 = signals.slice(32 + 2, 64 + 2);
    const nullifier = signals.slice(96 + 2, 128 + 2);

    const hpkeEnvelope0 = HpkeEnvelope.fromBytes(args[args.length - 2]);
    const hpkeEnvelope1 = HpkeEnvelope.fromBytes(args[args.length - 1]);

    return {
      type: 'spend',
      hpkeEnvelopes: [hpkeEnvelope0, hpkeEnvelope1],
      commitments: [bytesToNumberBE(commitment0), bytesToNumberBE(commitment1)],
      nullifier: bytesToNumberBE(nullifier),
    };
  }

  // Fallback: don't require exact selector match.
  // This keeps scanning functional if the deployed contract's ABI signatures/selectors drift,
  // as long as the app-call argument *shape* remains the same.
  // deposit: selector + signals(bytes) + proof + hpke
  if (args.length === 4) {
    const signals = args[1];
    if (!(signals instanceof Uint8Array) || signals.length < 34) return null;
    const commitment = signals.slice(0 + 2, 32 + 2);
    const hpkeEnvelope = HpkeEnvelope.fromBytes(args[args.length - 1]);
    return {
      type: 'deposit',
      hpkeEnvelopes: [hpkeEnvelope],
      commitments: [bytesToNumberBE(commitment)],
    };
  }

  // spend: selector + signals(bytes) + proof + hpke0 + hpke1
  if (args.length === 5) {
    const signals = args[1];
    if (!(signals instanceof Uint8Array) || signals.length < 66) return null;
    const commitment0 = signals.slice(0 + 2, 32 + 2);
    const commitment1 = signals.slice(32 + 2, 64 + 2);
    const hpkeEnvelope0 = HpkeEnvelope.fromBytes(args[args.length - 2]);
    const hpkeEnvelope1 = HpkeEnvelope.fromBytes(args[args.length - 1]);

    // Nullifier offset may vary across encodings; only mark spent if present.
    let nullifier: bigint | null = null;
    if (signals.length >= 130) {
      nullifier = bytesToNumberBE(signals.slice(96 + 2, 128 + 2));
    }

    return {
      type: 'spend',
      hpkeEnvelopes: [hpkeEnvelope0, hpkeEnvelope1],
      commitments: [bytesToNumberBE(commitment0), bytesToNumberBE(commitment1)],
      nullifier: nullifier ?? 0n,
    };
  }

  return null;
}

function verifyCommitment(commitments: bigint[], utxo: UtxoSecrets): boolean {
  const c = utxo.computeCommitment();
  return commitments.some((x) => x === c);
}

function b64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

function appArgToBytes(x: any): Uint8Array | null {
  if (!x) return null;
  if (typeof x === 'string') {
    try {
      return b64ToBytes(x);
    } catch {
      return null;
    }
  }
  if (x instanceof Uint8Array) return x;
  if (Array.isArray(x) && x.every((v) => typeof v === 'number')) {
    try {
      return new Uint8Array(x);
    } catch {
      return null;
    }
  }
  return null;
}

function leaseBytesFromIndexer(txn: any): Uint8Array {
  const raw = txn?.lease ?? txn?.['lease'] ?? txn?.['txn']?.['lease'];
  if (typeof raw === 'string' && raw.length > 0) {
    try {
      return b64ToBytes(raw);
    } catch {
      // fall through
    }
  }
  if (raw instanceof Uint8Array) return raw;
  if (Array.isArray(raw) && raw.every((v) => typeof v === 'number')) {
    try {
      return new Uint8Array(raw);
    } catch {
      // fall through
    }
  }
  return new Uint8Array(32);
}

function getTxnField<T = any>(txn: any, dashed: string, camel: string): T | undefined {
  if (!txn) return undefined;
  const a = txn?.[dashed];
  if (a !== undefined) return a as T;
  const b = txn?.[camel];
  if (b !== undefined) return b as T;
  return undefined;
}

function parseRoundAny(v: any): number | undefined {
  if (typeof v === 'number') {
    if (!Number.isFinite(v) || v <= 0) return undefined;
    return Math.floor(v);
  }
  if (typeof v === 'string') {
    if (!v) return undefined;
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return Math.floor(n);
  }
  if (typeof v === 'bigint') {
    if (v <= 0n) return undefined;
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return Math.floor(n);
  }

  // Some SDKs wrap ints like { uint: '123' } or { uint: 123 }
  const maybeUint = v?.uint ?? v?.['uint'];
  if (maybeUint !== undefined) return parseRoundAny(maybeUint);

  return undefined;
}

function getConfirmedRoundAny(txn: any): number | undefined {
  const root = txn?.txn ?? txn?.transaction ?? txn;
  return (
    parseRoundAny(root?.['confirmed-round']) ??
    parseRoundAny(root?.confirmedRound) ??
    parseRoundAny(txn?.['confirmed-round']) ??
    parseRoundAny(txn?.confirmedRound)
  );
}

function getAppArgsAndKey(txn: any): { args: any[]; key: string } | null {
  const root = txn?.txn ?? txn?.transaction ?? txn;
  const appl =
    root?.['application-transaction'] ??
    root?.applicationTransaction ??
    root?.['applicationTransaction'] ??
    txn?.['application-transaction'] ??
    txn?.applicationTransaction ??
    txn?.['applicationTransaction'];
  if (!appl) return null;

  const candidates: Array<[any, string]> = [
    [appl?.['application-args'], 'application-transaction.application-args'],
    [appl?.applicationArgs, 'applicationTransaction.applicationArgs'],
    [appl?.['applicationArgs'], 'applicationTransaction.applicationArgs'],
    [appl?.appArgs, 'applicationTransaction.appArgs'],
    [appl?.['app-args'], 'applicationTransaction.app-args'],
  ];

  for (const [v, key] of candidates) {
    if (Array.isArray(v) && v.length > 0) return { args: v, key };
  }
  return null;
}

async function* iterateAppCallTxns(params: {
  indexer: any;
  appId: number;
  minRound?: number;
}): AsyncGenerator<any, void, void> {
  let nextToken: string | undefined = undefined;

  while (true) {
    let req = params.indexer.searchForTransactions().applicationID(params.appId).txType('appl');
    if (params.minRound) req = req.minRound(params.minRound);
    if (nextToken) req = req.nextToken(nextToken);

    const res = await req.limit(200).do();
    const txns = Array.isArray(res?.transactions) ? res.transactions : [];
    for (const t of txns) yield t;

    nextToken = res?.['next-token'] ?? res?.nextToken;
    if (!nextToken) return;
  }
}

export type ScanShieldedResult = {
  scannedTxns: number;
  candidateTxns?: number;
  parsedMethods?: number;
  viewChecksPassed?: number;
  commitmentMatches?: number;
  stealthMatches?: number;
  decryptedNotes: number;
  markedSpent: number;
  prevLastScannedRound?: number;
  minRoundUsed?: number;
  lastScannedRound?: number;
  argLens?: Record<string, number>;
  missingAppArgs?: number;
  appArgsKeyUsed?: Record<string, number>;
  appId?: number;
  network?: string;
};

export async function scanShieldedUtxos(options?: { minRound?: number }): Promise<ScanShieldedResult> {
  const algorandClient = await getAlgorandClient();
  const indexer = (algorandClient as any)?.client?.indexer;
  if (!indexer) {
    throw new Error('Indexer client is not configured for current network');
  }

  const appIdRaw = storage.getString('mithrasAppId');
  if (!appIdRaw) {
    throw new Error('Mithras App ID not set in storage');
  }
  const appId = Number(appIdRaw);
  if (!Number.isFinite(appId) || appId <= 0) {
    throw new Error(`Invalid mithrasAppId: ${appIdRaw}`);
  }

  const network = storage.getString('network') ?? 'unknown';

  const persistedLast = readLastScannedRound();
  const minRoundUsed =
    typeof options?.minRound === 'number' && Number.isFinite(options.minRound) && options.minRound > 0
      ? Math.floor(options.minRound)
      : persistedLast
        ? persistedLast + 1
        : undefined;

  const shieldedEntries = await getShieldedAddressEntries();
  if (shieldedEntries.length === 0) {
    return { scannedTxns: 0, decryptedNotes: 0, markedSpent: 0 };
  }

  const derived = await Promise.all(
    shieldedEntries.map(async (e) => {
      const viewKeypair = await getShieldedViewKeypair(e.index);
      const spendPubkey = await getShieldedSpendPublicKey(e.index);
      return { index: e.index, address: e.address, viewKeypair, spendPubkey };
    }),
  );

  let scannedTxns = 0;
  let decryptedNotes = 0;
  let markedSpent = 0;

  let candidateTxns = 0;
  let parsedMethods = 0;
  let viewChecksPassed = 0;
  let commitmentMatches = 0;
  let stealthMatches = 0;

  const argLens: Record<string, number> = {};
  let missingAppArgs = 0;
  const appArgsKeyUsed: Record<string, number> = {};

  let maxConfirmedRoundSeen: number | undefined = undefined;

  for await (const txn of iterateAppCallTxns({ indexer, appId, minRound: minRoundUsed })) {
    scannedTxns++;

    // Advance scan watermark based on the Indexer stream, even if app-args parsing/decryption fails.
    const streamConfirmedRound = getConfirmedRoundAny(txn);
    if (typeof streamConfirmedRound === 'number') {
      if (maxConfirmedRoundSeen === undefined || streamConfirmedRound > maxConfirmedRoundSeen) {
        maxConfirmedRoundSeen = streamConfirmedRound;
      }
    }

    const found = getAppArgsAndKey(txn);
    if (!found) {
      missingAppArgs++;
      continue;
    }
    const appArgsRaw = found.args;
    appArgsKeyUsed[found.key] = (appArgsKeyUsed[found.key] ?? 0) + 1;

    const rawLen = appArgsRaw.length;
    argLens[String(rawLen)] = (argLens[String(rawLen)] ?? 0) + 1;

    const appArgs = appArgsRaw
      .map(appArgToBytes)
      .filter((x: any): x is Uint8Array => x instanceof Uint8Array);

    // Candidate based on on-chain arg count (raw length), not our decoding success.
    if (rawLen === 4 || rawLen === 5) candidateTxns++;

    const method = parseMithrasMethodFromArgs(appArgs);
    if (!method) continue;

    parsedMethods++;

    const root = txn?.txn ?? txn?.transaction ?? txn;
    const confirmedRound = getConfirmedRoundAny(txn);
    const txId =
      (typeof root?.id === 'string' ? root.id : undefined) ??
      (typeof root?.txid === 'string' ? root.txid : undefined) ??
      (typeof root?.txId === 'string' ? root.txId : undefined) ??
      (typeof txn?.id === 'string' ? txn.id : undefined);

    if (method.type === 'spend') {
      // Only mark spent if we actually parsed a real nullifier.
      if (method.nullifier && method.nullifier !== 0n) {
        const spentId = method.nullifier.toString(16);
        markUtxoSpent(spentId, { spentRound: confirmedRound, spentTxId: txId });
        markedSpent++;
      }
    }

    const sender =
      (typeof root?.sender === 'string' ? root.sender : undefined) ??
      (typeof root?.['sender'] === 'string' ? root['sender'] : undefined) ??
      (typeof txn?.sender === 'string' ? txn.sender : undefined) ??
      (typeof txn?.['sender'] === 'string' ? txn['sender'] : undefined);
    if (!sender) continue;

    const senderPk = algosdk.Address.fromString(sender).publicKey;
    const fvAny = getTxnField<any>(root, 'first-valid', 'firstValid') ?? getTxnField<any>(txn, 'first-valid', 'firstValid') ?? 0;
    const lvAny = getTxnField<any>(root, 'last-valid', 'lastValid') ?? getTxnField<any>(txn, 'last-valid', 'lastValid') ?? 0;
    const firstValid = BigInt(fvAny ?? 0);
    const lastValid = BigInt(lvAny ?? 0);
    const lease = leaseBytesFromIndexer(root ?? txn);

    const txnMetadata = new TransactionMetadata(
      senderPk,
      firstValid,
      lastValid,
      lease,
      0,
      BigInt(appId),
    );

    for (const envelope of method.hpkeEnvelopes) {
      for (const d of derived) {
        // Fast filter
        if (!envelope.viewCheck(d.viewKeypair.privateKey, txnMetadata)) {
          continue;
        }

        viewChecksPassed++;

        // Decrypt + validate
        const utxo = await UtxoSecrets.fromHpkeEnvelope(envelope, d.viewKeypair as any, txnMetadata);
        if (!verifyCommitment(method.commitments, utxo)) continue;
        commitmentMatches++;

        const derivedStealth = deriveStealthPubkey(d.spendPubkey, utxo.stealthScalar);
        if (!equalBytes(derivedStealth, utxo.stealthPubkey)) continue;

        stealthMatches++;

        const commitment = utxo.computeCommitment();
        const nullifier = utxo.computeNullifier();
        const id = nullifier.toString(16);

        upsertUtxoRecord({
          id,
          commitment: commitment.toString(),
          nullifier: nullifier.toString(),
          amount: utxo.amount.toString(),
          receiverShieldedIndex: d.index,
          hpkeEnvelopeB64: Buffer.from(envelope.toBytes()).toString('base64'),
          txnMetadata: {
            senderB64: Buffer.from(senderPk).toString('base64'),
            firstValid: firstValid.toString(),
            lastValid: lastValid.toString(),
            leaseB64: Buffer.from(lease).toString('base64'),
            network: 0,
            appId: BigInt(appId).toString(),
          },
          createdAtMs: Date.now(),
          confirmedRound,
          txIds: txId ? [txId] : undefined,
        });

        // Persist decrypted secrets for future spending.
        // (If this device didn't create the deposit, this is the only way we'd have them.)
        try {
          await setUtxoSecretsBytes(id, utxo.toBytes());
        } catch (e) {
          console.warn('Failed to persist scanned UTXO secrets', e);
        }

        decryptedNotes++;
      }
    }
  }

  if (typeof maxConfirmedRoundSeen === 'number') {
    writeLastScannedRound(maxConfirmedRoundSeen);
  }

  return {
    scannedTxns,
    candidateTxns,
    parsedMethods,
    viewChecksPassed,
    commitmentMatches,
    stealthMatches,
    decryptedNotes,
    markedSpent,
    prevLastScannedRound: persistedLast,
    minRoundUsed,
    lastScannedRound: maxConfirmedRoundSeen ?? persistedLast,
    argLens,
    missingAppArgs,
    appArgsKeyUsed,
    appId,
    network,
  };
}
