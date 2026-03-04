import { bytesToNumberBE, numberToBytesBE } from "@noble/curves/utils.js";
import {
  HpkeEnvelope,
  SupportedHpkeSuite,
  TransactionMetadata,
  hpkeOpenBase,
  hpkeSealBase,
} from "./hpke.js";
import {
  deriveStealthPubkey,
  deriveStealthScalar,
  ViewKeypair,
} from "./keypairs.js";
import { computeViewSecretSender, computeViewTag } from "./view.js";
import { MithrasAddr } from "./address.js";
import { mimcSum } from "./mimc.js";
import { addressInScalarField } from "./extracted.js";

export const SECRET_SIZE: number = 136;

export class UtxoSecrets {
  spendingSecret: bigint;
  nullifierSecret: bigint;
  amount: bigint;
  stealthScalar: bigint;
  stealthPubkey: Uint8Array;

  constructor(
    spendingSecret: bigint,
    nullifierSecret: bigint,
    amount: bigint,
    stealthScalar: bigint,
    stealthPubkey: Uint8Array,
  ) {
    this.spendingSecret = spendingSecret;
    this.nullifierSecret = nullifierSecret;
    this.amount = amount;
    this.stealthScalar = stealthScalar;
    this.stealthPubkey = stealthPubkey;
  }

  static fromBytes(bytes: Uint8Array): UtxoSecrets {
    if (bytes.length !== SECRET_SIZE) {
      throw new Error(
        `Invalid byte array length for UtxoSecrets: expected ${SECRET_SIZE}, got ${bytes.length}`,
      );
    }

    const spendingSecret = bytesToNumberBE(bytes.slice(0, 32));
    const nullifierSecret = bytesToNumberBE(bytes.slice(32, 64));
    const amount = bytesToNumberBE(bytes.slice(64, 72));
    const stealthScalar = bytesToNumberBE(bytes.slice(72, 104));
    const stealthPubkey = bytes.slice(104, 136);

    return new UtxoSecrets(
      spendingSecret,
      nullifierSecret,
      amount,
      stealthScalar,
      stealthPubkey,
    );
  }

  toBytes(): Uint8Array {
    const bytes = new Uint8Array(SECRET_SIZE);
    bytes.set(numberToBytesBE(this.spendingSecret, 32), 0);
    bytes.set(numberToBytesBE(this.nullifierSecret, 32), 32);
    bytes.set(numberToBytesBE(this.amount, 8), 64);
    bytes.set(numberToBytesBE(this.stealthScalar, 32), 72);
    bytes.set(this.stealthPubkey, 104);
    return bytes;
  }

  static async fromHpkeEnvelope(
    hpkeEnvelope: HpkeEnvelope,
    viewKeypair: ViewKeypair,
    txnMetadata: TransactionMetadata,
  ): Promise<UtxoSecrets> {
    const plaintext = await hpkeOpenBase(
      hpkeEnvelope.suite,
      viewKeypair.privateKey,
      hpkeEnvelope.encapsulatedKey,
      txnMetadata.info(),
      txnMetadata.aad(),
      hpkeEnvelope.ciphertext,
    );

    return UtxoSecrets.fromBytes(plaintext);
  }

  computeCommitment(): bigint {
    const input = [
      this.spendingSecret,
      this.nullifierSecret,
      this.amount,
      addressInScalarField(this.stealthPubkey),
    ];
    return mimcSum(input);
  }

  computeNullifier(): bigint {
    const commitment = this.computeCommitment();
    return mimcSum([commitment, this.nullifierSecret]);
  }
}

export class UtxoInputs {
  secrets: UtxoSecrets;
  hpkeEnvelope: HpkeEnvelope;

  private constructor(secrets: UtxoSecrets, hpkeEnvelope: HpkeEnvelope) {
    this.secrets = secrets;
    this.hpkeEnvelope = hpkeEnvelope;
  }

  static async generate(
    txnMetadata: TransactionMetadata,
    amount: bigint,
    receiver: MithrasAddr,
  ): Promise<UtxoInputs> {
    const ephemeralKeypair = ViewKeypair.generate();

    const viewSecret = computeViewSecretSender(
      ephemeralKeypair.privateKey,
      receiver.viewX25519,
    );

    const stealthScalar = deriveStealthScalar(viewSecret);
    const stealthPubkey = deriveStealthPubkey(
      receiver.spendEd25519,
      stealthScalar,
    );

    const viewTag = computeViewTag(
      viewSecret,
      txnMetadata.sender,
      txnMetadata.firstValid,
      txnMetadata.lastValid,
      txnMetadata.lease,
    );

    const spendingSecret = bytesToNumberBE(
      crypto.getRandomValues(new Uint8Array(32)),
    );
    const nullifierSecret = bytesToNumberBE(
      crypto.getRandomValues(new Uint8Array(32)),
    );

    const mithrasSecret = new UtxoSecrets(
      spendingSecret,
      nullifierSecret,
      amount,
      stealthScalar,
      stealthPubkey,
    );

    const sealed = await hpkeSealBase(
      SupportedHpkeSuite.x25519Sha256ChaCha20Poly1305,
      receiver.viewX25519,
      txnMetadata.info(),
      txnMetadata.aad(),
      mithrasSecret.toBytes(),
    );

    const hpkeEnvelope = new HpkeEnvelope(
      1,
      SupportedHpkeSuite.x25519Sha256ChaCha20Poly1305,
      sealed.enc,
      sealed.ciphertext,
      viewTag,
      ephemeralKeypair.publicKey,
    );

    return new UtxoInputs(mithrasSecret, hpkeEnvelope);
  }
}
