import { AlgorandClient, microAlgos } from "@algorandfoundation/algokit-utils";
// import { PlonkLsigVerifier } from "snarkjs-algorand";
// import { Groth16Bls12381LsigVerifier } from "snarkjs-algorand";
import { Groth16Bls12381LsigVerifier, Groth16Bn254LsigVerifier } from "snarkjs-algorand";
import { MithrasClient, MithrasFactory } from "../contracts/clients/Mithras";

import {
  bytesToNumberBE,
  MerkleProof,
  MithrasAddr,
  SpendKeypair,
  TransactionMetadata,
  StealthKeypair,
  UtxoInputs,
  UtxoSecrets,
} from "mithras-crypto";
import algosdk from "algosdk";
import { equalBytes } from "mithras-subscriber";

const DEPOSIT_LSIGS = 7;
const SPEND_LSIGS = 12;
const LSIGS_FEE = BigInt(SPEND_LSIGS) * 1000n;
const SPEND_APP_FEE = 57n * 1000n;
const DEPOSIT_APP_FEE = 27n * 1000n;
const APP_MBR = 1567900n;
const BOOTSTRAP_FEE = 51n * 1000n;
const NULLIFIER_MBR = 15_700n;
// const BLS12_381_SCALAR_MODULUS = BigInt(
//   "0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001",
// );
const BN254_SCALAR_MODULUS = BigInt(
  "0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001",
);

export function addressInScalarField(addr: Uint8Array): bigint {
  const asBigint = BigInt("0x" + Buffer.from(addr).toString("hex"));
  // return asBigint % BLS12_381_SCALAR_MODULUS;
  return asBigint % BN254_SCALAR_MODULUS;
}

// export function depositVerifier(algorand: AlgorandClient): PlonkLsigVerifier {
// export function depositVerifier(algorand: AlgorandClient): Groth16Bls12381LsigVerifier {
export type VerifierOptions = {
  depositZKeyPath?: string;
  depositWasmPath?: string;
  spendZKeyPath?: string;
  spendWasmPath?: string;
  /**
   * Precompiled LogicSig program bytes for the verifier.
   *
   * When provided (typically on mobile/Hermes), we can sign verifier transactions
   * without instantiating snarkjs curves / WebAssembly.
   */
  depositVerifierProgram?: Uint8Array;
  spendVerifierProgram?: Uint8Array;
  /**
   * Precomputed verifier LogicSig addresses.
   *
   * Useful in environments where `WebAssembly` is unavailable (e.g. Hermes).
   * If provided, `MithrasProtocolClient.deploy()` will not call `lsigAccount()`.
   */
  depositVerifierAddr?: string;
  spendVerifierAddr?: string;
  onMobile?: boolean;
  assetsDir?: string;
};

function hasWebAssembly(): boolean {
  return typeof (globalThis as any).WebAssembly !== 'undefined';
}

type Groth16Bn254ProofBytes = {
  piA: Uint8Array;
  piB: Uint8Array;
  piC: Uint8Array;
};

type VerificationArgsBn254 = {
  signals: bigint[];
  proof: Groth16Bn254ProofBytes;
};

type VerificationParams = {
  lsigParams: {
    sender: any;
    staticFee: ReturnType<typeof microAlgos>;
  };
  args: VerificationArgsBn254;
  lsigsFee: ReturnType<typeof microAlgos>;
  extraLsigsTxns: any[];
};

type VerificationParamsCall = {
  composer: any;
  paramsCallback: (params: VerificationParams) => Promise<void>;
  addExtraLsigs?: boolean;
} & (
    | { inputs: unknown }
    | { proof: Groth16Bn254ProofBytes; signals: bigint[] }
  );

type LsigVerifierLike = {
  verificationParams(args: VerificationParamsCall): Promise<void>;
};

function parseBigIntLike(value: string | bigint | number): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  const s = value.trim();
  if (s.length === 0) throw new Error('Empty bigint string');
  return BigInt(s);
}

function bigIntToFixedBytes(value: bigint, size: number): Uint8Array {
  if (value < 0n) throw new Error('Negative bigint is not supported');
  let hex = value.toString(16);
  if (hex.length > size * 2) {
    throw new Error(`Bigint does not fit in ${size} bytes`);
  }
  hex = hex.padStart(size * 2, '0');
  const out = new Uint8Array(size);
  for (let i = 0, j = 0; i < size; i++, j += 2) {
    out[i] = parseInt(hex.slice(j, j + 2), 16);
  }
  return out;
}

export type CircomG1 = {
  x: string;
  y: string;
  z?: string;
};

export type CircomG2 = {
  x: Array<string>;
  y: Array<string>;
  z?: Array<string>;
};

export type CircomGroth16Proof = {
  a: CircomG1;
  b: CircomG2;
  c: CircomG1;
  protocol?: string;
  curve?: string;
};

export type CircomGroth16ProofResult = {
  proof: CircomGroth16Proof;
  inputs: Array<string>;
};

export function circomPublicInputsToSignals(inputs: ReadonlyArray<string | bigint | number>): bigint[] {
  return inputs.map((v) => parseBigIntLike(v));
}

export function circomGroth16Bn254ProofToBytes(proof: CircomGroth16Proof): Groth16Bn254ProofBytes {
  const ax = bigIntToFixedBytes(parseBigIntLike(proof.a.x), 32);
  const ay = bigIntToFixedBytes(parseBigIntLike(proof.a.y), 32);
  const cx = bigIntToFixedBytes(parseBigIntLike(proof.c.x), 32);
  const cy = bigIntToFixedBytes(parseBigIntLike(proof.c.y), 32);

  if (proof.b.x.length !== 2 || proof.b.y.length !== 2) {
    throw new Error('Expected G2.x and G2.y to have 2 elements (Fp2)');
  }

  // Convention used by snarkjs/circom for bn254 is typically x=[x0,x1], y=[y0,y1].
  // The on-chain verifier expects bytes ordered as x0||x1||y0||y1 (32 bytes each).
  const bx0 = bigIntToFixedBytes(parseBigIntLike(proof.b.x[0]), 32);
  const bx1 = bigIntToFixedBytes(parseBigIntLike(proof.b.x[1]), 32);
  const by0 = bigIntToFixedBytes(parseBigIntLike(proof.b.y[0]), 32);
  const by1 = bigIntToFixedBytes(parseBigIntLike(proof.b.y[1]), 32);

  const piA = new Uint8Array(64);
  piA.set(ax, 0);
  piA.set(ay, 32);

  const piB = new Uint8Array(128);
  piB.set(bx0, 0);
  piB.set(bx1, 32);
  piB.set(by0, 64);
  piB.set(by1, 96);

  const piC = new Uint8Array(64);
  piC.set(cx, 0);
  piC.set(cy, 32);

  return { piA, piB, piC };
}

export function circomProofResultToVerificationArgs(res: CircomGroth16ProofResult): VerificationArgsBn254 {
  return {
    proof: circomGroth16Bn254ProofToBytes(res.proof),
    signals: circomPublicInputsToSignals(res.inputs),
  };
}

class PrecompiledGroth16Bn254LsigVerifier implements LsigVerifierLike {
  private sender: any;

  constructor(
    private algorand: AlgorandClient,
    private program: Uint8Array,
    private totalLsigs: number,
  ) {
    // Use AlgoKit's tracked LogicSig wrapper so transaction builders accept it
    // (it satisfies `string | Address` + has an attached signer).
    this.sender = this.algorand.account.logicsig(program);
  }

  async verificationParams(args: VerificationParamsCall): Promise<void> {
    if ('inputs' in args) {
      throw new Error(
        'Precompiled verifier cannot generate proofs. Provide { proof, signals } (e.g. generated natively via MoPro).',
      );
    }

    const proof = args.proof;
    const signals = args.signals;

    const params: VerificationParams = {
      lsigParams: {
        sender: this.sender,
        staticFee: microAlgos(0),
      },
      args: { proof, signals },
      lsigsFee: microAlgos(1000 * this.totalLsigs),
      extraLsigsTxns: [],
    };

    // Extra lsigs use a tiny program that only checks RekeyTo is zero.
    const compilation = await this.algorand.app.compileTeal(
      '#pragma version 11\n txn RekeyTo; global ZeroAddress; ==',
    );
    const extraLsig = this.algorand.account.logicsig(
      compilation.compiledBase64ToBytes,
    );

    await args.paramsCallback(params);

    for (let i = 0; i < this.totalLsigs - 1; i++) {
      const lsigPay = await this.algorand.createTransaction.payment({
        sender: extraLsig,
        amount: microAlgos(0),
        staticFee: microAlgos(0),
        receiver: extraLsig,
        note: `Extra lsig ${i + 1} of ${this.totalLsigs - 1}`,
      });
      params.extraLsigsTxns.push(lsigPay);
      if (args.addExtraLsigs ?? true) {
        args.composer.addTransaction(lsigPay, (extraLsig as any).signer);
      }
    }
  }
}

export function depositVerifier(
  algorand: AlgorandClient,
  opts?: VerifierOptions,
): Groth16Bn254LsigVerifier {
  const zKey =
    opts?.depositZKeyPath ??
    defaultCircuitArtifactPath('../circuits/deposit_test.zkey', 'depositZKeyPath');
  const wasmProver =
    opts?.depositWasmPath ??
    defaultCircuitArtifactPath(
      '../circuits/deposit_js/deposit.wasm',
      'depositWasmPath',
    );

  // return new PlonkLsigVerifier({
  // return new Groth16Bls12381LsigVerifier({
  return new Groth16Bn254LsigVerifier({
    algorand,
    zKey,
    wasmProver,
    totalLsigs: DEPOSIT_LSIGS,
    appOffset: 1,
  });
}

// export function spendVerifier(algorand: AlgorandClient): PlonkLsigVerifier {
// export function spendVerifier(algorand: AlgorandClient): Groth16Bls12381LsigVerifier {
export function spendVerifier(
  algorand: AlgorandClient,
  opts?: VerifierOptions,
): Groth16Bn254LsigVerifier {
  const zKey =
    opts?.spendZKeyPath ??
    defaultCircuitArtifactPath('../circuits/spend_test.zkey', 'spendZKeyPath');
  const wasmProver =
    opts?.spendWasmPath ??
    defaultCircuitArtifactPath(
      '../circuits/spend_js/spend.wasm',
      'spendWasmPath',
    );

  // return new PlonkLsigVerifier({
  // return new Groth16Bls12381LsigVerifier({
  return new Groth16Bn254LsigVerifier({
    algorand,
    zKey,
    wasmProver,
    totalLsigs: SPEND_LSIGS,
    appOffset: 1,
  });
}

function safeCwd(): string | undefined {
  try {
    const p = (globalThis as any).process;
    if (p && typeof p.cwd === 'function') {
      return p.cwd() as string;
    }
  } catch {
    // ignore
  }

  return undefined;
}

function toFileUrlDir(absPath: string): string {
  // Minimal cross-platform normalization without importing Node built-ins.
  let normalized = absPath.replace(/\\/g, '/');
  if (!normalized.endsWith('/')) normalized += '/';
  if (!normalized.startsWith('/')) {
    // Likely Windows; keep best-effort.
    return `file:///${normalized}`;
  }
  return `file://${normalized}`;
}

function defaultCircuitArtifactPath(relativeToThisFile: string, optName: string): string {
  // We intentionally avoid `import.meta` so this file can be parsed by Hermes.
  // In Node tests (vitest) we run with cwd at the package root, so `${cwd}/src/`
  // is a reliable base.
  const cwd = safeCwd();
  if (!cwd) {
    throw new Error(
      `Missing verifier artifact path. Provide opts.${optName} when running in non-Node environments (e.g. React Native).`,
    );
  }

  const base = toFileUrlDir(`${cwd}/src`);
  return new URL(relativeToThisFile, base).pathname;
}

type Output = {
  receiver: MithrasAddr;
  amount: bigint;
};

export class MithrasProtocolClient {
  // depositVerifier: PlonkLsigVerifier;
  // spendVerifier: PlonkLsigVerifier;
  // depositVerifier: Groth16Bls12381LsigVerifier;
  // spendVerifier: Groth16Bls12381LsigVerifier;
  depositVerifier: LsigVerifierLike;
  spendVerifier: LsigVerifierLike;
  appClient: MithrasClient;
  private _zeroHashes?: bigint[];

  constructor(
    public algorand: AlgorandClient,
    appId: bigint,
    opts?: VerifierOptions,
  ) {
    this.depositVerifier =
      !hasWebAssembly() && opts?.depositVerifierProgram
        ? new PrecompiledGroth16Bn254LsigVerifier(
          algorand,
          opts.depositVerifierProgram,
          DEPOSIT_LSIGS,
        )
        : depositVerifier(algorand, opts);
    this.spendVerifier =
      !hasWebAssembly() && opts?.spendVerifierProgram
        ? new PrecompiledGroth16Bn254LsigVerifier(
          algorand,
          opts.spendVerifierProgram,
          SPEND_LSIGS,
        )
        : spendVerifier(algorand, opts);

    this.appClient = algorand.client.getTypedAppClientById(MithrasClient, {
      appId,
    });
  }

  static async deploy(
    algorand: AlgorandClient,
    deployer: algosdk.Address,
    opts?: VerifierOptions,
  ): Promise<MithrasProtocolClient> {
    const factory = new MithrasFactory({
      algorand,
      defaultSender: deployer,
    });

    const depositVerifierAddr =
      opts?.depositVerifierAddr ??
      (hasWebAssembly()
        ? (await depositVerifier(algorand, opts).lsigAccount()).addr.toString()
        : undefined);
    const spendVerifierAddr =
      opts?.spendVerifierAddr ??
      (hasWebAssembly()
        ? (await spendVerifier(algorand, opts).lsigAccount()).addr.toString()
        : undefined);

    if (!depositVerifierAddr || !spendVerifierAddr) {
      throw new Error(
        'Failed to resolve verifier addresses. If you are running in an environment without WebAssembly (e.g. React Native Hermes), provide opts.depositVerifierAddr and opts.spendVerifierAddr (precomputed in Node).',
      );
    }

    const { appClient } = await factory.send.create.createApplication({
      args: {
        depositVerifier: depositVerifierAddr,
        spendVerifier: spendVerifierAddr,
      },
    });

    await appClient.appClient.fundAppAccount({ amount: microAlgos(APP_MBR) });

    await appClient.send.bootstrapMerkleTree({
      args: {},
      extraFee: microAlgos(BOOTSTRAP_FEE),
    });

    return new MithrasProtocolClient(algorand, appClient.appId, opts);
  }

  /**
   * Compute verifier artifacts in Node (or any environment with WebAssembly).
   *
   * This is intended for exporting to mobile/Hermes so you can avoid
   * snarkjs curve/WebAssembly instantiation at runtime.
   */
  static async computeVerifierArtifacts(
    algorand: AlgorandClient,
    opts?: VerifierOptions,
  ): Promise<{
    depositVerifierAddr: string;
    depositVerifierProgram: Uint8Array;
    spendVerifierAddr: string;
    spendVerifierProgram: Uint8Array;
  }> {
    if (!hasWebAssembly()) {
      throw new Error(
        'computeVerifierArtifacts() requires WebAssembly (run in Node, not Hermes).',
      );
    }

    const depositLsig: any = await depositVerifier(algorand, opts).lsigAccount();
    const spendLsig: any = await spendVerifier(algorand, opts).lsigAccount();

    const depositProgram = depositLsig?.lsig?.logic;
    const spendProgram = spendLsig?.lsig?.logic;
    if (!(depositProgram instanceof Uint8Array) || !(spendProgram instanceof Uint8Array)) {
      throw new Error('Failed to extract verifier LogicSig program bytes');
    }

    const depositAddr = depositLsig.addr?.toString?.() ?? depositLsig.address?.()?.toString?.();
    const spendAddr = spendLsig.addr?.toString?.() ?? spendLsig.address?.()?.toString?.();
    if (typeof depositAddr !== 'string' || typeof spendAddr !== 'string') {
      throw new Error('Failed to extract verifier LogicSig addresses');
    }

    return {
      depositVerifierAddr: depositAddr,
      depositVerifierProgram: depositProgram,
      spendVerifierAddr: spendAddr,
      spendVerifierProgram: spendProgram,
    };
  }

  async getZeroHashes(): Promise<bigint[]> {
    return this._zeroHashes ?? (await this.appClient.state.box.zeroHashes())!;
  }

  async composeDepositGroup(
    depositor: algosdk.Address,
    amount: bigint,
    receiver: MithrasAddr,
  ) {
    const group = this.appClient.newGroup();

    const sp = await this.algorand.getSuggestedParams();
    const txnMetadata = new TransactionMetadata(
      depositor.publicKey,
      BigInt(sp.firstValid),
      BigInt(sp.lastValid),
      new Uint8Array(32),
      0,
      this.appClient.appId,
    );
    const inputs = await UtxoInputs.generate(txnMetadata, amount, receiver);

    await this.depositVerifier.verificationParams({
      composer: group,
      inputs: {
        spending_secret: inputs.secrets.spendingSecret,
        nullifier_secret: inputs.secrets.nullifierSecret,
        amount,
        receiver: addressInScalarField(inputs.secrets.stealthPubkey),
      },
      paramsCallback: async (params) => {
        const { lsigParams, lsigsFee, args } = params;

        const verifierTxn = this.algorand.createTransaction.payment({
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
            deposit: this.algorand.createTransaction.payment({
              sender: depositor,
              receiver: this.appClient.appAddress,
              amount: microAlgos(amount),
            }),
          },
          extraFee: microAlgos(DEPOSIT_APP_FEE + lsigsFee.microAlgos + 1000n),
        });
      },
    });

    return { group, txnMetadata };
  }

  /**
   * Compose a deposit group while generating the proof externally (e.g. MoPro).
   *
   * This avoids snarkjs WASM proving on mobile and uses `verificationParams({ proof, signals })`.
   */
  async composeDepositGroupWithProver(
    depositor: algosdk.Address,
    amount: bigint,
    receiver: MithrasAddr,
    prover: (circomInputs: Record<string, string>) => Promise<CircomGroth16ProofResult>,
  ) {
    const group = this.appClient.newGroup();

    const sp = await this.algorand.getSuggestedParams();
    const txnMetadata = new TransactionMetadata(
      depositor.publicKey,
      BigInt(sp.firstValid),
      BigInt(sp.lastValid),
      new Uint8Array(32),
      0,
      this.appClient.appId,
    );
    const inputs = await UtxoInputs.generate(txnMetadata, amount, receiver);

    const circomInputs: Record<string, string> = {
      spending_secret: inputs.secrets.spendingSecret.toString(),
      nullifier_secret: inputs.secrets.nullifierSecret.toString(),
      amount: amount.toString(),
      receiver: addressInScalarField(inputs.secrets.stealthPubkey).toString(),
    };

    const proofRes = await prover(circomInputs);
    const { proof, signals } = circomProofResultToVerificationArgs(proofRes);

    await this.depositVerifier.verificationParams({
      composer: group,
      proof,
      signals,
      paramsCallback: async (params) => {
        const { lsigParams, lsigsFee, args } = params;

        const verifierTxn = this.algorand.createTransaction.payment({
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
            deposit: this.algorand.createTransaction.payment({
              sender: depositor,
              receiver: this.appClient.appAddress,
              amount: microAlgos(amount),
            }),
          },
          extraFee: microAlgos(DEPOSIT_APP_FEE + lsigsFee.microAlgos + 1000n),
        });
      },
    });

    return { group, txnMetadata, circomInputs };
  }

  async composeSpendGroup(
    spender: MithrasAddr,
    spendKeypair: SpendKeypair,
    utxoSecrets: UtxoSecrets,
    merkleProof: MerkleProof,
    out0: Output,
    out1?: Output,
  ) {
    const contractRoot = await this.appClient.state.global.lastComputedRoot();

    if (contractRoot !== merkleProof.root) {
      throw new Error(
        `Merkle proof root does not match contract's last computed root. Got ${merkleProof.root}, expected ${contractRoot}`,
      );
    }

    const spendGroup = this.appClient.newGroup();

    const addr = new algosdk.Address(utxoSecrets.stealthPubkey);
    const stealthSigner = StealthKeypair.derive(
      spendKeypair,
      utxoSecrets.stealthScalar,
    );

    if (!equalBytes(stealthSigner.publicKey, utxoSecrets.stealthPubkey)) {
      throw new Error(
        `Stealth keypair does not derive the expected public key. Got ${stealthSigner.publicKey}, expected ${utxoSecrets.stealthPubkey}`,
      );
    }

    const signer: algosdk.TransactionSigner = async (
      txns: algosdk.Transaction[],
      indexesToSign: number[],
    ) => {
      const signedTxns: Uint8Array[] = [];

      for (const index of indexesToSign) {
        const txn = txns[index];
        const sig = stealthSigner.rawSign(txn.bytesToSign());
        const stxn = new algosdk.SignedTransaction({ txn, sig });
        signedTxns.push(algosdk.encodeMsgpack(stxn));
      }

      return signedTxns;
    };

    const senderSigner = { sender: addr, signer };

    this.algorand.account.setSigner(addr, signer);

    const feePayment = await this.algorand.createTransaction.payment({
      ...senderSigner,
      receiver: addr,
      amount: microAlgos(0),
      extraFee: microAlgos(SPEND_APP_FEE + LSIGS_FEE + 1000n),
      closeRemainderTo: this.appClient.appAddress,
    });

    const fee = NULLIFIER_MBR + feePayment.fee;

    const sp = await this.algorand.getSuggestedParams();
    const txnMetadata = new TransactionMetadata(
      stealthSigner.publicKey,
      BigInt(sp.firstValid),
      BigInt(sp.lastValid),
      new Uint8Array(32),
      0,
      this.appClient.appId,
    );

    const inputs0 = await UtxoInputs.generate(
      txnMetadata,
      out0.amount,
      out0.receiver,
    );

    if (out0.amount + fee > utxoSecrets.amount) {
      throw new Error(
        `out0 amount plus fee cannot exceed input amount. Got ${out0.amount} + ${fee} > ${utxoSecrets.amount}`,
      );
    }

    const out1Amount = out1?.amount ?? utxoSecrets.amount - out0.amount - fee;

    if (
      out1 !== undefined &&
      out0.amount + out1.amount !== utxoSecrets.amount - fee
    ) {
      throw new Error(
        `Output amounts must sum to input amount minus fee. Got ${out0.amount} + ${out1.amount} != ${utxoSecrets.amount} - ${fee}`,
      );
    }

    if (out0.amount + out1Amount > utxoSecrets.amount - fee) {
      throw new Error(
        `Output amounts cannot exceed input amount minus fee. Got ${out0.amount} + ${out1Amount} > ${utxoSecrets.amount} - ${fee}`,
      );
    }

    const inputs1 = await UtxoInputs.generate(
      txnMetadata,
      out1?.amount ?? out1Amount,
      out1?.receiver ?? spender,
    );

    const inputSignals: Record<string, bigint | bigint[]> = {
      fee,
      utxo_spender: addressInScalarField(utxoSecrets.stealthPubkey),
      utxo_spending_secret: utxoSecrets.spendingSecret,
      utxo_nullifier_secret: utxoSecrets.nullifierSecret,
      utxo_amount: utxoSecrets.amount,
      path_selectors: merkleProof.pathSelectors.map((b) => BigInt(b)),
      utxo_path: merkleProof.pathElements,
      out0_amount: out0.amount,
      out0_receiver: addressInScalarField(inputs0.secrets.stealthPubkey),
      out0_spending_secret: inputs0.secrets.spendingSecret,
      out0_nullifier_secret: inputs0.secrets.nullifierSecret,
      out1_amount: out1Amount,
      out1_receiver: addressInScalarField(inputs1.secrets.stealthPubkey),
      out1_spending_secret: inputs1.secrets.spendingSecret,
      out1_nullifier_secret: inputs1.secrets.nullifierSecret,
    };

    await this.spendVerifier.verificationParams({
      composer: spendGroup,
      inputs: inputSignals,
      paramsCallback: async (params) => {
        const { lsigParams, args } = params;

        const verifierTxn = this.algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

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

    return spendGroup;
  }

  /**
   * Compose a spend group while generating the proof externally (e.g. MoPro).
   *
   * Requires a prover callback that can handle Circom-style JSON inputs.
   */
  async composeSpendGroupWithProver(
    spender: MithrasAddr,
    spendKeypair: SpendKeypair,
    utxoSecrets: UtxoSecrets,
    merkleProof: MerkleProof,
    out0: Output,
    out1: Output | undefined,
    prover: (circomInputs: Record<string, string | string[]>) => Promise<CircomGroth16ProofResult>,
  ) {
    const contractRoot = await this.appClient.state.global.lastComputedRoot();

    if (contractRoot !== merkleProof.root) {
      throw new Error(
        `Merkle proof root does not match contract's last computed root. Got ${merkleProof.root}, expected ${contractRoot}`,
      );
    }

    const spendGroup = this.appClient.newGroup();

    const addr = new algosdk.Address(utxoSecrets.stealthPubkey);
    const stealthSigner = StealthKeypair.derive(
      spendKeypair,
      utxoSecrets.stealthScalar,
    );

    if (!equalBytes(stealthSigner.publicKey, utxoSecrets.stealthPubkey)) {
      throw new Error(
        `Stealth keypair does not derive the expected public key. Got ${stealthSigner.publicKey}, expected ${utxoSecrets.stealthPubkey}`,
      );
    }

    const signer: algosdk.TransactionSigner = async (
      txns: algosdk.Transaction[],
      indexesToSign: number[],
    ) => {
      const signedTxns: Uint8Array[] = [];

      for (const index of indexesToSign) {
        const txn = txns[index];
        const sig = stealthSigner.rawSign(txn.bytesToSign());
        const stxn = new algosdk.SignedTransaction({ txn, sig });
        signedTxns.push(algosdk.encodeMsgpack(stxn));
      }

      return signedTxns;
    };

    const senderSigner = { sender: addr, signer };

    this.algorand.account.setSigner(addr, signer);

    const feePayment = await this.algorand.createTransaction.payment({
      ...senderSigner,
      receiver: addr,
      amount: microAlgos(0),
      extraFee: microAlgos(SPEND_APP_FEE + LSIGS_FEE + 1000n),
      closeRemainderTo: this.appClient.appAddress,
    });

    const fee = NULLIFIER_MBR + feePayment.fee;

    const sp = await this.algorand.getSuggestedParams();
    const txnMetadata = new TransactionMetadata(
      stealthSigner.publicKey,
      BigInt(sp.firstValid),
      BigInt(sp.lastValid),
      new Uint8Array(32),
      0,
      this.appClient.appId,
    );

    const inputs0 = await UtxoInputs.generate(
      txnMetadata,
      out0.amount,
      out0.receiver,
    );

    if (out0.amount + fee > utxoSecrets.amount) {
      throw new Error(
        `out0 amount plus fee cannot exceed input amount. Got ${out0.amount} + ${fee} > ${utxoSecrets.amount}`,
      );
    }

    const out1Amount = out1?.amount ?? utxoSecrets.amount - out0.amount - fee;

    if (
      out1 !== undefined &&
      out0.amount + out1.amount !== utxoSecrets.amount - fee
    ) {
      throw new Error(
        `Output amounts must sum to input amount minus fee. Got ${out0.amount} + ${out1.amount} != ${utxoSecrets.amount} - ${fee}`,
      );
    }

    if (out0.amount + out1Amount > utxoSecrets.amount - fee) {
      throw new Error(
        `Output amounts cannot exceed input amount minus fee. Got ${out0.amount} + ${out1Amount} > ${utxoSecrets.amount} - ${fee}`,
      );
    }

    const inputs1 = await UtxoInputs.generate(
      txnMetadata,
      out1?.amount ?? out1Amount,
      out1?.receiver ?? spender,
    );

    const inputSignals: Record<string, bigint | bigint[]> = {
      fee,
      utxo_spender: addressInScalarField(utxoSecrets.stealthPubkey),
      utxo_spending_secret: utxoSecrets.spendingSecret,
      utxo_nullifier_secret: utxoSecrets.nullifierSecret,
      utxo_amount: utxoSecrets.amount,
      path_selectors: merkleProof.pathSelectors.map((b) => BigInt(b)),
      utxo_path: merkleProof.pathElements,
      out0_amount: out0.amount,
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

    const proofRes = await prover(circomInputs);
    const { proof, signals } = circomProofResultToVerificationArgs(proofRes);

    await this.spendVerifier.verificationParams({
      composer: spendGroup,
      proof,
      signals,
      paramsCallback: async (params) => {
        const { lsigParams, args } = params;

        const verifierTxn = this.algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

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

    return { spendGroup, feePayment, txnMetadata, circomInputs };
  }
}
