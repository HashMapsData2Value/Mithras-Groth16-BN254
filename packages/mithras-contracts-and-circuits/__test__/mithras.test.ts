import { AlgorandClient, microAlgos } from "@algorandfoundation/algokit-utils";
// import {
//   PlonkLsigVerifier,
//   PlonkSignalsAndProofClient,
//   PlonkSignalsAndProofFactory,
// } from "snarkjs-algorand";
// import {
//   Groth16Bls12381LsigVerifier,
//   Groth16Bls12381SignalsAndProofClient,
//   Groth16Bls12381SignalsAndProofFactory
// } from "snarkjs-algorand";
import {
  Groth16Bn254LsigVerifier,
  Groth16Bn254SignalsAndProofClient,
  Groth16Bn254SignalsAndProofFactory
} from "snarkjs-algorand";
import { MithrasClient, MithrasFactory } from "../contracts/clients/Mithras";

import { beforeAll, describe, expect, it } from "vitest";
import { MerkleTestHelpers, MimcCalculator } from "./utils/test-utils";
import { Address } from "algosdk";
import {
  depositVerifier,
  MithrasProtocolClient,
  spendVerifier,
  withdrawVerifier,
} from "../src";
import {
  ViewKeypair,
  MithrasAddr,
  SpendKeypair,
  SupportedHpkeSuite,
} from "../../mithras-crypto/src";
import { TREE_DEPTH } from "../src/constants";

const SPEND_LSIGS = 12;
const LSIGS_FEE = BigInt(SPEND_LSIGS) * 1000n;
const SPEND_APP_FEE = 110n * 1000n;
// Withdraw verifier runs across multiple LogicSig txns.
// If too low, verification fails with AVM budget exceeded (e.g. `ec_pairing_check`).
const WITHDRAW_LSIGS = 12;
const WITHDRAW_LSIGS_FEE = BigInt(WITHDRAW_LSIGS) * 1000n;
const WITHDRAW_APP_FEE = 2000n;
const DEPOSIT_APP_FEE = 53n * 1000n;
const APP_MBR = 1567900n;
const BOOTSTRAP_FEE = 51n * 1000n;
const NULLIFIER_MBR = 15_700n;

// const BLS12_381_SCALAR_MODULUS = BigInt(
//   "0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001",
// );
const BN254_SCALAR_MODULUS = BigInt(
  "0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001",
);

function addressInScalarField(addr: Address): bigint {
  const asBigint = BigInt("0x" + Buffer.from(addr.publicKey).toString("hex"));
  // return asBigint % BLS12_381_SCALAR_MODULUS;
  return asBigint % BN254_SCALAR_MODULUS;
}

describe("Mithras App", () => {
  let appClient: MithrasClient;
  let algorand: AlgorandClient;
  let mimcCalculator: MimcCalculator;
  let depositor: Address;
  let spender: Address;

  async function computeMerklePathForIndex(params: {
    leafIndex: number;
    leafByIndex: Map<number, bigint>;
  }): Promise<{ pathElements: bigint[]; pathSelectors: number[]; root: bigint }> {
    const { leafIndex, leafByIndex } = params;

    const zeroHashes: bigint[] = new Array(TREE_DEPTH + 1);
    zeroHashes[0] = 0n;
    for (let i = 1; i <= TREE_DEPTH; i++) {
      zeroHashes[i] = await mimcCalculator.calculateHash(zeroHashes[i - 1], zeroHashes[i - 1]);
    }

    const nonZeroIndices = Array.from(leafByIndex.keys()).filter((i) => leafByIndex.get(i) !== 0n);
    const memo = new Map<string, bigint>();

    const subtreeIntersectsNonZero = (height: number, nodeIndex: number): boolean => {
      const start = nodeIndex * (1 << height);
      const end = (nodeIndex + 1) * (1 << height);
      for (const idx of nonZeroIndices) {
        if (idx >= start && idx < end) return true;
      }
      return false;
    };

    const subtreeHash = async (height: number, nodeIndex: number): Promise<bigint> => {
      const key = `${height}:${nodeIndex}`;
      const cached = memo.get(key);
      if (cached !== undefined) return cached;

      if (!subtreeIntersectsNonZero(height, nodeIndex)) {
        const v = zeroHashes[height];
        memo.set(key, v);
        return v;
      }

      if (height === 0) {
        const v = leafByIndex.get(nodeIndex) ?? 0n;
        memo.set(key, v);
        return v;
      }

      const left = await subtreeHash(height - 1, nodeIndex * 2);
      const right = await subtreeHash(height - 1, nodeIndex * 2 + 1);
      const v = await mimcCalculator.calculateHash(left, right);
      memo.set(key, v);
      return v;
    };

    const pathElements: bigint[] = [];
    const pathSelectors: number[] = [];
    for (let level = 0; level < TREE_DEPTH; level++) {
      const selector = (leafIndex >> level) & 1;
      const nodeIndexAtLevel = leafIndex >> level;
      const siblingNodeIndex = nodeIndexAtLevel ^ 1;
      const sibling = await subtreeHash(level, siblingNodeIndex);
      pathSelectors.push(selector);
      pathElements.push(sibling);
    }

    const root = await subtreeHash(TREE_DEPTH, 0);
    return { pathElements, pathSelectors, root };
  }

  beforeAll(async () => {
    algorand = AlgorandClient.defaultLocalNet();
    depositor = await algorand.account.localNetDispenser();
    spender = algorand.account.random();

    algorand.setSuggestedParamsCacheTimeout(0);
    mimcCalculator = await MimcCalculator.create();

    const deployment = await MithrasProtocolClient.deploy(algorand, depositor);
    appClient = algorand.client.getTypedAppClientById(MithrasClient, {
      appId: deployment.appClient.appId,
      defaultSender: depositor,
    });
  });

  it("deposit", async () => {
    const client = new MithrasProtocolClient(algorand, appClient.appId);

    const { group } = await client.composeDepositGroup(
      depositor,
      1n,
      MithrasAddr.fromKeys(
        SpendKeypair.generate().publicKey,
        ViewKeypair.generate().publicKey,
        1,
        0,
        SupportedHpkeSuite.x25519Sha256ChaCha20Poly1305,
      ),
    );

    const simRes = await group.simulate({
      allowUnnamedResources: true,
    });

    expect(
      simRes.simulateResponse.txnGroups[0].appBudgetConsumed,
    ).toMatchSnapshot("deposit app budget");
  });

  it("spend", async () => {
    const utxo_spending_secret = 11n;
    const utxo_nullifier_secret = 22n;
    const utxo_amount = 200_000n;
    const utxo_spender = addressInScalarField(spender);

    const depositGroup = appClient.newGroup();

    await depositVerifier(algorand).verificationParams({
      composer: depositGroup,
      inputs: {
        spending_secret: utxo_spending_secret,
        nullifier_secret: utxo_nullifier_secret,
        amount: utxo_amount,
        receiver: utxo_spender,
      },
      paramsCallback: async (params) => {
        const { lsigParams, args, lsigsFee } = params;

        // App call from lsig to expose the signals and proof to our app
        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        depositGroup.deposit({
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            _outHpke: new Uint8Array(250),
            deposit: algorand.createTransaction.payment({
              sender: depositor,
              receiver: appClient.appAddress,
              amount: microAlgos(utxo_amount),
            }),
          },
          extraFee: microAlgos(DEPOSIT_APP_FEE + lsigsFee.microAlgos + 1000n),
        });
      },
    });

    await depositGroup.send();

    const initialSpenderBalance = (
      await algorand.account.getInformation(spender)
    ).balance.microAlgo;

    expect(initialSpenderBalance).toEqual(0n);

    const feePayment = await algorand.createTransaction.payment({
      sender: spender,
      receiver: spender,
      amount: microAlgos(0),
      extraFee: microAlgos(SPEND_APP_FEE + LSIGS_FEE + 1000n),
      closeRemainderTo: appClient.appAddress,
    });

    const fee = NULLIFIER_MBR + feePayment.fee;
    const out0_amount = 100_000n - fee;
    const out1_amount = 100_000n;
    const out0_receiver = addressInScalarField(algorand.account.random());
    const out1_receiver = addressInScalarField(algorand.account.random());
    const out0_spending_secret = 333n;
    const out0_nullifier_secret = 444n;
    const out1_spending_secret = 555n;
    const out1_nullifier_secret = 666n;

    // Compute the zero hashes the same way the contract does in bootstrap()
    // tree[0] = bzero(32), tree[i] = mimc(tree[i-1] + tree[i-1])
    const pathElements: bigint[] = [];
    let currentZero = 0n; // bzero(32) = 0n

    for (let i = 0; i < TREE_DEPTH; i++) {
      pathElements[i] = currentZero;
      currentZero = await mimcCalculator.calculateHash(
        currentZero,
        currentZero,
      );
    }

    const pathSelectors = MerkleTestHelpers.createDefaultPathSelectors(); // All 0s for index 0 (left path)

    // Verify this path is correct by computing what the root should be
    const utxoCommitment = await mimcCalculator.sum4Commit([
      utxo_spending_secret,
      utxo_nullifier_secret,
      utxo_amount,
      utxo_spender,
    ]);
    const expectedRoot = await mimcCalculator.calculateMerkleRoot(
      utxoCommitment,
      pathElements,
      pathSelectors,
    );

    const onChainRoot = await appClient.state.global.lastComputedRoot();

    expect(expectedRoot).toBe(onChainRoot);

    const inputSignals = {
      fee,
      utxo_spender,
      utxo_spending_secret,
      utxo_nullifier_secret,
      utxo_amount,
      path_selectors: pathSelectors,
      utxo_path: pathElements,
      out0_amount,
      out0_receiver,
      out0_spending_secret,
      out0_nullifier_secret,
      out1_amount,
      out1_receiver,
      out1_spending_secret,
      out1_nullifier_secret,
    };

    const spendGroup = appClient.newGroup();

    await spendVerifier(algorand).verificationParams({
      composer: spendGroup,
      inputs: inputSignals,
      paramsCallback: async (params) => {
        const { lsigParams, args } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        spendGroup.spend({
          sender: spender,
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            _out0Hpke: new Uint8Array(250),
            _out1Hpke: new Uint8Array(250),
          },
          staticFee: microAlgos(0),
        });
        spendGroup.addTransaction(feePayment);
      },
    });

    const simRes = await spendGroup.simulate({
      allowUnnamedResources: true,
    });

    expect(
      simRes.simulateResponse.txnGroups[0].appBudgetConsumed,
    ).toMatchSnapshot("spend app budget");

    await spendGroup.send();

    const finalSpenderBalance = (await algorand.account.getInformation(spender))
      .balance.microAlgo;

    expect(finalSpenderBalance).toEqual(0n);
  });

  it("spend rejects a close txn that pays a third party", async () => {
    // Fresh app instance so the Merkle indices are deterministic.
    const deployment = await MithrasProtocolClient.deploy(algorand, depositor);
    const spendAppClient = algorand.client.getTypedAppClientById(MithrasClient, {
      appId: deployment.appClient.appId,
      defaultSender: depositor,
    });

    const localSpender = algorand.account.random();

    const utxo_spending_secret = 11n;
    const utxo_nullifier_secret = 22n;
    const utxo_amount = 200_000n;
    const utxo_spender = addressInScalarField(localSpender);

    const depositGroup = spendAppClient.newGroup();
    await depositVerifier(algorand).verificationParams({
      composer: depositGroup,
      inputs: {
        spending_secret: utxo_spending_secret,
        nullifier_secret: utxo_nullifier_secret,
        amount: utxo_amount,
        receiver: utxo_spender,
      },
      paramsCallback: async (params) => {
        const { lsigParams, args, lsigsFee } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        depositGroup.deposit({
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            _outHpke: new Uint8Array(250),
            deposit: algorand.createTransaction.payment({
              sender: depositor,
              receiver: spendAppClient.appAddress,
              amount: microAlgos(utxo_amount),
            }),
          },
          extraFee: microAlgos(DEPOSIT_APP_FEE + lsigsFee.microAlgos + 1000n),
        });
      },
    });
    await depositGroup.send();

    // Malicious close transaction: pays a third party before closing remainder to the app.
    const feePayment = await algorand.createTransaction.payment({
      sender: localSpender,
      receiver: depositor,
      amount: microAlgos(1),
      extraFee: microAlgos(SPEND_APP_FEE + LSIGS_FEE + 1000n),
      closeRemainderTo: spendAppClient.appAddress,
    });

    const fee = NULLIFIER_MBR + feePayment.fee;
    const out0_amount = 100_000n - fee;
    const out1_amount = 100_000n;
    const out0_receiver = addressInScalarField(algorand.account.random());
    const out1_receiver = addressInScalarField(algorand.account.random());
    const out0_spending_secret = 333n;
    const out0_nullifier_secret = 444n;
    const out1_spending_secret = 555n;
    const out1_nullifier_secret = 666n;

    const pathElements: bigint[] = [];
    let currentZero = 0n;
    for (let i = 0; i < TREE_DEPTH; i++) {
      pathElements[i] = currentZero;
      currentZero = await mimcCalculator.calculateHash(currentZero, currentZero);
    }
    const pathSelectors = MerkleTestHelpers.createDefaultPathSelectors();

    const utxoCommitment = await mimcCalculator.sum4Commit([
      utxo_spending_secret,
      utxo_nullifier_secret,
      utxo_amount,
      utxo_spender,
    ]);
    const expectedRoot = await mimcCalculator.calculateMerkleRoot(
      utxoCommitment,
      pathElements,
      pathSelectors,
    );
    const onChainRoot = await spendAppClient.state.global.lastComputedRoot();
    expect(expectedRoot).toBe(onChainRoot);

    const spendGroup = spendAppClient.newGroup();
    await spendVerifier(algorand).verificationParams({
      composer: spendGroup,
      inputs: {
        fee,
        utxo_spender,
        utxo_spending_secret,
        utxo_nullifier_secret,
        utxo_amount,
        path_selectors: pathSelectors,
        utxo_path: pathElements,
        out0_amount,
        out0_receiver,
        out0_spending_secret,
        out0_nullifier_secret,
        out1_amount,
        out1_receiver,
        out1_spending_secret,
        out1_nullifier_secret,
      },
      paramsCallback: async (params) => {
        const { lsigParams, args } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        spendGroup.spend({
          sender: localSpender,
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            _out0Hpke: new Uint8Array(250),
            _out1Hpke: new Uint8Array(250),
          },
          staticFee: microAlgos(0),
        });

        spendGroup.addTransaction(feePayment);
      },
    });

    await expect(spendGroup.send()).rejects.toThrow();
  });

  it("withdraw", async () => {
    // Use a fresh app instance so we can use the trivial Merkle path for index 0.
    const deployment = await MithrasProtocolClient.deploy(algorand, depositor);
    const withdrawAppClient = algorand.client.getTypedAppClientById(MithrasClient, {
      appId: deployment.appClient.appId,
      defaultSender: depositor,
    });

    const localSpender = algorand.account.random();
    const withdrawReceiver = algorand.account.random();

    const utxo_spending_secret = 11n;
    const utxo_nullifier_secret = 22n;
    const utxo_amount = 200_000n;
    const utxo_spender = addressInScalarField(localSpender);

    const depositGroup = withdrawAppClient.newGroup();

    await depositVerifier(algorand).verificationParams({
      composer: depositGroup,
      inputs: {
        spending_secret: utxo_spending_secret,
        nullifier_secret: utxo_nullifier_secret,
        amount: utxo_amount,
        receiver: utxo_spender,
      },
      paramsCallback: async (params) => {
        const { lsigParams, args, lsigsFee } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        depositGroup.deposit({
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            _outHpke: new Uint8Array(250),
            deposit: algorand.createTransaction.payment({
              sender: depositor,
              receiver: withdrawAppClient.appAddress,
              amount: microAlgos(utxo_amount),
            }),
          },
          extraFee: microAlgos(DEPOSIT_APP_FEE + lsigsFee.microAlgos + 1000n),
        });
      },
    });

    await depositGroup.send();

    // Build a trivial Merkle proof for leaf index 0 against the contract root.
    const pathElements: bigint[] = [];
    let currentZero = 0n;
    for (let i = 0; i < TREE_DEPTH; i++) {
      pathElements[i] = currentZero;
      currentZero = await mimcCalculator.calculateHash(currentZero, currentZero);
    }
    const pathSelectors = MerkleTestHelpers.createDefaultPathSelectors();

    const utxoCommitment = await mimcCalculator.sum4Commit([
      utxo_spending_secret,
      utxo_nullifier_secret,
      utxo_amount,
      utxo_spender,
    ]);
    const expectedRoot = await mimcCalculator.calculateMerkleRoot(
      utxoCommitment,
      pathElements,
      pathSelectors,
    );
    const onChainRoot = await withdrawAppClient.state.global.lastComputedRoot();
    expect(expectedRoot).toBe(onChainRoot);

    // Close transaction right after app call; fee is funded by the app call.
    const feePayment = await algorand.createTransaction.payment({
      sender: localSpender,
      receiver: localSpender,
      amount: microAlgos(0),
      staticFee: microAlgos(0),
      closeRemainderTo: withdrawAppClient.appAddress,
    });

    const withdrawExtraFee = WITHDRAW_APP_FEE + WITHDRAW_LSIGS_FEE + 2000n;
    const fee = NULLIFIER_MBR + (1000n + withdrawExtraFee);
    const withdrawAmount = utxo_amount - fee;

    const inputs = {
      withdraw_amount: withdrawAmount,
      fee,
      utxo_spender,
      withdraw_receiver: addressInScalarField(withdrawReceiver),
      utxo_spending_secret: utxo_spending_secret,
      utxo_nullifier_secret: utxo_nullifier_secret,
      utxo_amount,
      path_selectors: pathSelectors,
      utxo_path: pathElements,
    };

    const initialReceiverBalance = (
      await algorand.account.getInformation(withdrawReceiver)
    ).balance.microAlgo;

    const withdrawGroup = withdrawAppClient.newGroup();

    // The spender must exist and stay above min balance until it is closed.
    // Fund it just enough to cover the app-call fee, then close it to the app.
    const fundSpender = await algorand.createTransaction.payment({
      sender: depositor,
      receiver: localSpender,
      amount: microAlgos(110_000n),
    });
    withdrawGroup.addTransaction(fundSpender);

    await withdrawVerifier(algorand).verificationParams({
      composer: withdrawGroup,
      inputs,
      paramsCallback: async (params) => {
        const { lsigParams, args, lsigsFee, extraLsigsTxns } = params;

        console.log(
          '[withdraw] verifier lsigsFee=',
          lsigsFee.microAlgos.toString(),
          'extraLsigsTxns=',
          extraLsigsTxns.length.toString(),
        );

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        withdrawGroup.withdraw({
          sender: localSpender,
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            withdrawReceiver: withdrawReceiver.toString(),
          },
          staticFee: microAlgos(1000n + withdrawExtraFee),
        });

        withdrawGroup.addTransaction(feePayment);
      },
    });

    await withdrawGroup.send();

    const finalReceiverBalance = (
      await algorand.account.getInformation(withdrawReceiver)
    ).balance.microAlgo;
    expect(finalReceiverBalance - initialReceiverBalance).toEqual(withdrawAmount);

    const finalSpenderBalance = (
      await algorand.account.getInformation(localSpender)
    ).balance.microAlgo;
    expect(finalSpenderBalance).toEqual(0n);
  });

  it("withdraw rejects a close txn that pays a third party", async () => {
    const deployment = await MithrasProtocolClient.deploy(algorand, depositor);
    const withdrawAppClient = algorand.client.getTypedAppClientById(MithrasClient, {
      appId: deployment.appClient.appId,
      defaultSender: depositor,
    });

    const localSpender = algorand.account.random();
    const withdrawReceiver = algorand.account.random();

    const utxo_spending_secret = 11n;
    const utxo_nullifier_secret = 22n;
    const utxo_amount = 200_000n;
    const utxo_spender = addressInScalarField(localSpender);

    const depositGroup = withdrawAppClient.newGroup();
    await depositVerifier(algorand).verificationParams({
      composer: depositGroup,
      inputs: {
        spending_secret: utxo_spending_secret,
        nullifier_secret: utxo_nullifier_secret,
        amount: utxo_amount,
        receiver: utxo_spender,
      },
      paramsCallback: async (params) => {
        const { lsigParams, args, lsigsFee } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        depositGroup.deposit({
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            _outHpke: new Uint8Array(250),
            deposit: algorand.createTransaction.payment({
              sender: depositor,
              receiver: withdrawAppClient.appAddress,
              amount: microAlgos(utxo_amount),
            }),
          },
          extraFee: microAlgos(DEPOSIT_APP_FEE + lsigsFee.microAlgos + 1000n),
        });
      },
    });
    await depositGroup.send();

    const pathElements: bigint[] = [];
    let currentZero = 0n;
    for (let i = 0; i < TREE_DEPTH; i++) {
      pathElements[i] = currentZero;
      currentZero = await mimcCalculator.calculateHash(currentZero, currentZero);
    }
    const pathSelectors = MerkleTestHelpers.createDefaultPathSelectors();

    const utxoCommitment = await mimcCalculator.sum4Commit([
      utxo_spending_secret,
      utxo_nullifier_secret,
      utxo_amount,
      utxo_spender,
    ]);
    const expectedRoot = await mimcCalculator.calculateMerkleRoot(
      utxoCommitment,
      pathElements,
      pathSelectors,
    );
    const onChainRoot = await withdrawAppClient.state.global.lastComputedRoot();
    expect(expectedRoot).toBe(onChainRoot);

    const withdrawExtraFee = WITHDRAW_APP_FEE + WITHDRAW_LSIGS_FEE + 2000n;
    const fee = NULLIFIER_MBR + (1000n + withdrawExtraFee);
    const withdrawAmount = utxo_amount - fee;

    const inputs = {
      withdraw_amount: withdrawAmount,
      fee,
      utxo_spender,
      withdraw_receiver: addressInScalarField(withdrawReceiver),
      utxo_spending_secret: utxo_spending_secret,
      utxo_nullifier_secret: utxo_nullifier_secret,
      utxo_amount,
      path_selectors: pathSelectors,
      utxo_path: pathElements,
    };

    const withdrawGroup = withdrawAppClient.newGroup();

    // Ensure sender exists and can pay the app call fee.
    withdrawGroup.addTransaction(
      await algorand.createTransaction.payment({
        sender: depositor,
        receiver: localSpender,
        amount: microAlgos(110_000n),
      }),
    );

    // Malicious close txn: pays a third party before closing remainder.
    const maliciousClose = await algorand.createTransaction.payment({
      sender: localSpender,
      receiver: depositor,
      amount: microAlgos(1),
      staticFee: microAlgos(0),
      closeRemainderTo: withdrawAppClient.appAddress,
    });

    await withdrawVerifier(algorand).verificationParams({
      composer: withdrawGroup,
      inputs,
      paramsCallback: async (params) => {
        const { lsigParams, args } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        withdrawGroup.withdraw({
          sender: localSpender,
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            withdrawReceiver: withdrawReceiver.toString(),
          },
          staticFee: microAlgos(1000n + withdrawExtraFee),
        });

        withdrawGroup.addTransaction(maliciousClose);
      },
    });

    await expect(withdrawGroup.send()).rejects.toThrow();
  });

  it("withdraw rejects proofs with fee too small to cover inner fees", async () => {
    const deployment = await MithrasProtocolClient.deploy(algorand, depositor);
    const withdrawAppClient = algorand.client.getTypedAppClientById(MithrasClient, {
      appId: deployment.appClient.appId,
      defaultSender: depositor,
    });

    const localSpender = algorand.account.random();
    const withdrawReceiver = algorand.account.random();

    const utxo_spending_secret = 11n;
    const utxo_nullifier_secret = 22n;
    const utxo_amount = 200_000n;
    const utxo_spender = addressInScalarField(localSpender);

    const depositGroup = withdrawAppClient.newGroup();
    await depositVerifier(algorand).verificationParams({
      composer: depositGroup,
      inputs: {
        spending_secret: utxo_spending_secret,
        nullifier_secret: utxo_nullifier_secret,
        amount: utxo_amount,
        receiver: utxo_spender,
      },
      paramsCallback: async (params) => {
        const { lsigParams, args, lsigsFee } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        depositGroup.deposit({
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            _outHpke: new Uint8Array(250),
            deposit: algorand.createTransaction.payment({
              sender: depositor,
              receiver: withdrawAppClient.appAddress,
              amount: microAlgos(utxo_amount),
            }),
          },
          extraFee: microAlgos(DEPOSIT_APP_FEE + lsigsFee.microAlgos + 1000n),
        });
      },
    });
    await depositGroup.send();

    const pathElements: bigint[] = [];
    let currentZero = 0n;
    for (let i = 0; i < TREE_DEPTH; i++) {
      pathElements[i] = currentZero;
      currentZero = await mimcCalculator.calculateHash(currentZero, currentZero);
    }
    const pathSelectors = MerkleTestHelpers.createDefaultPathSelectors();

    const utxoCommitment = await mimcCalculator.sum4Commit([
      utxo_spending_secret,
      utxo_nullifier_secret,
      utxo_amount,
      utxo_spender,
    ]);
    const expectedRoot = await mimcCalculator.calculateMerkleRoot(
      utxoCommitment,
      pathElements,
      pathSelectors,
    );
    const onChainRoot = await withdrawAppClient.state.global.lastComputedRoot();
    expect(expectedRoot).toBe(onChainRoot);

    // Intentionally underpay the protocol fee: covers nullifier MBR + ONE inner fee,
    // but withdraw requires TWO inner fees (fund sender + pay receiver).
    const fee = NULLIFIER_MBR + 1000n;
    const withdrawAmount = utxo_amount - fee;

    const inputs = {
      withdraw_amount: withdrawAmount,
      fee,
      utxo_spender,
      withdraw_receiver: addressInScalarField(withdrawReceiver),
      utxo_spending_secret: utxo_spending_secret,
      utxo_nullifier_secret: utxo_nullifier_secret,
      utxo_amount,
      path_selectors: pathSelectors,
      utxo_path: pathElements,
    };

    const withdrawExtraFee = WITHDRAW_APP_FEE + WITHDRAW_LSIGS_FEE + 2000n;
    const withdrawGroup = withdrawAppClient.newGroup();

    // Ensure sender exists and can pay the app call fee.
    withdrawGroup.addTransaction(
      await algorand.createTransaction.payment({
        sender: depositor,
        receiver: localSpender,
        amount: microAlgos(110_000n),
      }),
    );

    const initialReceiverBalance = (
      await algorand.account.getInformation(withdrawReceiver)
    ).balance.microAlgo;

    const feePayment = await algorand.createTransaction.payment({
      sender: localSpender,
      receiver: localSpender,
      amount: microAlgos(0),
      staticFee: microAlgos(0),
      closeRemainderTo: withdrawAppClient.appAddress,
    });

    await withdrawVerifier(algorand).verificationParams({
      composer: withdrawGroup,
      inputs,
      paramsCallback: async (params) => {
        const { lsigParams, args } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        withdrawGroup.withdraw({
          sender: localSpender,
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            withdrawReceiver: withdrawReceiver.toString(),
          },
          staticFee: microAlgos(1000n + withdrawExtraFee),
        });

        withdrawGroup.addTransaction(feePayment);
      },
    });

    await expect(withdrawGroup.send()).rejects.toThrow();

    const finalReceiverBalance = (
      await algorand.account.getInformation(withdrawReceiver)
    ).balance.microAlgo;
    expect(finalReceiverBalance).toEqual(initialReceiverBalance);
  });

  it("deposit -> spend -> withdraw (mixed flow)", async () => {
    // Fresh app so the Merkle indices are deterministic:
    // deposit at index 0, spend outputs at indices 1 and 2.
    const deployment = await MithrasProtocolClient.deploy(algorand, depositor);
    const mixedAppClient = algorand.client.getTypedAppClientById(MithrasClient, {
      appId: deployment.appClient.appId,
      defaultSender: depositor,
    });

    const localSpender = algorand.account.random();
    const withdrawReceiver = algorand.account.random();

    // 1) Deposit a note to localSpender (receiver scalar field).
    const in_spending_secret = 11n;
    const in_nullifier_secret = 22n;
    const in_amount = 300_000n;
    const in_spender = addressInScalarField(localSpender);

    const depositGroup = mixedAppClient.newGroup();
    await depositVerifier(algorand).verificationParams({
      composer: depositGroup,
      inputs: {
        spending_secret: in_spending_secret,
        nullifier_secret: in_nullifier_secret,
        amount: in_amount,
        receiver: in_spender,
      },
      paramsCallback: async (params) => {
        const { lsigParams, args, lsigsFee } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        depositGroup.deposit({
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            _outHpke: new Uint8Array(250),
            deposit: algorand.createTransaction.payment({
              sender: depositor,
              receiver: mixedAppClient.appAddress,
              amount: microAlgos(in_amount),
            }),
          },
          extraFee: microAlgos(DEPOSIT_APP_FEE + lsigsFee.microAlgos + 1000n),
        });
      },
    });
    await depositGroup.send();

    // 2) Spend the deposited note into 2 outputs, one owned by localSpender.
    const feePayment = await algorand.createTransaction.payment({
      sender: localSpender,
      receiver: localSpender,
      amount: microAlgos(0),
      extraFee: microAlgos(SPEND_APP_FEE + LSIGS_FEE + 1000n),
      closeRemainderTo: mixedAppClient.appAddress,
    });
    const fee = NULLIFIER_MBR + feePayment.fee;

    const out0_amount = 150_000n;
    const out1_amount = in_amount - out0_amount - fee;
    expect(out1_amount).toBeGreaterThan(0n);

    const out0_receiver = in_spender; // ensure localSpender can withdraw this output
    const out1_receiver = addressInScalarField(algorand.account.random());
    const out0_spending_secret = 333n;
    const out0_nullifier_secret = 444n;
    const out1_spending_secret = 555n;
    const out1_nullifier_secret = 666n;

    // Merkle path for the input note at index 0 against the post-deposit root.
    const inputPathElements: bigint[] = [];
    let currentZero = 0n;
    for (let i = 0; i < TREE_DEPTH; i++) {
      inputPathElements[i] = currentZero;
      currentZero = await mimcCalculator.calculateHash(currentZero, currentZero);
    }
    const inputPathSelectors = MerkleTestHelpers.createDefaultPathSelectors();

    const inCommitment = await mimcCalculator.sum4Commit([
      in_spending_secret,
      in_nullifier_secret,
      in_amount,
      in_spender,
    ]);
    const depositRoot = await mixedAppClient.state.global.lastComputedRoot();
    const computedDepositRoot = await mimcCalculator.calculateMerkleRoot(
      inCommitment,
      inputPathElements,
      inputPathSelectors,
    );
    expect(computedDepositRoot).toBe(depositRoot);

    const spendInputs = {
      fee,
      utxo_spender: in_spender,
      utxo_spending_secret: in_spending_secret,
      utxo_nullifier_secret: in_nullifier_secret,
      utxo_amount: in_amount,
      path_selectors: inputPathSelectors,
      utxo_path: inputPathElements,
      out0_amount,
      out0_receiver,
      out0_spending_secret,
      out0_nullifier_secret,
      out1_amount,
      out1_receiver,
      out1_spending_secret,
      out1_nullifier_secret,
    };

    const spendGroup = mixedAppClient.newGroup();
    await spendVerifier(algorand).verificationParams({
      composer: spendGroup,
      inputs: spendInputs,
      paramsCallback: async (params) => {
        const { lsigParams, args } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        spendGroup.spend({
          sender: localSpender,
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            _out0Hpke: new Uint8Array(250),
            _out1Hpke: new Uint8Array(250),
          },
          staticFee: microAlgos(0),
        });
        spendGroup.addTransaction(feePayment);
      },
    });

    await spendGroup.send();

    // 3) Withdraw the out0 note at leaf index 1 using a non-trivial Merkle path.
    const out0Commitment = await mimcCalculator.sum4Commit([
      out0_spending_secret,
      out0_nullifier_secret,
      out0_amount,
      out0_receiver,
    ]);
    const out1Commitment = await mimcCalculator.sum4Commit([
      out1_spending_secret,
      out1_nullifier_secret,
      out1_amount,
      out1_receiver,
    ]);

    const leafByIndex = new Map<number, bigint>([
      [0, inCommitment],
      [1, out0Commitment],
      [2, out1Commitment],
    ]);
    const { pathElements, pathSelectors, root } = await computeMerklePathForIndex({
      leafIndex: 1,
      leafByIndex,
    });
    const onChainRootAfterSpend = await mixedAppClient.state.global.lastComputedRoot();
    expect(root).toBe(onChainRootAfterSpend);

    const feePaymentClose = await algorand.createTransaction.payment({
      sender: localSpender,
      receiver: localSpender,
      amount: microAlgos(0),
      staticFee: microAlgos(0),
      closeRemainderTo: mixedAppClient.appAddress,
    });

    const withdrawExtraFee = WITHDRAW_APP_FEE + WITHDRAW_LSIGS_FEE + 2000n;
    const withdrawFee = NULLIFIER_MBR + (1000n + withdrawExtraFee);
    const withdrawAmount = out0_amount - withdrawFee;
    expect(withdrawAmount).toBeGreaterThan(0n);

    const withdrawInputs = {
      withdraw_amount: withdrawAmount,
      fee: withdrawFee,
      utxo_spender: in_spender,
      withdraw_receiver: addressInScalarField(withdrawReceiver),
      utxo_spending_secret: out0_spending_secret,
      utxo_nullifier_secret: out0_nullifier_secret,
      utxo_amount: out0_amount,
      path_selectors: pathSelectors,
      utxo_path: pathElements,
    };

    const initialReceiverBalance = (
      await algorand.account.getInformation(withdrawReceiver)
    ).balance.microAlgo;

    const withdrawGroup = mixedAppClient.newGroup();

    // Fund the spender so it can pay the app-call fee, then close it back to the app.
    withdrawGroup.addTransaction(
      await algorand.createTransaction.payment({
        sender: depositor,
        receiver: localSpender,
        amount: microAlgos(110_000n),
      }),
    );

    await withdrawVerifier(algorand).verificationParams({
      composer: withdrawGroup,
      inputs: withdrawInputs,
      paramsCallback: async (params) => {
        const { lsigParams, args } = params;

        const verifierTxn = algorand.createTransaction.payment({
          ...lsigParams,
          receiver: lsigParams.sender,
          amount: microAlgos(0),
        });

        withdrawGroup.withdraw({
          sender: localSpender,
          args: {
            verifierTxn,
            signals: args.signals,
            _proof: args.proof,
            withdrawReceiver: withdrawReceiver.toString(),
          },
          staticFee: microAlgos(1000n + withdrawExtraFee),
        });

        withdrawGroup.addTransaction(feePaymentClose);
      },
    });

    await withdrawGroup.send();

    const finalReceiverBalance = (
      await algorand.account.getInformation(withdrawReceiver)
    ).balance.microAlgo;
    expect(finalReceiverBalance - initialReceiverBalance).toEqual(withdrawAmount);

    const finalSpenderBalance = (await algorand.account.getInformation(localSpender)).balance.microAlgo;
    expect(finalSpenderBalance).toEqual(0n);
  });
});
