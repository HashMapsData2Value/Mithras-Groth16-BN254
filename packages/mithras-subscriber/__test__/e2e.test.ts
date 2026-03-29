import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { MithrasClient } from "../../mithras-contracts-and-circuits/contracts/clients/Mithras";

import { beforeAll, describe, expect, it } from "vitest";
import { Address } from "algosdk";
import { MithrasProtocolClient } from "../../mithras-contracts-and-circuits/src";
import { MithrasAccount } from "../../mithras-crypto/src";
import { algodUtxoLookup, BalanceAndTreeSubscriber } from "../src";

describe("Mithras App", () => {
  let appClient: MithrasClient;
  let algorand: AlgorandClient;
  let depositor: Address;

  const verifierOpts = {
    // NOTE: These tests run with cwd = packages/mithras-subscriber.
    // The contracts package defaults resolve circuit artifacts relative to cwd,
    // so we pass explicit paths to the monorepo's canonical circuits.
    depositZKeyPath:
      "../mithras-contracts-and-circuits/circuits/deposit_test.zkey",
    depositWasmPath:
      "../mithras-contracts-and-circuits/circuits/deposit_js/deposit.wasm",
    spendZKeyPath: "../mithras-contracts-and-circuits/circuits/spend_test.zkey",
    spendWasmPath: "../mithras-contracts-and-circuits/circuits/spend_js/spend.wasm",
    withdrawZKeyPath:
      "../mithras-contracts-and-circuits/circuits/withdraw_test.zkey",
    withdrawWasmPath:
      "../mithras-contracts-and-circuits/circuits/withdraw_js/withdraw.wasm",
  } as const;

  const testSpend = async (
    client: MithrasProtocolClient,
    spender: MithrasAccount,
    spenderSubscriber: BalanceAndTreeSubscriber,
    amount: bigint,
  ) => {
    const utxo = spenderSubscriber.utxos.entries().next().value;
    const spenderView = spender.viewKeypair;
    const spenderKeypair = spender.spendKeypair;

    const { secrets, treeIndex } = await algodUtxoLookup(
      algorand.client.algod,
      utxo[1],
      spenderView,
    );

    const receiver = MithrasAccount.generate();

    const spendGroup = await client.composeSpendGroup(
      spender.address,
      spenderKeypair,
      secrets,
      spenderSubscriber.merkleTree.getMerkleProof(treeIndex),
      { receiver: receiver.address, amount },
    );

    // NOTE: There seems to be a bug with the signer for the lsig, for some reason the lsig txn is getting a ed25519 sig
    const innerComposer = await spendGroup.composer();
    const { atc } = await innerComposer.build();
    const txnsWithSigners = atc.buildGroup();
    txnsWithSigners[0]!.signer = (
      await client.spendVerifier.lsigAccount()
    ).signer;

    const composer = algorand.newGroup();
    composer.addAtc(atc);

    await composer.send();

    const receiversSubscriber = await BalanceAndTreeSubscriber.fromAppId({
      algod: algorand.client.algod,
      appId: appClient.appId,
      viewKeypair: receiver.viewKeypair,
      spendPubkey: receiver.spendKeypair.publicKey,
    });

    await receiversSubscriber.subscriber.pollOnce();

    expect(receiversSubscriber.amount).toBe(amount);

    return { receiver, receiversSubscriber };
  };

  beforeAll(async () => {
    algorand = AlgorandClient.defaultLocalNet();
    depositor = await algorand.account.localNetDispenser();
    console.log("Address depositor beforeall:", depositor.toString());

    algorand.setSuggestedParamsCacheTimeout(0);

    const deployment = await MithrasProtocolClient.deploy(
      algorand,
      depositor,
      verifierOpts,
    );

    appClient = algorand.client.getTypedAppClientById(MithrasClient, {
      appId: deployment.appClient.appId,
      defaultSender: depositor,
    });
  });

  it("deposit and spend", async () => {
    const initialReceiver = MithrasAccount.generate();
    const client = new MithrasProtocolClient(algorand, appClient.appId, verifierOpts);

    console.log("initial receiver:", initialReceiver.address);

    const initialAmount = 1_000_000n;

    const { group: depositGroup } = await client.composeDepositGroup(
      depositor,
      initialAmount,
      initialReceiver.address,
    );
    console.log("Imse");

    await depositGroup.send();

    const subscriber = await BalanceAndTreeSubscriber.fromAppId({
      algod: algorand.client.algod,
      appId: appClient.appId,
      viewKeypair: initialReceiver.viewKeypair,
      spendPubkey: initialReceiver.spendKeypair.publicKey,
    });

    console.log("Vimse");

    expect(subscriber.amount).toBe(0n);

    await subscriber.subscriber.pollOnce();

    expect(subscriber.amount).toBe(initialAmount);

    console.log("Spindel");

    const utxo = subscriber.utxos.entries().next().value;

    const { secrets } = await algodUtxoLookup(
      algorand.client.algod,
      utxo[1],
      initialReceiver.viewKeypair,
    );

    console.log("Klättrar");

    expect(secrets.amount).toBe(initialAmount);

    const contractRoot = await appClient.state.global.lastComputedRoot();

    console.log("Upp för");

    expect(contractRoot).toEqual(subscriber.merkleTree.getRoot());
    const {
      receiver: secondReceiver,
      receiversSubscriber: secondReceiversSubscriber,
    } = await testSpend(
      client,
      initialReceiver,
      subscriber,
      initialAmount / 2n,
    );

    console.log("We got all the way to here...");
    await testSpend(
      client,
      secondReceiver,
      secondReceiversSubscriber,
      initialAmount / 4n,
    );
  });
});
