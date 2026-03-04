
import { x25519 } from "@noble/curves/ed25519.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { extract as hkdfExtract, expand as hkdfExpand } from "@noble/hashes/hkdf.js";
import { computeViewTag } from "./view.js";
import { chacha20poly1305 } from "@noble/ciphers/chacha.js";

export const CIPHER_TEXT_SIZE = 136 + 16; // SECRET_SIZE + AEAD tag
export const HPKE_SIZE = 1 + 1 + 32 + CIPHER_TEXT_SIZE + 32 + 32;
export const SupportedNetworks = {
  Mainnet: 0x00,
  Testnet: 0x01,
  Betanet: 0x02,
  Devnet: 0x03,
  Custom: 0xff,
} as const;

export class TransactionMetadata {
  sender: Uint8Array;
  firstValid: bigint;
  lastValid: bigint;
  lease: Uint8Array;
  network: number;
  appId: bigint;

  constructor(
    sender: Uint8Array,
    firstValid: bigint,
    lastValid: bigint,
    lease: Uint8Array,
    network: number,
    appId: bigint,
  ) {
    this.sender = sender;
    this.firstValid = firstValid;
    this.lastValid = lastValid;
    this.lease = lease;
    this.network = network;
    this.appId = appId;
  }

  info(): Uint8Array {
    return new TextEncoder().encode(
      `mithras|network:${this.network}|app:${this.appId}|v:1`,
    );
  }

  aad(): Uint8Array {
    const senderHex = Buffer.from(this.sender).toString("hex");
    const leaseHex = Buffer.from(this.lease).toString("hex");
    return new TextEncoder().encode(
      `txid:${senderHex}|fv:${this.firstValid}|lv:${this.lastValid}|lease:${leaseHex}`,
    );
  }
}

export enum SupportedHpkeSuite {
  x25519Sha256ChaCha20Poly1305 = 0x00,
}

type HpkeSealResult = {
  enc: Uint8Array;
  ciphertext: Uint8Array;
};

const HPKE_V1 = new TextEncoder().encode("HPKE-v1");
const EMPTY = new Uint8Array(0);

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

function i2osp(value: number, length: number): Uint8Array {
  if (value < 0) throw new Error("i2osp: value must be non-negative");
  const out = new Uint8Array(length);
  for (let i = length - 1; i >= 0; i--) {
    out[i] = value & 0xff;
    value >>>= 8;
  }
  if (value !== 0) throw new Error("i2osp: value too large");
  return out;
}

function xorBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length !== b.length) throw new Error("xorBytes: length mismatch");
  const out = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
  return out;
}

function suiteIdX25519Sha256ChaCha20Poly1305(): Uint8Array {
  // RFC 9180: suite_id = "HPKE" || I2OSP(kem_id,2) || I2OSP(kdf_id,2) || I2OSP(aead_id,2)
  // DHKEM(X25519, HKDF-SHA256) = 0x0020; HKDF-SHA256 = 0x0001; ChaCha20Poly1305 = 0x0003
  const hpke = new TextEncoder().encode("HPKE");
  return concatBytes(hpke, i2osp(0x0020, 2), i2osp(0x0001, 2), i2osp(0x0003, 2));
}

function labeledExtract(
  suiteId: Uint8Array,
  salt: Uint8Array,
  label: string,
  ikm: Uint8Array,
): Uint8Array {
  const labeledIkm = concatBytes(
    HPKE_V1,
    suiteId,
    new TextEncoder().encode(label),
    ikm,
  );
  return hkdfExtract(sha256, labeledIkm, salt);
}

function labeledExpand(
  suiteId: Uint8Array,
  prk: Uint8Array,
  label: string,
  info: Uint8Array,
  length: number,
): Uint8Array {
  const labeledInfo = concatBytes(
    i2osp(length, 2),
    HPKE_V1,
    suiteId,
    new TextEncoder().encode(label),
    info,
  );
  return hkdfExpand(sha256, prk, labeledInfo, length);
}

function dhkemExtractAndExpand(
  dh: Uint8Array,
  kemContext: Uint8Array,
): Uint8Array {
  const suiteId = suiteIdX25519Sha256ChaCha20Poly1305();
  const eaePrk = labeledExtract(suiteId, EMPTY, "eae_prk", dh);
  return labeledExpand(suiteId, eaePrk, "shared_secret", kemContext, 32);
}

function keyScheduleBase(sharedSecret: Uint8Array, info: Uint8Array): {
  key: Uint8Array;
  baseNonce: Uint8Array;
} {
  const suiteId = suiteIdX25519Sha256ChaCha20Poly1305();
  const pskIdHash = labeledExtract(suiteId, EMPTY, "psk_id_hash", EMPTY);
  const infoHash = labeledExtract(suiteId, EMPTY, "info_hash", info);
  const mode = new Uint8Array([0x00]); // base mode
  const keyScheduleContext = concatBytes(mode, pskIdHash, infoHash);

  const secret = labeledExtract(suiteId, sharedSecret, "secret", EMPTY);
  const key = labeledExpand(suiteId, secret, "key", keyScheduleContext, 32);
  const baseNonce = labeledExpand(
    suiteId,
    secret,
    "base_nonce",
    keyScheduleContext,
    12,
  );

  return { key, baseNonce };
}

/**
 * HPKE Base mode (RFC 9180) for the only suite Mithras uses:
 * DHKEM(X25519, HKDF-SHA256) + HKDF-SHA256 + ChaCha20-Poly1305.
 *
 * Implemented in pure JS so it works on Hermes/iOS without WebCrypto X25519 support.
 */
export async function hpkeSealBase(
  suite: SupportedHpkeSuite,
  recipientPublicKey: Uint8Array,
  info: Uint8Array,
  aad: Uint8Array,
  plaintext: Uint8Array,
): Promise<HpkeSealResult> {
  if (suite !== SupportedHpkeSuite.x25519Sha256ChaCha20Poly1305) {
    throw new Error(`Unsupported HPKE suite: ${suite}`);
  }

  // Generate ephemeral keypair for the KEM.
  const skE = crypto.getRandomValues(new Uint8Array(32));
  const pkE = x25519.getPublicKey(skE);
  const dh = x25519.getSharedSecret(skE, recipientPublicKey);

  const kemContext = concatBytes(pkE, recipientPublicKey);
  const sharedSecret = dhkemExtractAndExpand(dh, kemContext);
  const { key, baseNonce } = keyScheduleBase(sharedSecret, info);

  // seq=0 for single-shot sealing; nonce = base_nonce XOR I2OSP(seq, Nn)
  const nonce = xorBytes(baseNonce, new Uint8Array(12));
  const ciphertext = chacha20poly1305(key, nonce, aad).encrypt(plaintext);

  return { enc: pkE, ciphertext };
}

export async function hpkeOpenBase(
  suite: SupportedHpkeSuite,
  recipientPrivateKey: Uint8Array,
  enc: Uint8Array,
  info: Uint8Array,
  aad: Uint8Array,
  ciphertext: Uint8Array,
): Promise<Uint8Array> {
  if (suite !== SupportedHpkeSuite.x25519Sha256ChaCha20Poly1305) {
    throw new Error(`Unsupported HPKE suite: ${suite}`);
  }

  const pkR = x25519.getPublicKey(recipientPrivateKey);
  const dh = x25519.getSharedSecret(recipientPrivateKey, enc);
  const kemContext = concatBytes(enc, pkR);
  const sharedSecret = dhkemExtractAndExpand(dh, kemContext);
  const { key, baseNonce } = keyScheduleBase(sharedSecret, info);

  const nonce = xorBytes(baseNonce, new Uint8Array(12));
  const plaintext = chacha20poly1305(key, nonce, aad).decrypt(ciphertext);
  return plaintext;
}

export class HpkeEnvelope {
  version: number;
  suite: SupportedHpkeSuite;
  encapsulatedKey: Uint8Array;
  ciphertext: Uint8Array;
  viewTag: Uint8Array;
  viewEphemeral: Uint8Array;

  constructor(
    version: number,
    suite: SupportedHpkeSuite,
    encapsulatedKey: Uint8Array,
    ciphertext: Uint8Array,
    viewTag: Uint8Array,
    viewEphemeral: Uint8Array,
  ) {
    this.version = version;
    this.suite = suite;
    this.encapsulatedKey = encapsulatedKey;
    this.ciphertext = ciphertext;
    this.viewTag = viewTag;
    this.viewEphemeral = viewEphemeral;
  }

  static fromBytes(data: Uint8Array): HpkeEnvelope {
    if (data.length !== HPKE_SIZE) {
      throw new Error(
        `Invalid HPKE envelope size: expected ${HPKE_SIZE}, got ${data.length}`,
      );
    }

    const version = data[0];
    const suite = data[1] as SupportedHpkeSuite;
    const encapsulatedKey = data.slice(2, 34);
    const ciphertext = data.slice(34, 34 + CIPHER_TEXT_SIZE);
    const viewTag = data.slice(
      34 + CIPHER_TEXT_SIZE,
      34 + CIPHER_TEXT_SIZE + 32,
    );
    const viewEphemeral = data.slice(34 + CIPHER_TEXT_SIZE + 32);

    return new HpkeEnvelope(
      version,
      suite,
      encapsulatedKey,
      ciphertext,
      viewTag,
      viewEphemeral,
    );
  }

  toBytes(): Uint8Array {
    const data = new Uint8Array(HPKE_SIZE);
    data[0] = this.version;
    data[1] = this.suite;
    data.set(this.encapsulatedKey, 2);
    data.set(this.ciphertext, 34);
    data.set(this.viewTag, 34 + CIPHER_TEXT_SIZE);
    data.set(this.viewEphemeral, 34 + CIPHER_TEXT_SIZE + 32);
    return data;
  }

  viewCheck(
    viewPrivate: Uint8Array,
    txnMetadata: TransactionMetadata,
  ): boolean {
    const viewSecret = x25519.getSharedSecret(viewPrivate, this.viewEphemeral);

    const computedTag = computeViewTag(
      viewSecret,
      txnMetadata.sender,
      txnMetadata.firstValid,
      txnMetadata.lastValid,
      txnMetadata.lease,
    );

    return Buffer.from(computedTag).equals(Buffer.from(this.viewTag));
  }
}
