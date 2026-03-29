import { describe, it, beforeAll, expect } from "vitest";
import {
  CircuitTester,
  MerkleTestHelpers,
  MimcCalculator,
} from "./utils/test-utils";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { Groth16Bn254AppVerifier } from "snarkjs-algorand";

describe("Withdraw Circuit", () => {
  let circuit: any;
  let mimc: MimcCalculator;

  beforeAll(async () => {
    circuit = await CircuitTester.create({
      circuitPath: "circuits/withdraw.circom",
    });
    mimc = await MimcCalculator.create();
  });

  it("verifies merkle path, outputs nullifier + withdraw_tag, and enforces withdraw_amount + fee = utxo_amount", async () => {
    const utxo_spender = 999n;
    const utxo_spending_secret = 111n;
    const utxo_nullifier_secret = 222n;
    const utxo_amount = 1000n;

    const fee = 7n;
    const withdraw_amount = 993n;
    const withdraw_receiver = 1234n;

    const utxo_commitment = await mimc.sum4Commit([
      utxo_spending_secret,
      utxo_nullifier_secret,
      utxo_amount,
      utxo_spender,
    ]);

    const pathElements = MerkleTestHelpers.createDefaultPathElements();
    const pathSelectors = MerkleTestHelpers.createDefaultPathSelectors();

    const utxo_root = await mimc.calculateMerkleRoot(
      utxo_commitment,
      pathElements,
      pathSelectors,
    );

    const expected_nullifier = await mimc.calculateHash(
      utxo_commitment,
      utxo_nullifier_secret,
    );

    const expected_withdraw_tag = await mimc.sum4Commit([
      expected_nullifier,
      withdraw_receiver,
      withdraw_amount,
      fee,
    ]);

    const witness = await circuit.calculateWitness({
      withdraw_amount,
      fee,
      utxo_spender,
      withdraw_receiver,
      utxo_spending_secret,
      utxo_nullifier_secret,
      utxo_amount,
      path_selectors: pathSelectors,
      utxo_path: pathElements,
    });
    await circuit.checkConstraints(witness);

    // Outputs are ordered as declared: utxo_root, utxo_nullifier, withdraw_tag
    expect(witness[1]).toBe(utxo_root);
    expect(witness[2]).toBe(expected_nullifier);
    expect(witness[3]).toBe(expected_withdraw_tag);
  });

  it("fails when withdraw does not exhaust note", async () => {
    const utxo_spender = 1n;
    const utxo_spending_secret = 2n;
    const utxo_nullifier_secret = 3n;
    const utxo_amount = 10n;

    const fee = 2n;
    const withdraw_amount = 9n; // 9 + 2 != 10
    const withdraw_receiver = 5n;

    const pathElements = MerkleTestHelpers.createDefaultPathElements();
    const pathSelectors = MerkleTestHelpers.createDefaultPathSelectors();

    await expect(async () => {
      const witness = await circuit.calculateWitness({
        withdraw_amount,
        fee,
        utxo_spender,
        withdraw_receiver,
        utxo_spending_secret,
        utxo_nullifier_secret,
        utxo_amount,
        path_selectors: pathSelectors,
        utxo_path: pathElements,
      });
      await circuit.checkConstraints(witness);
    }).rejects.toThrow();
  });

  it("verifies on chain", async () => {
    const utxo_spender = 999n;
    const utxo_spending_secret = 111n;
    const utxo_nullifier_secret = 222n;
    const utxo_amount = 1000n;

    const fee = 7n;
    const withdraw_amount = 993n;
    const withdraw_receiver = 1234n;

    const pathElements = MerkleTestHelpers.createDefaultPathElements();
    const pathSelectors = MerkleTestHelpers.createDefaultPathSelectors();

    const algorand = AlgorandClient.defaultLocalNet();
    const verifier = new Groth16Bn254AppVerifier({
      algorand,
      zKey: "circuits/withdraw_test.zkey",
      wasmProver: "circuits/withdraw_js/withdraw.wasm",
    });

    await verifier.deploy({
      defaultSender: await algorand.account.localNetDispenser(),
      onUpdate: "append",
      debugLogging: false,
    });

    const inputs = {
      withdraw_amount,
      fee,
      utxo_spender,
      withdraw_receiver,
      utxo_spending_secret,
      utxo_nullifier_secret,
      utxo_amount,
      path_selectors: pathSelectors,
      utxo_path: pathElements,
    };

    const simRes = await verifier.simulateVerification(inputs, {
      extraOpcodeBudget: 20_000 * 16,
    });

    const consumed = simRes.simulateResponse.txnGroups[0]!.appBudgetConsumed;
    expect(consumed).toBeGreaterThan(0);
  });
});
