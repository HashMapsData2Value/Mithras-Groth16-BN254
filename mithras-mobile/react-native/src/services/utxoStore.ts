import * as Keychain from 'react-native-keychain';
import { Buffer } from '@craftzdog/react-native-buffer';
import { storage } from './storage';

export type StoredTxnMetadata = {
  senderB64: string;
  firstValid: string;
  lastValid: string;
  leaseB64: string;
  network: number;
  appId: string;
};

export type UtxoRecord = {
  id: string; // currently nullifier as hex
  commitment: string; // bigint as string
  nullifier: string; // bigint as string
  amount: string; // bigint as string (microalgos)
  receiverShieldedIndex: number;
  hpkeEnvelopeB64: string;
  txnMetadata: StoredTxnMetadata;
  createdAtMs: number;
  txIds?: string[];
  confirmedRound?: number;
  spentAtMs?: number;
  spentRound?: number;
  spentTxId?: string;
};

const UTXO_IDS_KEY = 'utxo:ids';

function keychainServiceForUtxo(id: string): string {
  return `mithras_utxo:${id}`;
}

function getIds(): string[] {
  const raw = storage.getString(UTXO_IDS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function setIds(ids: string[]) {
  storage.set(UTXO_IDS_KEY, JSON.stringify(ids));
}

export function upsertUtxoRecord(record: UtxoRecord) {
  storage.set(`utxo:${record.id}`, JSON.stringify(record));
  const ids = getIds();
  if (!ids.includes(record.id)) {
    ids.push(record.id);
    setIds(ids);
  }
}

export function markUtxoSpent(id: string, info?: { spentRound?: number; spentTxId?: string }) {
  const existing = getUtxoRecord(id);
  if (!existing) {
    // UTXO not known locally yet; nothing to mark.
    return;
  }
  if (existing.spentAtMs) return;

  upsertUtxoRecord({
    ...existing,
    spentAtMs: Date.now(),
    spentRound: info?.spentRound,
    spentTxId: info?.spentTxId,
  });
}

export function getUtxoRecord(id: string): UtxoRecord | null {
  const raw = storage.getString(`utxo:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UtxoRecord;
  } catch {
    return null;
  }
}

export function getAllUtxoRecords(): UtxoRecord[] {
  const ids = getIds();
  const out: UtxoRecord[] = [];
  for (const id of ids) {
    const rec = getUtxoRecord(id);
    if (rec) out.push(rec);
  }
  return out;
}

export function getUnspentUtxoRecords(): UtxoRecord[] {
  return getAllUtxoRecords().filter((r) => !r.spentAtMs);
}

export function getShieldedBalanceMicroAlgos(): bigint {
  let total = 0n;
  for (const r of getUnspentUtxoRecords()) {
    try {
      total += BigInt(r.amount);
    } catch {
      // ignore malformed records
    }
  }
  return total;
}

export function getShieldedBalanceByReceiverIndexMicroAlgos(): Map<number, bigint> {
  const map = new Map<number, bigint>();
  for (const r of getUnspentUtxoRecords()) {
    const idx = r.receiverShieldedIndex;
    const prev = map.get(idx) ?? 0n;
    let amt = 0n;
    try {
      amt = BigInt(r.amount);
    } catch {
      amt = 0n;
    }
    map.set(idx, prev + amt);
  }
  return map;
}

export async function setUtxoSecretsBytes(id: string, secretsBytes: Uint8Array): Promise<void> {
  const service = keychainServiceForUtxo(id);
  const b64 = Buffer.from(secretsBytes).toString('base64');
  await Keychain.setGenericPassword('utxo', b64, {
    service,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  } as any);
}

export async function getUtxoSecretsBytes(id: string): Promise<Uint8Array | null> {
  const service = keychainServiceForUtxo(id);
  try {
    const creds = await Keychain.getGenericPassword({ service } as any);
    if (!creds) return null;
    const bytes = Buffer.from(creds.password, 'base64');
    return new Uint8Array(bytes);
  } catch {
    return null;
  }
}
