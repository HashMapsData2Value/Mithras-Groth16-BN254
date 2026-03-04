import { getAlgorandClient } from './network';
import { derivePrivateNodeKeyMaterial, encodeAddress, getPublicKey } from '../services/hdWallet';
import { storage } from '../services/storage';
import algosdk from 'algosdk';
import { MithrasProtocolClient } from 'mithras-contracts-and-circuits/src/index';
import { MithrasAddr } from 'mithras-crypto';
import { genShieldedAddress, getDefaultShieldedAddress, getShieldedAddressEntries, getShieldedSpendPublicKey } from '../services/shWallet';
import { loadAssets } from '../utils/loadAssets';
import { readFile } from '@dr.pogodin/react-native-fs';
import { Buffer } from '@craftzdog/react-native-buffer';
import { CircomProofResult, generateCircomProof, ProofLib } from 'mopro-ffi';
import { sign } from '../services/hdWallet';
import { microAlgos } from '@algorandfoundation/algokit-utils';
import { TransactionMetadata, UtxoInputs } from 'mithras-crypto';
import { addressInScalarField, circomProofResultToVerificationArgs } from 'mithras-contracts-and-circuits/src/index';
import { setUtxoSecretsBytes, upsertUtxoRecord } from '../services/utxoStore';
import { getUtxoSecretsBytes, getUnspentUtxoRecords, markUtxoSpent } from '../services/utxoStore';
import { MimcMerkleTree, MerkleProof, UtxoSecrets, deriveStealthPubkey, mimcSum } from 'mithras-crypto';
import { bytesToNumberLE, concatBytes, numberToBytesLE } from '@noble/curves/utils.js';
import { sha512 } from '@noble/hashes/sha2.js';
import { ed25519 } from '@noble/curves/ed25519.js';

// Create a Simple Transfer Transaction

export async function spendTxn(index: number, recipient: string, amountMicroAlgos: number | bigint): Promise<algosdk.Transaction> {
  const algorandClient = await getAlgorandClient();
  const sp = await algorandClient.getSuggestedParams();

  const senderAddrStr = encodeAddress(await getPublicKey(index));
  algorandClient.account.setSigner(senderAddrStr, makeHdWalletSigner(index, 0));

  const amt = typeof amountMicroAlgos === 'bigint' ? Number(amountMicroAlgos) : amountMicroAlgos;
  if (!Number.isFinite(amt) || amt < 0) {
    throw new Error('Invalid amountMicroAlgos');
  }

  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: senderAddrStr,
    receiver: recipient,
    amount: amt,
    suggestedParams: sp,
  });
}


// Create a Deposit Group Transaction
/**
 * 
 * @param fromIndex The index of the Public Address
 * @param toIndex  The index of the Shielded Addresses
 * @param amount The amount to pass in
 * @returns 
 */
export function depositTxns(fromIndex: number, toIndex: number, amount: number) {
}

const SPEND_LSIGS = 12n;
const LSIGS_FEE = SPEND_LSIGS * 1000n;
const SPEND_APP_FEE = 57n * 1000n;
const NULLIFIER_MBR = 15_700n;

const MERKLE_LEAVES_KEY = 'mithras:merkle:leaves';
const MERKLE_WATERMARK_KEY = 'mithras:merkle:watermark';
const MERKLE_SOURCE_KEY = 'mithras:merkle:source';
const MERKLE_EPOCH_KEY = 'mithras:merkle:epoch';
const MERKLE_SOURCE_ARC28_NEWLEAF_V1 = 'arc28:newleaf:v1';


type MerkleWatermark = { round: number; intra: number; id: string };

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function bytesToBigIntBE(bytes: Uint8Array): bigint {
  return BigInt('0x' + Buffer.from(bytes).toString('hex'));
}

function bytesToBigIntLE(bytes: Uint8Array): bigint {
  const reversed = Uint8Array.from(bytes).reverse();
  return bytesToBigIntBE(reversed);
}

function toUint8ArrayMaybe(v: unknown): Uint8Array | null {
  if (!v) return null;
  if (v instanceof Uint8Array) return v;
  // Some ARC4 wrapper types expose `.bytes`.
  const maybeBytes = (v as any)?.bytes;
  if (maybeBytes instanceof Uint8Array) return maybeBytes;
  if (Array.isArray(maybeBytes) && maybeBytes.every((x: any) => typeof x === 'number')) {
    try {
      return new Uint8Array(maybeBytes);
    } catch {
      return null;
    }
  }
  return null;
}

function normalizeUint256ToBigInt(v: unknown, label: string): bigint {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number') {
    if (!Number.isFinite(v) || v < 0) {
      throw new Error(`${label}: invalid number value`);
    }
    return BigInt(v);
  }
  if (typeof v === 'string') {
    try {
      // Supports both decimal and 0x-prefixed hex.
      return BigInt(v);
    } catch {
      throw new Error(`${label}: invalid string bigint value`);
    }
  }

  const asBytes = toUint8ArrayMaybe(v);
  if (asBytes) return bytesToBigIntBE(asBytes);

  // Some clients wrap numeric values as { value: bigint | string | number }.
  const inner = (v as any)?.value ?? (v as any)?.native ?? (v as any)?.n;
  if (inner !== undefined) return normalizeUint256ToBigInt(inner, label);

  // Last resort: try BigInt(value) for objects with a sensible toString.
  try {
    return BigInt(v as any);
  } catch {
    const t = typeof v;
    const keys = v && typeof v === 'object' ? Object.keys(v as any).slice(0, 8).join(',') : '';
    throw new Error(`${label}: unsupported value type (${t})${keys ? ` keys=[${keys}]` : ''}`);
  }
}

function normalizeBigIntArray(v: unknown, label: string): bigint[] {
  if (!Array.isArray(v)) {
    throw new Error(`${label}: expected an array`);
  }
  return (v as unknown[]).map((x, i) => normalizeUint256ToBigInt(x, `${label}[${i}]`));
}

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function parseMerkleWatermark(raw: string | undefined): MerkleWatermark | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (!v || typeof v !== 'object') return null;
    const round = Number((v as any).round);
    const intra = Number((v as any).intra);
    const id = String((v as any).id ?? '');
    if (!Number.isFinite(round) || !Number.isFinite(intra) || typeof id !== 'string') return null;
    return { round, intra, id };
  } catch {
    return null;
  }
}

function watermarkGte(a: MerkleWatermark, b: MerkleWatermark): boolean {
  if (a.round !== b.round) return a.round > b.round;
  if (a.intra !== b.intra) return a.intra > b.intra;
  return a.id >= b.id;
}

function loadMerkleLeaves(): bigint[] {
  const raw = storage.getString(MERKLE_LEAVES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: bigint[] = [];
    for (const v of parsed) {
      if (typeof v !== 'string') continue;
      try {
        out.push(BigInt(v));
      } catch {
        // skip
      }
    }
    return out;
  } catch {
    return [];
  }
}

function saveMerkleLeaves(leaves: bigint[]) {
  storage.set(MERKLE_LEAVES_KEY, JSON.stringify(leaves.map((x) => x.toString())));
}

function resetMerkleCache() {
  const s: any = storage as any;

  const clearKey = (key: string) => {
    // react-native-mmkv uses `delete(key)` (preferred) but some environments/bundles
    // may not expose it as a callable function. Fall back to common variants.
    const del = s?.delete;
    if (typeof del === 'function') {
      del.call(s, key);
      return;
    }
    const removeItem = s?.removeItem;
    if (typeof removeItem === 'function') {
      removeItem.call(s, key);
      return;
    }
    const set = s?.set;
    if (typeof set === 'function') {
      // Overwrite with empty string so getString() returns '' (falsy) and callers treat it as missing.
      set.call(s, key, '');
      return;
    }
    // Last resort: do nothing, but make it visible.
    console.warn(`[merkle] unable to clear storage key=${key}; no delete/removeItem/set available`);
  };

  clearKey(MERKLE_LEAVES_KEY);
  clearKey(MERKLE_WATERMARK_KEY);
  clearKey(MERKLE_SOURCE_KEY);
  clearKey(MERKLE_EPOCH_KEY);
}

const NEW_LEAF_SELECTOR = new Uint8Array([0x44, 0xf9, 0x8f, 0xd8]);

type NewLeafEvent = { leaf: bigint; epochIdBE: bigint; epochIdLE: bigint; epochHex: string };

type LogWithPos = { bytes: Uint8Array; innerTx: number; logPos: number };

function extractInnerTxns(txn: any): any[] {
  const root = txn?.txn ?? txn?.transaction ?? txn;
  const candidates = [
    root?.['inner-txns'],
    root?.innerTxns,
    root?.innerTxns,
    txn?.['inner-txns'],
    txn?.innerTxns,
  ];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
  }
  return [];
}

function collectLogsWithPositions(txn: any): LogWithPos[] {
  const out: LogWithPos[] = [];
  const rootLogs = extractLogsRaw(txn) ?? [];
  for (let i = 0; i < rootLogs.length; i++) {
    const b = appArgToBytes(rootLogs[i]);
    if (b) out.push({ bytes: b, innerTx: -1, logPos: i });
  }

  const inner = extractInnerTxns(txn);
  for (let innerTx = 0; innerTx < inner.length; innerTx++) {
    const innerLogsRaw = extractLogsRaw(inner[innerTx]) ?? [];
    for (let j = 0; j < innerLogsRaw.length; j++) {
      const b = appArgToBytes(innerLogsRaw[j]);
      if (b) out.push({ bytes: b, innerTx, logPos: j });
    }
  }
  return out;
}

function parseNewLeafEventsFromLogsWithPos(logs: LogWithPos[]): Array<NewLeafEvent & { innerTx: number; logPos: number }> {
  const out: Array<NewLeafEvent & { innerTx: number; logPos: number }> = [];
  for (const { bytes: log, innerTx, logPos } of logs) {
    // ARC-28 ABI event encoding: selector(4) || uint256(32) || uint64(8)
    if (!(log instanceof Uint8Array) || log.length < 4 + 32 + 8) continue;
    const sel = log.subarray(0, 4);
    if (!equalBytes(sel, NEW_LEAF_SELECTOR)) continue;

    const leafBytes = log.subarray(4, 4 + 32);
    const epochBytes = log.subarray(4 + 32, 4 + 32 + 8);
    const epochIdBE = bytesToBigIntBE(epochBytes);
    const epochIdLE = bytesToBigIntLE(epochBytes);
    const epochHex = Buffer.from(epochBytes).toString('hex');
    try {
      out.push({ leaf: bytesToBigIntBE(leafBytes), epochIdBE, epochIdLE, epochHex, innerTx, logPos });
    } catch {
      // ignore malformed
    }
  }
  return out;
}

function parseNewLeafEventsFromLogs(logs: Uint8Array[]): NewLeafEvent[] {
  const out: NewLeafEvent[] = [];
  for (const log of logs) {
    // ARC-28 ABI event encoding: selector(4) || uint256(32) || uint64(8)
    if (!(log instanceof Uint8Array) || log.length < 4 + 32 + 8) continue;
    const sel = log.subarray(0, 4);
    if (!equalBytes(sel, NEW_LEAF_SELECTOR)) continue;

    const leafBytes = log.subarray(4, 4 + 32);
    const epochBytes = log.subarray(4 + 32, 4 + 32 + 8);
    const epochIdBE = bytesToBigIntBE(epochBytes);
    const epochIdLE = bytesToBigIntLE(epochBytes);
    const epochHex = Buffer.from(epochBytes).toString('hex');
    try {
      out.push({ leaf: bytesToBigIntBE(leafBytes), epochIdBE, epochIdLE, epochHex });
    } catch {
      // ignore malformed
    }
  }
  return out;
}

function appArgToBytes(x: any): Uint8Array | null {
  if (!x) return null;
  if (typeof x === 'string') {
    try {
      return new Uint8Array(Buffer.from(x, 'base64'));
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

function extractLogsRaw(txn: any): any[] | null {
  const root = txn?.txn ?? txn?.transaction ?? txn;
  const candidates = [root?.logs, root?.['logs'], txn?.logs, txn?.['logs']];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return null;
}

function parseTxnNumber(v: any): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'bigint') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof v === 'object') {
    const inner = (v as any)?.value ?? (v as any)?.native ?? (v as any)?.n;
    if (inner !== undefined) return parseTxnNumber(inner);
  }
  return null;
}

function getTxnNumberField(txn: any, dashed: string, camel: string): number | null {
  const root = txn?.txn ?? txn?.transaction ?? txn;
  const v = root?.[dashed] ?? root?.[camel] ?? txn?.[dashed] ?? txn?.[camel];
  return parseTxnNumber(v);
}

function getTxnIdField(txn: any): string {
  const root = txn?.txn ?? txn?.transaction ?? txn;
  const v =
    (typeof root?.id === 'string' ? root.id : undefined) ??
    (typeof root?.txid === 'string' ? root.txid : undefined) ??
    (typeof root?.txId === 'string' ? root.txId : undefined) ??
    (typeof txn?.id === 'string' ? txn.id : undefined);
  return typeof v === 'string' ? v : '';
}

let didAssertIndexerMatchesAlgod = false;
let didWarnMerkleIndexerBehind = false;
async function assertIndexerMatchesAlgodApp(params: { algorandClient: any; indexer: any; appId: number }): Promise<void> {
  if (didAssertIndexerMatchesAlgod) return;

  const algod = (params.algorandClient as any)?.client?.algod;
  if (!algod || typeof algod.getApplicationByID !== 'function') return;
  if (!params.indexer || typeof params.indexer.lookupApplicationByID !== 'function') return;

  const [algodRes, indexerRes] = await Promise.all([
    algod.getApplicationByID(params.appId).do(),
    params.indexer.lookupApplicationByID(params.appId).do(),
  ]);

  const algodApp = algodRes?.params ?? algodRes?.application?.params ?? algodRes?.application?.['params'];
  const indexerApp = indexerRes?.application?.params ?? indexerRes?.application?.['params'] ?? indexerRes?.params;

  const algodCreator = algodApp?.creator;
  const indexerCreator = indexerApp?.creator;

  if (algodCreator && indexerCreator && algodCreator !== indexerCreator) {
    throw new Error(
      `Indexer/algod mismatch for appId=${params.appId}: algod.creator=${algodCreator} indexer.creator=${indexerCreator}`,
    );
  }

  didAssertIndexerMatchesAlgod = true;
}

async function syncMerkleLeaves(options?: { reset?: boolean }): Promise<{
  leaves: bigint[];
  tree: MimcMerkleTree;
  root: bigint;
  epochId: bigint;
  expectedLeaves?: number;
}> {
  const algorandClient = await getAlgorandClient();
  const protocol = await getMithrasProtocolClient(algorandClient);
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

  // Fail fast if the configured Indexer is pointing at a different network than algod.
  // Otherwise, we can end up reconstructing a Merkle tree from the wrong app history.
  await assertIndexerMatchesAlgodApp({ algorandClient, indexer, appId });

  const onChainEpochIdRaw = await protocol.appClient.state.global.epochId();
  const onChainEpochId = normalizeUint256ToBigInt(onChainEpochIdRaw ?? 0n, 'global.epochId');
  const cachedEpochRaw = storage.getString(MERKLE_EPOCH_KEY);
  const cachedEpoch = cachedEpochRaw
    ? (() => {
      try {
        return BigInt(cachedEpochRaw);
      } catch {
        return null;
      }
    })()
    : null;

  const startRound = Number(await protocol.appClient.state.global.creationRound());
  if (!Number.isFinite(startRound) || startRound <= 0) {
    throw new Error(`Invalid Mithras creationRound: ${startRound}`);
  }

  // Merkle leaf stream must match the contract. The authoritative source is the ARC-28
  // `NewLeaf(uint256,uint64)` event emitted from `addCommitment`.
  // If we previously cached leaves from app-args parsing, force a rebuild.
  const cachedSource = storage.getString(MERKLE_SOURCE_KEY);
  const epochChanged = cachedEpoch === null ? true : cachedEpoch !== onChainEpochId;
  const effectiveReset = Boolean(options?.reset) || cachedSource !== MERKLE_SOURCE_ARC28_NEWLEAF_V1 || epochChanged;
  if (effectiveReset) {
    resetMerkleCache();
    storage.set(MERKLE_SOURCE_KEY, MERKLE_SOURCE_ARC28_NEWLEAF_V1);
    storage.set(MERKLE_EPOCH_KEY, onChainEpochId.toString());
  }

  const existing = effectiveReset ? [] : loadMerkleLeaves();
  const wm = effectiveReset
    ? { round: startRound, intra: -1, id: '' }
    : parseMerkleWatermark(storage.getString(MERKLE_WATERMARK_KEY)) ?? { round: startRound, intra: -1, id: '' };

  const minRound = Math.max(startRound, wm.round);

  let nextToken: string | undefined = undefined;
  let progressed = false;

  // If the indexer client doesn't support sort('asc'), we must collect and sort
  // transactions locally; otherwise we'd build the Merkle tree in the wrong order.
  const collectedTxns: any[] = [];
  let supportsAscSort: boolean | null = null;

  while (true) {
    let req = indexer.searchForTransactions().applicationID(appId).txType('appl');
    req = req.minRound(minRound).limit(200);

    // Some Indexer implementations omit `logs`/inner-txns unless includeAll is set.
    if (typeof (req as any).includeAll === 'function') {
      req = (req as any).includeAll(true);
    }

    if (supportsAscSort === null) {
      supportsAscSort = typeof (req as any).sort === 'function';
    }

    if (supportsAscSort) {
      req = (req as any).sort('asc');
    }
    if (nextToken) req = req.nextToken(nextToken);

    const res = await req.do();
    const txns = Array.isArray(res?.transactions) ? res.transactions : [];

    if (supportsAscSort) {
      // Already in ascending order; we can process streaming.
      for (const txn of txns) collectedTxns.push(txn);
    } else {
      // Unknown order; collect everything then sort.
      for (const txn of txns) collectedTxns.push(txn);
    }

    nextToken = res?.['next-token'] ?? res?.nextToken ?? res?.['nextToken'];
    if (!nextToken) break;
  }

  collectedTxns.sort((a, b) => {
    const ra = getTxnNumberField(a, 'confirmed-round', 'confirmedRound') ?? 0;
    const rb = getTxnNumberField(b, 'confirmed-round', 'confirmedRound') ?? 0;
    if (ra !== rb) return ra - rb;
    const ia = getTxnNumberField(a, 'intra-round-offset', 'intraRoundOffset') ?? 0;
    const ib = getTxnNumberField(b, 'intra-round-offset', 'intraRoundOffset') ?? 0;
    if (ia !== ib) return ia - ib;
    const ida = getTxnIdField(a);
    const idb = getTxnIdField(b);
    return ida < idb ? -1 : ida > idb ? 1 : 0;
  });

  // Some Indexer setups (notably localnet) can return duplicated transactions across pages.
  // If we process duplicates, we double-count logs and build an invalid Merkle root.
  const seenTxnKeys = new Set<string>();
  let duplicateTxnSkips = 0;
  let didLogAllLeavesDiscardedByEpoch = false;

  // Collect leaf events with enough metadata to produce a deterministic on-chain order.
  // (round, intra-round-offset, txid, innerTx, logPos)
  const leafEvents: Array<{
    round: number;
    intra: number;
    intraMissing: boolean;
    txid: string;
    innerTx: number;
    logPos: number;
    leaf: bigint;
    epochId: bigint;
  }> = [];

  for (const txn of collectedTxns) {
    const round = getTxnNumberField(txn, 'confirmed-round', 'confirmedRound');
    const intraRaw = getTxnNumberField(txn, 'intra-round-offset', 'intraRoundOffset');
    const intraMissing = intraRaw === null;
    const intra = intraRaw ?? 0;
    const id = getTxnIdField(txn);

    // Prefer txid-only de-dupe, since duplicates may sometimes vary in round/intra fields.
    if (id) {
      if (seenTxnKeys.has(id)) {
        duplicateTxnSkips++;
        continue;
      }
      seenTxnKeys.add(id);
    } else if (round !== null && intra !== null) {
      const key = `${round}:${intra}`;
      if (seenTxnKeys.has(key)) {
        duplicateTxnSkips++;
        continue;
      }
      seenTxnKeys.add(key);
    }

    // Only use watermark comparisons when Indexer provides a real intra-round-offset.
    // If intra is missing, we can't reliably compare ordering, so avoid skipping.
    const here: MerkleWatermark | null = round !== null && intraRaw !== null ? { round, intra: intraRaw, id } : null;
    if (here && watermarkGte(wm, here)) continue;

    const logsWithPos = collectLogsWithPositions(txn);
    const newLeaves = parseNewLeafEventsFromLogsWithPos(logsWithPos);
    if (newLeaves.length) {
      let keptAny = false;
      for (const ev of newLeaves) {
        const epochMatches = ev.epochIdBE === onChainEpochId || ev.epochIdLE === onChainEpochId;
        if (!epochMatches) continue;

        if (round === null) continue;
        leafEvents.push({
          round,
          intra,
          intraMissing,
          txid: id,
          innerTx: ev.innerTx,
          logPos: ev.logPos,
          leaf: ev.leaf,
          epochId: onChainEpochId,
        });
        progressed = true;
        keptAny = true;
      }

      if (!keptAny && !didLogAllLeavesDiscardedByEpoch) {
        didLogAllLeavesDiscardedByEpoch = true;
        // No logging here; in production we simply ignore out-of-epoch leaves.
      }
    }

    if (here) storage.set(MERKLE_WATERMARK_KEY, JSON.stringify(here));
  }

  // Deterministic event-level ordering.
  leafEvents.sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    if (a.intra !== b.intra) return a.intra - b.intra;
    if (a.txid !== b.txid) return a.txid < b.txid ? -1 : 1;
    if (a.innerTx !== b.innerTx) return a.innerTx - b.innerTx;
    return a.logPos - b.logPos;
  });

  // Build final leaf list by appending new events after cached leaves.
  // Prefer de-duping by (txid,logIndex) to avoid dropping legitimate equal-valued leaves.
  const seenEventKeys = new Set<string>();
  const leaves: bigint[] = [...existing];
  for (const ev of leafEvents) {
    const ek = ev.txid
      ? `${ev.txid}:${ev.innerTx}:${ev.logPos}`
      : `${ev.round}:${ev.intra}:${ev.innerTx}:${ev.logPos}:${ev.leaf.toString()}`;
    if (seenEventKeys.has(ek)) continue;
    seenEventKeys.add(ek);
    leaves.push(ev.leaf);
  }

  if (progressed || effectiveReset) {
    saveMerkleLeaves(leaves);
  }

  // Prefer on-chain zero hashes (guaranteed to match the contract's MiMC configuration)
  // and treat missing box reads as a hard error.
  const zh = await protocol.appClient.state.box.zeroHashes();
  if (!Array.isArray(zh) || (zh as unknown as any[]).length === 0) {
    throw new Error('zeroHashes box is missing/empty; cannot reconstruct Merkle tree');
  }
  const zeroHashes = normalizeBigIntArray(zh, 'zeroHashes');

  const tree = new MimcMerkleTree(zeroHashes);
  for (const leaf of leaves) tree.addLeaf(leaf);
  const root = tree.getRoot();

  let expectedLeaves: number | undefined = undefined;
  try {
    const tiRaw = await protocol.appClient.state.global.treeIndex();
    const ti = normalizeUint256ToBigInt(tiRaw ?? 0n, 'global.treeIndex');
    const n = Number(ti);
    if (Number.isFinite(n)) expectedLeaves = n;
  } catch {
    // ignore
  }

  // If we are missing leaves, log one-time stats to debug Indexer visibility/parsing.
  // This is intentionally lightweight and avoids dumping full transactions.
  if (
    typeof expectedLeaves === 'number' &&
    leaves.length < expectedLeaves &&
    !effectiveReset &&
    !progressed &&
    !didWarnMerkleIndexerBehind
  ) {
    didWarnMerkleIndexerBehind = true;
    console.warn(
      `[merkle] indexer behind (epoch=${onChainEpochId.toString()} leaves=${leaves.length}/${expectedLeaves} minRound=${minRound} dupSkips=${duplicateTxnSkips})`,
    );
  }

  // No noisy warnings for leaves > expectedLeaves; root validation will handle correctness.

  return {
    leaves,
    tree,
    root,
    epochId: onChainEpochId,
    expectedLeaves,
    // debug removed
  };
}

async function readContractRootCache(protocol: MithrasProtocolClient): Promise<bigint[] | null> {
  // Typed box access (handles box naming + ARC4 decoding). Box reads are expected to always work.
  const roots = await protocol.appClient.state.box.rootCache();
  if (!Array.isArray(roots)) return null;
  return normalizeBigIntArray(roots, 'rootCache');
}

async function readLastComputedRoot(protocol: MithrasProtocolClient): Promise<bigint | null> {
  const v = await protocol.appClient.state.global.lastComputedRoot();
  if (v === undefined || v === null) return null;
  return normalizeUint256ToBigInt(v, 'global.lastComputedRoot');
}

async function isRootValidOnChain(protocol: MithrasProtocolClient, root: bigint): Promise<{ valid: boolean; inCache?: boolean; matchesLast?: boolean; lastComputedRoot?: bigint; cacheSize?: number }> {
  const last = await readLastComputedRoot(protocol);
  const matchesLast = last !== null ? last === root : undefined;
  const cache = await readContractRootCache(protocol);
  const inCache = cache ? cache.some((x) => x === root) : undefined;

  // Contract logic is `isValidRoot(utxoRoot)` which checks rootCache.
  // Treat inability to read rootCache as a hard failure.
  if (inCache === undefined) {
    throw new Error('Failed to read rootCache box; cannot validate Merkle root on-chain');
  }
  const valid = inCache === true;
  return {
    valid,
    inCache,
    matchesLast,
    lastComputedRoot: last ?? undefined,
    cacheSize: cache?.length,
  };
}

async function syncMerkleUntilValidRoot(
  protocol: MithrasProtocolClient,
  options?: { maxAttempts?: number; baseDelayMs?: number; resetFirst?: boolean },
): Promise<{ leaves: bigint[]; tree: MimcMerkleTree; root: bigint; epochId: bigint; expectedLeaves?: number; attempts: number; resetUsed: boolean; rootStatus: Awaited<ReturnType<typeof isRootValidOnChain>> }> {
  const maxAttempts = Math.max(1, Math.min(12, Number(options?.maxAttempts ?? 7)));
  const baseDelayMs = Math.max(0, Math.min(5_000, Number(options?.baseDelayMs ?? 400)));

  let resetUsed = false;
  let resetNext = Boolean(options?.resetFirst);

  type SyncedMerkle = NonNullable<Awaited<ReturnType<typeof syncMerkleLeaves>>>;
  let lastMerkle: SyncedMerkle | null = null;
  let lastStatus: Awaited<ReturnType<typeof isRootValidOnChain>> | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (resetNext) resetUsed = true;

    const merkle = await syncMerkleLeaves({ reset: resetNext });
    resetNext = false;

    if (!merkle) {
      throw new Error('Failed to sync Merkle tree from Indexer');
    }

    const status = await isRootValidOnChain(protocol, merkle.root);
    lastMerkle = merkle;
    lastStatus = status;

    if (status.valid) {
      return { ...merkle, attempts: attempt, resetUsed, rootStatus: status };
    }

    // If we can read on-chain treeIndex, it gives us an expected leaf count for the current epoch.
    // - If we're missing leaves, this is usually Indexer lag; don't reset, just retry with backoff.
    // - If leaf count matches but root is still invalid, it's likely parsing/order/caching mismatch; reset once.
    const expected = merkle.expectedLeaves;
    if (typeof expected === 'number') {
      if (merkle.leaves.length < expected) {
        // Indexer behind; allow it to catch up.
      } else if (merkle.leaves.length === expected) {
        if (!resetUsed) {
          resetNext = true;
          continue;
        }
      } else {
        // We have more leaves than the contract thinks exist in this epoch; force rebuild once.
        if (!resetUsed) {
          resetNext = true;
          continue;
        }
      }
    } else {
      // If the root isn't valid on-chain and we can't reason about leaf count, try a full rebuild once.
      if (!resetUsed) {
        resetNext = true;
        continue;
      }
    }

    if (baseDelayMs > 0 && attempt < maxAttempts) {
      await sleepMs(baseDelayMs * attempt);
    }
  }

  const lastRoot = lastMerkle?.root ?? 0n;
  const leaves = lastMerkle?.leaves.length ?? 0;
  const expectedLeaves = lastMerkle?.expectedLeaves;
  const epochId = lastMerkle?.epochId;
  const inCache = lastStatus?.inCache;
  const matchesLast = lastStatus?.matchesLast;
  const lastComputed = lastStatus?.lastComputedRoot;

  throw new Error(
    `Merkle root is not valid on-chain (after ${maxAttempts} attempts). ` +
    `localRoot=${lastRoot} leaves=${leaves}` +
    (typeof expectedLeaves === 'number' ? ` expectedLeaves=${expectedLeaves}` : '') +
    (typeof epochId === 'bigint' ? ` epochId=${epochId}` : '') +
    ' ' +
    `(inCache=${String(inCache)}, matchesLast=${String(matchesLast)}, lastComputedRoot=${String(lastComputed)}).`,
  );
}

export async function refreshMerkleRoot(options?: { maxAttempts?: number; baseDelayMs?: number; reset?: boolean }): Promise<{
  validOnChain: boolean;
  inCache?: boolean;
  matchesLast?: boolean;
  attempts: number;
  leaves: number;
  expectedLeaves?: number;
  epochId?: string;
  localRoot: string;
  lastComputedRoot?: string;
}> {
  const algorandClient = await getAlgorandClient();
  const protocol = await getMithrasProtocolClient(algorandClient);
  const res = await syncMerkleUntilValidRoot(protocol, {
    maxAttempts: options?.maxAttempts,
    baseDelayMs: options?.baseDelayMs,
    resetFirst: Boolean(options?.reset),
  });
  const status = res.rootStatus;
  return {
    validOnChain: status.valid,
    inCache: status.inCache,
    matchesLast: status.matchesLast,
    attempts: res.attempts,
    leaves: res.leaves.length,
    expectedLeaves: res.expectedLeaves,
    epochId: typeof res.epochId === 'bigint' ? res.epochId.toString() : undefined,
    localRoot: res.root.toString(),
    lastComputedRoot: status.lastComputedRoot !== undefined ? status.lastComputedRoot.toString() : undefined,
  };
}

function spendKeyAScalarFromSeed(seed: Uint8Array): bigint {
  const hash = sha512(seed);
  const raw = bytesToNumberLE(hash.slice(0, 32));
  const clamped = raw & ~((1n << 0n) | (1n << 1n) | (1n << 2n));
  const withBit254 = clamped | (1n << 254n);
  const clearedBit255 = withBit254 & ((1n << 255n) - 1n);
  return clearedBit255;
}

function spendKeyPrefixFromSeed(seed: Uint8Array): Uint8Array {
  const hash = sha512(seed);
  return hash.slice(32, 64);
}

function rawEd25519SignExpanded(params: { aScalar: Uint8Array; prefix: Uint8Array; publicKey: Uint8Array; msg: Uint8Array }): Uint8Array {
  const scalar = modN(bytesToNumberLE(params.aScalar));

  // (2): r = hash(prefix || msg) mod q
  const rHash = sha512(new Uint8Array([...params.prefix, ...params.msg]));
  const r = modN(bytesToNumberLE(rHash));

  // (4): R = r * G
  const R = ed25519.Point.BASE.multiply(r);

  // h = hash(R || pubKey || msg) mod q
  const hHash = sha512(new Uint8Array([...R.toBytes(), ...params.publicKey, ...params.msg]));
  const h = modN(bytesToNumberLE(hHash));

  // S = (r + h * a) mod q
  const S = modN(r + h * scalar);
  return new Uint8Array([...R.toBytes(), ...numberToBytesLE(S, 32)]);
}

function modN(x: bigint): bigint {
  const n = ed25519.Point.CURVE().n;
  const r = x % n;
  return r < 0n ? r + n : r;
}

async function moproSpendProver(circomInputs: Record<string, string | string[]>): Promise<CircomProofResult> {
  const filePath = await loadAssets('spend_test.zkey', { force: false });
  const zkeyPath = filePath.replace('file://', '');
  const res = await Promise.resolve(
    generateCircomProof(zkeyPath, JSON.stringify(circomInputs), ProofLib.Arkworks),
  );
  return res as unknown as CircomProofResult;
}

export async function spendFromShieldedPool(args: {
  fromShieldedIndex: number;
  toShieldedAddress: string;
  amountMicroAlgos: bigint;
}): Promise<{ txIds: string[]; confirmedRound?: number } | any> {
  const { fromShieldedIndex, toShieldedAddress, amountMicroAlgos } = args;
  const algorandClient = await getAlgorandClient();
  const protocol = await getMithrasProtocolClient(algorandClient);

  if (amountMicroAlgos <= 0n) {
    throw new Error('amountMicroAlgos must be > 0');
  }

  const recipient = MithrasAddr.decode(toShieldedAddress);

  const candidates = getUnspentUtxoRecords()
    .filter((r) => r.receiverShieldedIndex === fromShieldedIndex)
    .map((r) => {
      let amt = 0n;
      try {
        amt = BigInt(r.amount);
      } catch {
        amt = 0n;
      }
      return { r, amt };
    })
    .filter((x) => x.amt > 0n)
    .sort((a, b) => (a.amt < b.amt ? -1 : a.amt > b.amt ? 1 : 0));

  if (candidates.length === 0) {
    throw new Error('No spendable UTXOs found for this shielded address');
  }

  // Spend groups require extra network fees (app call / lsigs / min fees) plus a nullifier MBR.
  // The exact tx fee can vary slightly with suggested params, but on Algorand it is typically
  // stable and close to: NULLIFIER_MBR + SPEND_APP_FEE + LSIGS_FEE + 2_000 (min fee + extra min fee).
  // We use this to pick an input UTXO that can actually cover amount+fee and still leave change > 0.
  const feeEstimate = NULLIFIER_MBR + SPEND_APP_FEE + LSIGS_FEE + 2_000n;
  const minInputRequiredEstimate = amountMicroAlgos + feeEstimate + 1n;

  // Build / sync Merkle tree from on-chain app calls.
  // IMPORTANT: the contract accepts any root in its root cache (not strictly lastComputedRoot).
  // So we sync until our reconstructed root is valid on-chain.
  let merkle = await syncMerkleUntilValidRoot(protocol, { maxAttempts: 9, baseDelayMs: 450 });

  // Pick the smallest UTXO that can cover amount + fee and still leave a positive change output.
  // (Circom spend currently uses a single input UTXO.)
  let selected: { id: string; utxo: UtxoSecrets; record: any } | null = null;
  let bestInsufficient: { id: string; utxo: UtxoSecrets; record: any } | null = null;
  for (const c of candidates) {
    const secretsBytes = await getUtxoSecretsBytes(c.r.id);
    if (!secretsBytes) continue;
    let utxo: UtxoSecrets;
    try {
      utxo = UtxoSecrets.fromBytes(secretsBytes);
    } catch {
      continue;
    }

    // Keep a reference to the largest/last-seen spendable secret so we can emit a helpful error.
    if (!bestInsufficient || utxo.amount > bestInsufficient.utxo.amount) {
      bestInsufficient = { id: c.r.id, utxo, record: c.r };
    }

    if (utxo.amount >= minInputRequiredEstimate) {
      selected = { id: c.r.id, utxo, record: c.r };
      break;
    }
  }
  if (!selected) {
    if (!bestInsufficient) {
      throw new Error('No spendable UTXO secrets found locally (keychain missing)');
    }
    const maxSendable = bestInsufficient.utxo.amount > feeEstimate + 1n ? bestInsufficient.utxo.amount - feeEstimate - 1n : 0n;
    throw new Error(
      `Insufficient shielded balance for spend. Need amount+fees <= input. ` +
      `Requested=${amountMicroAlgos} but maxSendable≈${maxSendable} (feeEstimate≈${feeEstimate}, input=${bestInsufficient.utxo.amount}). ` +
      `Send a smaller amount or deposit more to cover fees.`,
    );
  }

  const utxoSecrets = selected.utxo;
  const utxoCommitment = utxoSecrets.computeCommitment();

  let leafIndex = merkle.leaves.findIndex((x) => x === utxoCommitment);
  if (leafIndex < 0) {
    // Rare case: local UTXO exists but our Merkle cache is stale/missing history.
    // Force a rebuild + wait for Indexer catch-up once.
    merkle = await syncMerkleUntilValidRoot(protocol, { maxAttempts: 9, baseDelayMs: 450, resetFirst: true });
    leafIndex = merkle.leaves.findIndex((x) => x === utxoCommitment);
  }
  if (leafIndex < 0) {
    throw new Error(
      `Input UTXO commitment not found in reconstructed Merkle tree (leaves=${merkle.leaves.length}). ` +
      `Run Refresh/Scan, then try again.`,
    );
  }
  const merkleProof: MerkleProof = merkle.tree.getMerkleProof(leafIndex);

  const spendSeed = await derivePrivateNodeKeyMaterial(fromShieldedIndex, 1);
  const spendPubkey = await getShieldedSpendPublicKey(fromShieldedIndex);

  // Validate that this shielded index can actually spend this UTXO.
  const expectedStealthPubkey = deriveStealthPubkey(spendPubkey, utxoSecrets.stealthScalar);
  if (!equalBytes(expectedStealthPubkey, utxoSecrets.stealthPubkey)) {
    throw new Error('Selected UTXO does not belong to the provided shielded address');
  }

  // Derive stealth signer (Ed25519 expanded secret) from spend seed + stealth scalar.
  const spendAScalar = spendKeyAScalarFromSeed(spendSeed);
  const spendPrefix = spendKeyPrefixFromSeed(spendSeed);
  const stealthScalar = modN(spendAScalar + utxoSecrets.stealthScalar);
  const stealthAScalarBytes = numberToBytesLE(stealthScalar, 32);
  const stealthPrefix = sha512(concatBytes(stealthAScalarBytes, spendPrefix)).slice(32, 64);
  const stealthPublicKey = utxoSecrets.stealthPubkey;

  const addr = new algosdk.Address(stealthPublicKey);
  const signer: algosdk.TransactionSigner = async (txns: algosdk.Transaction[], indexesToSign: number[]) => {
    const signedTxns: Uint8Array[] = [];
    for (const i of indexesToSign) {
      const txn = txns[i];
      const msg = txn.bytesToSign();
      const sig = rawEd25519SignExpanded({
        aScalar: stealthAScalarBytes,
        prefix: stealthPrefix,
        publicKey: stealthPublicKey,
        msg,
      });

      // Fail fast if our custom signing is wrong; otherwise algod returns a generic 400.
      try {
        const ok = ed25519.verify(sig, msg, stealthPublicKey);
        if (!ok) {
          throw new Error('Generated signature does not verify against derived stealth public key');
        }
      } catch (e) {
        throw new Error(`Stealth signer produced invalid Ed25519 signature (txnIndex=${i}, type=${txn.type}): ${String(e)}`);
      }

      const stxn = new algosdk.SignedTransaction({ txn, sig });
      signedTxns.push(algosdk.encodeMsgpack(stxn));
    }
    return signedTxns;
  };

  const senderSigner = { sender: addr, signer };
  algorandClient.account.setSigner(algosdk.encodeAddress(stealthPublicKey), signer);

  const entries = await getShieldedAddressEntries();
  const senderEntry = entries.find((e: { index: number; address: string }) => e.index === fromShieldedIndex);
  if (!senderEntry) {
    throw new Error(`Unknown shielded address index: ${fromShieldedIndex}`);
  }
  const spender = MithrasAddr.decode(senderEntry.address);

  // Fee payment must be the txn *after* the spend call, closing remainder to the app.
  const feePayment = await protocol.algorand.createTransaction.payment({
    ...senderSigner,
    receiver: addr,
    amount: microAlgos(0),
    extraFee: microAlgos(SPEND_APP_FEE + LSIGS_FEE + 1000n),
    closeRemainderTo: protocol.appClient.appAddress,
  });

  const feePaymentFee = typeof feePayment.fee === 'bigint' ? feePayment.fee : BigInt(feePayment.fee);
  const fee = NULLIFIER_MBR + feePaymentFee;

  if (amountMicroAlgos + fee > utxoSecrets.amount) {
    const maxSendable = utxoSecrets.amount > fee + 1n ? utxoSecrets.amount - fee - 1n : 0n;
    throw new Error(
      `Insufficient shielded balance for spend. Need amount+fee=${amountMicroAlgos + fee} but UTXO has ${utxoSecrets.amount}. ` +
      `Max sendable is ${maxSendable} (leaves 1µAlgo change).`,
    );
  }

  const out1Amount = utxoSecrets.amount - amountMicroAlgos - fee;
  if (out1Amount <= 0n) {
    throw new Error('Spend must leave a positive change output (amount too close to input after fees)');
  }

  const sp = await protocol.algorand.getSuggestedParams();
  const txnMetadata = new TransactionMetadata(
    stealthPublicKey,
    BigInt(sp.firstValid),
    BigInt(sp.lastValid),
    new Uint8Array(32),
    0,
    protocol.appClient.appId,
  );

  const inputs0 = await UtxoInputs.generate(txnMetadata, amountMicroAlgos, recipient);
  const inputs1 = await UtxoInputs.generate(txnMetadata, out1Amount, spender);

  const inputSignals: Record<string, bigint | bigint[]> = {
    fee,
    utxo_spender: addressInScalarField(utxoSecrets.stealthPubkey),
    utxo_spending_secret: utxoSecrets.spendingSecret,
    utxo_nullifier_secret: utxoSecrets.nullifierSecret,
    utxo_amount: utxoSecrets.amount,
    path_selectors: merkleProof.pathSelectors.map((b) => BigInt(b)),
    utxo_path: merkleProof.pathElements,
    out0_amount: amountMicroAlgos,
    out0_receiver: addressInScalarField(inputs0.secrets.stealthPubkey),
    out0_spending_secret: inputs0.secrets.spendingSecret,
    out0_nullifier_secret: inputs0.secrets.nullifierSecret,
    out1_amount: out1Amount,
    out1_receiver: addressInScalarField(inputs1.secrets.stealthPubkey),
    out1_spending_secret: inputs1.secrets.spendingSecret,
    out1_nullifier_secret: inputs1.secrets.nullifierSecret,
  };

  const circomInputs: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(inputSignals)) {
    if (Array.isArray(v)) {
      circomInputs[k] = v.map((x) => x.toString());
    } else {
      circomInputs[k] = v.toString();
    }
  }

  const proofRes = await moproSpendProver(circomInputs);
  const { proof, signals } = circomProofResultToVerificationArgs(proofRes);

  const spendGroup = protocol.appClient.newGroup();
  await protocol.spendVerifier.verificationParams({
    composer: spendGroup,
    proof,
    signals,
    paramsCallback: async (params) => {
      const { lsigParams, args } = params;

      // Be explicit about the signer for LogicSig-backed verifier transactions.
      // In some environments (notably React Native), relying on implicit signer lookup
      // can result in an unsigned verifier txn and a generic algod 400 signature error.
      const verifierPayTxn = await protocol.algorand.createTransaction.payment({
        ...lsigParams,
        receiver: lsigParams.sender,
        amount: microAlgos(0),
      });
      const verifierSigner = (lsigParams.sender as any)?.signer;
      const verifierTxn = verifierSigner
        ? ({ txn: verifierPayTxn, signer: verifierSigner } as any)
        : (verifierPayTxn as any);

      spendGroup.spend({
        ...senderSigner,
        args: {
          verifierTxn,
          signals: args.signals,
          _proof: args.proof,
          _out0Hpke: inputs0.hpkeEnvelope.toBytes(),
          _out1Hpke: inputs1.hpkeEnvelope.toBytes(),
        },
        staticFee: microAlgos(0),
        firstValidRound: txnMetadata.firstValid,
        lastValidRound: txnMetadata.lastValid,
        lease: txnMetadata.lease,
      });

      spendGroup.addTransaction(feePayment);
    },
  });

  // IMPORTANT: capture the underlying composer ONCE.
  // If send() fails, the internal transactions will already have a group ID assigned;
  // trying to rebuild a fresh composer from the same txns will throw
  // "Cannot add a transaction with nonzero group ID".
  const composer = await spendGroup.composer();

  // Best-effort pre-send diagnostics snapshot. This uses the same composer instance
  // we will later send, so it won't trip the nonzero-group-id issue.
  let builtDiagnostics: { transactions: any[]; signers?: Map<number, any> } | null = null;
  try {
    const built = await (composer as any).buildTransactions?.();
    if (built && Array.isArray(built.transactions)) {
      builtDiagnostics = {
        transactions: built.transactions,
        signers: built.signers instanceof Map ? built.signers : undefined,
      };
    }
  } catch {
    // ignore; diagnostics only
  }

  const dumpBuiltDiagnostics = (label: string) => {
    if (!builtDiagnostics) {
      console.warn(`[spend] ${label}: no pre-send diagnostics snapshot available`);
      return;
    }

    const txns = builtDiagnostics.transactions;
    const signers: Map<number, any> = builtDiagnostics.signers instanceof Map ? builtDiagnostics.signers : new Map();
    console.warn(`[spend] ${label}: txns=${txns.length}, signers=${signers.size}`);

    for (let i = 0; i < txns.length; i++) {
      const t: any = txns[i];
      const sender = typeof t?.from === 'string' ? t.from : t?.from?.toString?.() ?? '(unknown)';
      const type = t?.type ?? '(unknown)';
      const hasSigner = signers.has(i);
      console.warn(`[spend] txn[${i}] type=${type} sender=${sender} hasSigner=${hasSigner}`);
    }
  };

  let sendRes: any;
  try {
    // Send using the captured composer so we don't reconstruct the group.
    sendRes = await (composer as any).send();
  } catch (e) {
    dumpBuiltDiagnostics('send failed');
    throw e;
  }

  // Mark the input as spent locally and persist our change output.
  try {
    const confirmedRound = Array.isArray(sendRes?.confirmations)
      ? (sendRes.confirmations as any[]).reduce((max: number, c: any) => {
        const r = c?.['confirmed-round'];
        return typeof r === 'number' ? Math.max(max, r) : max;
      }, 0) || undefined
      : undefined;

    const txIds = Array.isArray(sendRes?.txIds) ? sendRes.txIds : undefined;
    const spentTxId = Array.isArray(txIds) && txIds.length ? txIds[0] : undefined;
    markUtxoSpent(selected.id, { spentRound: confirmedRound, spentTxId });

    // If the recipient is one of our shielded addresses, persist the out0 UTXO too.
    const recipientEntry = (await getShieldedAddressEntries()).find((e) => e.address === toShieldedAddress);
    if (recipientEntry) {
      const c0 = inputs0.secrets.computeCommitment();
      const n0 = inputs0.secrets.computeNullifier();
      const id0 = n0.toString(16);
      upsertUtxoRecord({
        id: id0,
        commitment: c0.toString(),
        nullifier: n0.toString(),
        amount: inputs0.secrets.amount.toString(),
        receiverShieldedIndex: recipientEntry.index,
        hpkeEnvelopeB64: Buffer.from(inputs0.hpkeEnvelope.toBytes()).toString('base64'),
        txnMetadata: {
          senderB64: Buffer.from(txnMetadata.sender).toString('base64'),
          firstValid: txnMetadata.firstValid.toString(),
          lastValid: txnMetadata.lastValid.toString(),
          leaseB64: Buffer.from(txnMetadata.lease).toString('base64'),
          network: txnMetadata.network,
          appId: txnMetadata.appId.toString(),
        },
        createdAtMs: Date.now(),
        txIds,
        confirmedRound,
      });
      await setUtxoSecretsBytes(id0, inputs0.secrets.toBytes());
    }

    const commitment = inputs1.secrets.computeCommitment();
    const nullifier = inputs1.secrets.computeNullifier();
    const id = nullifier.toString(16);

    upsertUtxoRecord({
      id,
      commitment: commitment.toString(),
      nullifier: nullifier.toString(),
      amount: inputs1.secrets.amount.toString(),
      receiverShieldedIndex: fromShieldedIndex,
      hpkeEnvelopeB64: Buffer.from(inputs1.hpkeEnvelope.toBytes()).toString('base64'),
      txnMetadata: {
        senderB64: Buffer.from(txnMetadata.sender).toString('base64'),
        firstValid: txnMetadata.firstValid.toString(),
        lastValid: txnMetadata.lastValid.toString(),
        leaseB64: Buffer.from(txnMetadata.lease).toString('base64'),
        network: txnMetadata.network,
        appId: txnMetadata.appId.toString(),
      },
      createdAtMs: Date.now(),
      txIds,
      confirmedRound,
    });
    await setUtxoSecretsBytes(id, inputs1.secrets.toBytes());
  } catch (e) {
    console.warn('Failed to persist spend UTXO metadata', e);
  }

  return sendRes;
}

type VerifierArtifacts = {
  depositVerifierAddr: string;
  depositVerifierProgram: Uint8Array;
  spendVerifierAddr: string;
  spendVerifierProgram: Uint8Array;
};

let verifierArtifactsCache: VerifierArtifacts | null = null;

async function getVerifierArtifacts(): Promise<VerifierArtifacts> {
  if (verifierArtifactsCache) return verifierArtifactsCache;

  // Prefer reading verifier artifacts from the filesystem (copied out of the native bundle)
  // because that's consistent across iOS/Android. However, in iOS simulator/dev builds,
  // asset-linking can be flaky; so we also support a Metro-bundled JSON fallback.
  let artifacts: {
    depositVerifierAddr: string;
    depositVerifierProgramB64: string;
    spendVerifierAddr: string;
    spendVerifierProgramB64: string;
  };

  // Prefer Metro-bundled JSON (no iOS asset linking/copying required).
  // Fall back to filesystem loading if Metro require is unavailable for some reason.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    artifacts = require('../../assets/keys/verifier_artifacts.json');
  } catch (e) {
    console.warn('Failed to require verifier_artifacts.json from Metro bundle; falling back to native assets', e);
    const artifactsPath = await loadAssets('verifier_artifacts.json', { force: false });
    const artifactsJson = await readFile(artifactsPath, 'utf8');
    artifacts = JSON.parse(artifactsJson);
  }

  verifierArtifactsCache = {
    depositVerifierAddr: artifacts.depositVerifierAddr,
    spendVerifierAddr: artifacts.spendVerifierAddr,
    depositVerifierProgram: new Uint8Array(
      Buffer.from(artifacts.depositVerifierProgramB64, 'base64'),
    ),
    spendVerifierProgram: new Uint8Array(
      Buffer.from(artifacts.spendVerifierProgramB64, 'base64'),
    ),
  };

  return verifierArtifactsCache;
}

function makeHdWalletSigner(index: number, account: number = 0): algosdk.TransactionSigner {
  return async (txns: algosdk.Transaction[], indexesToSign: number[]) => {
    const signed: Uint8Array[] = [];
    for (const i of indexesToSign) {
      const txn = txns[i];
      const sig = await sign(index, account, txn.bytesToSign());
      const stxn = new algosdk.SignedTransaction({ txn, sig });
      signed.push(algosdk.encodeMsgpack(stxn));
    }
    return signed;
  };
}

async function getMithrasProtocolClient(algorandClient: any): Promise<MithrasProtocolClient> {
  const mithrasAppId = storage.getString('mithrasAppId');
  if (!mithrasAppId) {
    throw new Error('Mithras App ID not set in storage');
  }

  const artifacts = await getVerifierArtifacts();
  return new MithrasProtocolClient(algorandClient, BigInt(mithrasAppId), {
    depositVerifierAddr: artifacts.depositVerifierAddr,
    spendVerifierAddr: artifacts.spendVerifierAddr,
    depositVerifierProgram: artifacts.depositVerifierProgram,
    spendVerifierProgram: artifacts.spendVerifierProgram,
    onMobile: true,
  });
}

async function moproDepositProver(circomInputs: Record<string, string>): Promise<CircomProofResult> {
  const filePath = await loadAssets('deposit_test.zkey', { force: false });
  const zkeyPath = filePath.replace('file://', '');
  const res = await Promise.resolve(
    generateCircomProof(zkeyPath, JSON.stringify(circomInputs), ProofLib.Arkworks),
  );
  return res as unknown as CircomProofResult;
}

/**
 * Submit an on-chain deposit group (Hermes-safe):
 * - proof generated natively via MoPro
 * - verifier txn signed by precompiled LogicSig program (from verifier_artifacts.json)
 * - depositor txns signed via HD wallet
 */
export async function depositToShieldedPool(args: {
  fromIndex: number;
  toShieldedIndex?: number;
  amountMicroAlgos: bigint;
}): Promise<{ txIds: string[]; confirmedRound?: number } | any> {
  const { fromIndex, toShieldedIndex, amountMicroAlgos } = args;
  const algorandClient = await getAlgorandClient();
  const protocol = await getMithrasProtocolClient(algorandClient);

  const fromAddrStr = encodeAddress(await getPublicKey(fromIndex));
  const depositor = new algosdk.Address(algosdk.decodeAddress(fromAddrStr).publicKey);
  algorandClient.account.setSigner(fromAddrStr, makeHdWalletSigner(fromIndex, 0));

  let receiver: MithrasAddr;
  let receiverShieldedIndex: number;
  if (typeof toShieldedIndex === 'number') {
    receiverShieldedIndex = toShieldedIndex;
    const { newMithrasAddr } = await genShieldedAddress(toShieldedIndex);
    receiver = newMithrasAddr;
  } else {
    const def = await getDefaultShieldedAddress();
    receiverShieldedIndex = def.index;
    receiver = def.address;
  }

  // Compose deposit group locally so we can persist the generated secrets/envelope.
  const group = protocol.appClient.newGroup();
  const sp = await protocol.algorand.getSuggestedParams();
  const txnMetadata = new TransactionMetadata(
    depositor.publicKey,
    BigInt(sp.firstValid),
    BigInt(sp.lastValid),
    new Uint8Array(32),
    0,
    protocol.appClient.appId,
  );

  const inputs = await UtxoInputs.generate(txnMetadata, amountMicroAlgos, receiver);

  const circomInputs: Record<string, string> = {
    spending_secret: inputs.secrets.spendingSecret.toString(),
    nullifier_secret: inputs.secrets.nullifierSecret.toString(),
    amount: amountMicroAlgos.toString(),
    receiver: addressInScalarField(inputs.secrets.stealthPubkey).toString(),
  };

  const proofRes = await moproDepositProver(circomInputs);
  const { proof, signals } = circomProofResultToVerificationArgs(proofRes);

  await protocol.depositVerifier.verificationParams({
    composer: group,
    proof,
    signals,
    paramsCallback: async (params) => {
      const { lsigParams, lsigsFee, args } = params;

      // Be explicit about the signer for LogicSig-backed verifier transactions.
      const verifierPayTxn = await protocol.algorand.createTransaction.payment({
        ...lsigParams,
        receiver: lsigParams.sender,
        amount: microAlgos(0),
      });
      const verifierSigner = (lsigParams.sender as any)?.signer;
      const verifierTxn = verifierSigner
        ? ({ txn: verifierPayTxn, signer: verifierSigner } as any)
        : (verifierPayTxn as any);

      group.deposit({
        sender: depositor,
        firstValidRound: txnMetadata.firstValid,
        lastValidRound: txnMetadata.lastValid,
        lease: txnMetadata.lease,
        args: {
          _outHpke: inputs.hpkeEnvelope.toBytes(),
          verifierTxn,
          signals: args.signals,
          _proof: args.proof,
          deposit: protocol.algorand.createTransaction.payment({
            sender: depositor,
            receiver: protocol.appClient.appAddress,
            amount: microAlgos(amountMicroAlgos),
          }),
        },
        extraFee: microAlgos(27_000n + lsigsFee.microAlgos + 1000n),
      });
    },
  });

  // In AlgoKit composer, signers are resolved from AccountManager based on sender.
  // If a signer is missing, this will throw.
  const sendRes = await group.send();

  // Persist UTXO secrets + metadata so future spend/balance logic can work offline.
  try {
    const commitment = inputs.secrets.computeCommitment();
    const nullifier = inputs.secrets.computeNullifier();
    const id = nullifier.toString(16);

    const confirmedRound = Array.isArray(sendRes?.confirmations)
      ? (sendRes.confirmations as any[]).reduce((max: number, c: any) => {
        const r = c?.['confirmed-round'];
        return typeof r === 'number' ? Math.max(max, r) : max;
      }, 0) || undefined
      : undefined;

    upsertUtxoRecord({
      id,
      commitment: commitment.toString(),
      nullifier: nullifier.toString(),
      amount: amountMicroAlgos.toString(),
      receiverShieldedIndex,
      hpkeEnvelopeB64: Buffer.from(inputs.hpkeEnvelope.toBytes()).toString('base64'),
      txnMetadata: {
        senderB64: Buffer.from(txnMetadata.sender).toString('base64'),
        firstValid: txnMetadata.firstValid.toString(),
        lastValid: txnMetadata.lastValid.toString(),
        leaseB64: Buffer.from(txnMetadata.lease).toString('base64'),
        network: txnMetadata.network,
        appId: txnMetadata.appId.toString(),
      },
      createdAtMs: Date.now(),
      txIds: Array.isArray(sendRes?.txIds) ? sendRes.txIds : undefined,
      confirmedRound,
    });
    await setUtxoSecretsBytes(id, inputs.secrets.toBytes());
  } catch (e) {
    console.warn('Failed to persist deposit UTXO metadata', e);
  }

  return sendRes;
}


// Create a Spend Group Transaction


// TODO: Create a Withdrawal Transaction