import { getAlgorandClient } from './network';
import { encodeAddress, getPublicKey } from '../services/hdWallet';
import { storage } from '../services/storage';
import algosdk from 'algosdk';
import { MithrasProtocolClient } from 'mithras-contracts-and-circuits/src/index';
import { MithrasAddr } from 'mithras-crypto';
import { genShieldedAddress, getDefaultShieldedAddress } from '../services/shWallet';
import { loadAssets } from '../utils/loadAssets';
import { readFile } from '@dr.pogodin/react-native-fs';
import { Buffer } from '@craftzdog/react-native-buffer';
import { CircomProofResult, generateCircomProof, ProofLib } from 'mopro-ffi';
import { sign } from '../services/hdWallet';
import { microAlgos } from '@algorandfoundation/algokit-utils';
import { TransactionMetadata, UtxoInputs } from 'mithras-crypto';
import { addressInScalarField, circomProofResultToVerificationArgs } from 'mithras-contracts-and-circuits/src/index';
import { setUtxoSecretsBytes, upsertUtxoRecord } from '../services/utxoStore';

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

      const verifierTxn = protocol.algorand.createTransaction.payment({
        ...lsigParams,
        receiver: lsigParams.sender,
        amount: microAlgos(0),
      });

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