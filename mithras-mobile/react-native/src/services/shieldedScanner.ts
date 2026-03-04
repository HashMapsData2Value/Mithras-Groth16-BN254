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
    const commitment = args[1].slice(0 + 2, 32 + 2);
    const hpkeEnvelope = HpkeEnvelope.fromBytes(args[3]);
    return {
      type: 'deposit',
      hpkeEnvelopes: [hpkeEnvelope],
      commitments: [bytesToNumberBE(commitment)],
    };
  }

  if (equalBytes(selector, SPEND_SELECTOR)) {
    if (args.length !== 5) return null;
    const commitment0 = args[1].slice(0 + 2, 32 + 2);
    const commitment1 = args[1].slice(32 + 2, 64 + 2);
    const nullifier = args[1].slice(96 + 2, 128 + 2);

    const hpkeEnvelope0 = HpkeEnvelope.fromBytes(args[3]);
    const hpkeEnvelope1 = HpkeEnvelope.fromBytes(args[4]);

    return {
      type: 'spend',
      hpkeEnvelopes: [hpkeEnvelope0, hpkeEnvelope1],
      commitments: [bytesToNumberBE(commitment0), bytesToNumberBE(commitment1)],
      nullifier: bytesToNumberBE(nullifier),
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

function leaseBytesFromIndexer(txn: any): Uint8Array {
  const leaseB64 = txn?.lease;
  if (typeof leaseB64 === 'string' && leaseB64.length > 0) {
    try {
      return b64ToBytes(leaseB64);
    } catch {
      // fall through
    }
  }
  return new Uint8Array(32);
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

    nextToken = res?.['next-token'];
    if (!nextToken) return;
  }
}

export type ScanShieldedResult = {
  scannedTxns: number;
  decryptedNotes: number;
  markedSpent: number;
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

  for await (const txn of iterateAppCallTxns({ indexer, appId, minRound: options?.minRound })) {
    scannedTxns++;

    const appl = txn?.['application-transaction'];
    const appArgsB64 = appl?.['application-args'];
    if (!Array.isArray(appArgsB64) || appArgsB64.length === 0) continue;

    const appArgs = appArgsB64
      .map((x: any) => (typeof x === 'string' ? b64ToBytes(x) : null))
      .filter((x: any): x is Uint8Array => x instanceof Uint8Array);

    const method = parseMithrasMethodFromArgs(appArgs);
    if (!method) continue;

    const confirmedRound = typeof txn?.['confirmed-round'] === 'number' ? txn['confirmed-round'] : undefined;
    const txId = typeof txn?.id === 'string' ? txn.id : undefined;

    if (method.type === 'spend') {
      const spentId = method.nullifier.toString(16);
      markUtxoSpent(spentId, { spentRound: confirmedRound, spentTxId: txId });
      markedSpent++;
    }

    const sender = typeof txn?.sender === 'string' ? txn.sender : undefined;
    if (!sender) continue;

    const senderPk = algosdk.Address.fromString(sender).publicKey;
    const firstValid = BigInt(txn?.['first-valid'] ?? 0);
    const lastValid = BigInt(txn?.['last-valid'] ?? 0);
    const lease = leaseBytesFromIndexer(txn);

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

        // Decrypt + validate
        const utxo = await UtxoSecrets.fromHpkeEnvelope(envelope, d.viewKeypair as any, txnMetadata);
        if (!verifyCommitment(method.commitments, utxo)) continue;

        const derivedStealth = deriveStealthPubkey(d.spendPubkey, utxo.stealthScalar);
        if (!equalBytes(derivedStealth, utxo.stealthPubkey)) continue;

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

  return { scannedTxns, decryptedNotes, markedSpent };
}
