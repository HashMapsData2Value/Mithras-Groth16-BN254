import { AlgorandSubscriber } from "@algorandfoundation/algokit-subscriber";
import algosdk from "algosdk";
import { HpkeEnvelope, MimcMerkleTree, TransactionMetadata, UtxoSecrets, deriveStealthPubkey, bytesToNumberBE, } from "mithras-crypto";
import base32 from "hi-base32";
import appspec from "./Mithras.arc56.json" with { type: "json" };
const DEPOSIT_SIGNATURE = "deposit(uint256[],(byte[64],byte[128],byte[64]),byte[250],pay,txn)void";
const SPEND_SIGNATURE = "spend(uint256[],(byte[64],byte[128],byte[64]),byte[250],byte[250],txn)void";
const WITHDRAW_SIGNATURE = "withdraw(uint256[],(byte[64],byte[128],byte[64]),address,txn)void";
const DEPOSIT_SELECTOR = algosdk.ABIMethod.fromSignature(DEPOSIT_SIGNATURE).getSelector();
const SPEND_SELECTOR = algosdk.ABIMethod.fromSignature(SPEND_SIGNATURE).getSelector();
const WITHDRAW_SELECTOR = algosdk.ABIMethod.fromSignature(WITHDRAW_SIGNATURE).getSelector();
export function equalBytes(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
export class MithrasMethod {
    constructor(type, hpke_envelopes, commitments, nullifier) {
        this.type = type;
        this.hpke_envelopes = hpke_envelopes;
        this.commitments = commitments;
        this.nullifier = nullifier;
    }
    static fromArgs(args) {
        if (args.length === 0) {
            console.debug("No arguments provided in application call");
            return null;
        }
        const selector = args[0];
        if (equalBytes(selector, DEPOSIT_SELECTOR)) {
            console.debug("Parsing deposit method from application call arguments");
            if (args.length !== 4) {
                return null;
            }
            const commitment = args[1].slice(0 + 2, 32 + 2);
            const hpkeBytes = args[3];
            const hpkeEnvelope = HpkeEnvelope.fromBytes(hpkeBytes);
            return new MithrasMethod("deposit", [hpkeEnvelope], [commitment].map((b) => bytesToNumberBE(b)));
        }
        else if (equalBytes(selector, SPEND_SELECTOR)) {
            console.debug("Parsing spend method from application call arguments");
            if (args.length !== 5) {
                return null;
            }
            const commitment0 = args[1].slice(0 + 2, 32 + 2);
            const commitment1 = args[1].slice(32 + 2, 64 + 2);
            const nullifier = args[1].slice(96 + 2, 128 + 2);
            const hpkeBytes0 = args[3];
            const hpkeEnvelope0 = HpkeEnvelope.fromBytes(hpkeBytes0);
            const hpkeBytes1 = args[4];
            const hpkeEnvelope1 = HpkeEnvelope.fromBytes(hpkeBytes1);
            return new MithrasMethod("spend", [hpkeEnvelope0, hpkeEnvelope1], [commitment0, commitment1].map((b) => bytesToNumberBE(b)), bytesToNumberBE(nullifier));
        }
        else if (equalBytes(selector, WITHDRAW_SELECTOR)) {
            console.debug("Parsing withdraw method from application call arguments");
            if (args.length !== 4) {
                return null;
            }
            const nullifier = args[1].slice(32 + 2, 64 + 2);
            return new MithrasMethod("withdraw", [], [], bytesToNumberBE(nullifier));
        }
        else {
            console.debug(`Unknown method selector: ${selector}. Expected ${DEPOSIT_SELECTOR} or ${SPEND_SELECTOR} or ${WITHDRAW_SELECTOR}`);
            return null;
        }
    }
    verifyCommitment(utxo) {
        const commitment = utxo.computeCommitment();
        return this.commitments.some((c) => c === commitment);
    }
}
export async function algodUtxoLookup(algod, info, viewKeypair) {
    const block = await algod.block(algosdk.decodeUint64(info.round)).do();
    const transaction = block.block.payset.find((t) => {
        const txn = t.signedTxn.signedTxn.txn;
        // @ts-expect-error - readonly
        txn.genesisHash = block.block.header.genesisHash;
        // @ts-expect-error - readonly
        txn.genesisID = block.block.header.genesisID;
        return equalBytes(info.txid, txn.rawTxID());
    });
    console.debug("Found transaction for UTXO lookup:", transaction);
    const appl = transaction?.signedTxn.signedTxn.txn.applicationCall;
    const method = MithrasMethod.fromArgs(appl?.appArgs ?? []);
    if (method === null) {
        throw new Error("Failed to parse method from transaction application call");
    }
    const txn = transaction?.signedTxn.signedTxn.txn;
    const txnMetadata = new TransactionMetadata(txn.sender.publicKey, txn.firstValid, txn.lastValid, txn.lease ?? new Uint8Array(32), 0, // TODO: handle network ID
    appl?.appIndex);
    const delta = transaction?.signedTxn.applyData.evalDelta?.globalDelta;
    const key = new TextEncoder().encode("i");
    let treeIndex = null;
    for (const [k, v] of delta ?? []) {
        if (equalBytes(k, key)) {
            treeIndex = Number(v.uint);
        }
    }
    if (treeIndex === null) {
        throw new Error(`Failed to find index in global delta for UTXO lookup: ${delta}`);
    }
    // The index in the global state delta is the next index to be used. This means that for a deposit (one commitment leaf), we need to subtract one. For a spend (two commitment leaves, thus two increments), we need to first know whether or not we are spending the first or second commitment (out0 vs out1) and then subtract either one or two.
    if (method.type === "spend" && info.firstCommitment) {
        treeIndex -= 2;
    }
    else {
        treeIndex -= 1;
    }
    const hpkeEnv = method.hpke_envelopes[info.firstCommitment ? 0 : 1];
    const secrets = await UtxoSecrets.fromHpkeEnvelope(hpkeEnv, viewKeypair, txnMetadata);
    return {
        secrets,
        treeIndex,
    };
}
async function resolveStartRound(config) {
    const { appId, algod } = config;
    let creationRound = undefined;
    if (config.startRound === undefined) {
        if (config.merkleTree && config.merkleTree.getLeafCount() > 0) {
            throw new Error("When starting the subscriber with a pre-constructed Merkle tree, the startRound must be provided");
        }
        for (const g of (await algod.getApplicationByID(appId).do()).params
            .globalState ?? []) {
            if (new TextDecoder().decode(g.key) === "cr") {
                creationRound = BigInt(g.value.uint);
                console.debug(`Found creation round ${creationRound} in application global state`);
                break;
            }
        }
        if (creationRound === undefined) {
            throw new Error("Failed to find creation round in application global state");
        }
    }
    return config.startRound ?? creationRound;
}
class BaseMithrasSubscriber {
    constructor(options) {
        const { algod, appId, startRound, viewKeypair, spendPubkey, merkleTree, balanceState, } = options;
        let watermark = startRound;
        this.merkleTree = merkleTree;
        this.balanceState = balanceState;
        const filter = {
            appId,
            methodSignature: [DEPOSIT_SIGNATURE, SPEND_SIGNATURE, WITHDRAW_SIGNATURE],
        };
        const config = {
            filters: [{ name: "mithras", filter }],
            syncBehaviour: "sync-oldest",
            watermarkPersistence: {
                get: async () => {
                    return watermark;
                },
                set: async (newWatermark) => {
                    watermark = newWatermark;
                },
            },
            arc28Events: [
                {
                    groupName: "mithras",
                    events: appspec.events,
                },
            ],
        };
        this.subscriber = new AlgorandSubscriber(config, algod);
        this.subscriber.on("mithras", async (txn) => {
            console.debug(`Processing transaction ${txn.id} in round ${txn.confirmedRound}`);
            if (this.merkleTree) {
                for (const event of txn.arc28Events ?? []) {
                    const { leaf } = event.argsByName;
                    this.merkleTree.addLeaf(leaf);
                }
            }
            if (balanceState === undefined ||
                viewKeypair === undefined ||
                spendPubkey === undefined) {
                console.debug("View keypair or spend public key not provided, skipping balance update logic");
                return;
            }
            const appl = txn.applicationTransaction;
            const method = MithrasMethod.fromArgs(appl.applicationArgs);
            if (method === null) {
                console.debug(`Failed to parse method from transaction ${txn.id}`);
                return;
            }
            if ((method.type === "spend" || method.type === "withdraw") &&
                method.nullifier !== undefined &&
                balanceState.utxos.has(method.nullifier)) {
                const { amount } = balanceState.utxos.get(method.nullifier);
                balanceState.amount -= algosdk.decodeUint64(amount, "bigint");
                balanceState.utxos.delete(method.nullifier);
            }
            let firstCommitment = false;
            for (const envelope of method.hpke_envelopes) {
                firstCommitment = !firstCommitment;
                const txnMetadata = new TransactionMetadata(algosdk.Address.fromString(txn.sender).publicKey, txn.firstValid, txn.lastValid, txn.lease || new Uint8Array(32), 0, // TODO: handle network ID
                appId);
                console.debug(`Performing view check for HPKE envelope in transaction ${txn.id}...`);
                if (!envelope.viewCheck(viewKeypair.privateKey, txnMetadata)) {
                    console.debug(`HPKE envelope in transaction ${txn.id} failed view check, skipping...`);
                    continue;
                }
                console.debug(`Decrypting HPKE envelope for transaction ${txn.id}...`);
                const utxo = await UtxoSecrets.fromHpkeEnvelope(envelope, viewKeypair, txnMetadata);
                console.debug(`Verifying commitment for UTXO from transaction ${txn.id}...`);
                if (!method.verifyCommitment(utxo)) {
                    console.debug(`UTXO commitment verification failed for transaction ${txn.id}, got commitment ${utxo.computeCommitment()} but expected one of ${method.commitments}`);
                    continue;
                }
                const derivedStealthPublicKey = deriveStealthPubkey(spendPubkey, utxo.stealthScalar);
                if (!equalBytes(derivedStealthPublicKey, utxo.stealthPubkey)) {
                    console.debug(`Derived stealth public key does not match expected stealth public key for transaction ${txn.id}, skipping...`);
                    continue;
                }
                const nullifier = utxo.computeNullifier();
                if (balanceState.utxos.has(nullifier)) {
                    console.debug(`Nullifier ${nullifier} from transaction ${txn.id} already exists in balance state, skipping...`);
                    continue;
                }
                else {
                    balanceState.utxos.set(nullifier, {
                        round: algosdk.encodeUint64(txn.confirmedRound ?? 0n),
                        amount: algosdk.encodeUint64(utxo.amount),
                        txid: new Uint8Array(base32.decode.asBytes(txn.id)),
                        firstCommitment,
                    });
                }
                console.debug(`Adding amount ${utxo.amount} from tx ${txn.id}`);
                balanceState.amount += utxo.amount;
            }
        });
    }
}
export class BalanceSubscriber extends BaseMithrasSubscriber {
    static async fromAppId(config) {
        const startRound = await resolveStartRound({
            appId: config.appId,
            algod: config.algod,
            startRound: config.startRound,
        });
        return new BalanceSubscriber(config.algod, config.appId, startRound, config.viewKeypair, config.spendPubkey);
    }
    constructor(algod, appId, startRound, viewKeypair, spendPubkey) {
        const balanceState = {
            amount: 0n,
            utxos: new Map(),
        };
        super({
            algod,
            appId,
            startRound,
            viewKeypair,
            spendPubkey: spendPubkey,
            balanceState,
        });
        this.balanceState = balanceState;
    }
    get amount() {
        return this.balanceState.amount;
    }
    set amount(value) {
        this.balanceState.amount = value;
    }
    get utxos() {
        return this.balanceState.utxos;
    }
}
export class TreeSubscriber extends BaseMithrasSubscriber {
    static async fromAppId(config) {
        const startRound = await resolveStartRound({
            appId: config.appId,
            algod: config.algod,
            startRound: config.startRound,
            merkleTree: config.merkleTree,
        });
        return new TreeSubscriber(config.algod, config.appId, startRound, config.merkleTree ?? new MimcMerkleTree());
    }
    constructor(algod, appId, startRound, merkleTree) {
        super({
            algod,
            appId,
            startRound,
            merkleTree,
        });
        this.merkleTree = merkleTree;
    }
}
export class BalanceAndTreeSubscriber extends BaseMithrasSubscriber {
    static async fromAppId(config) {
        const startRound = await resolveStartRound({
            appId: config.appId,
            algod: config.algod,
            startRound: config.startRound,
            merkleTree: config.merkleTree,
        });
        return new BalanceAndTreeSubscriber(config.algod, config.appId, startRound, config.viewKeypair, config.merkleTree ?? new MimcMerkleTree(), config.spendPubkey);
    }
    constructor(algod, appId, startRound, viewKeypair, merkleTree, spendPubkey) {
        const balanceState = {
            amount: 0n,
            utxos: new Map(),
        };
        super({
            algod,
            appId,
            startRound,
            viewKeypair,
            spendPubkey,
            merkleTree,
            balanceState,
        });
        this.balanceState = balanceState;
        this.merkleTree = merkleTree;
    }
    get amount() {
        return this.balanceState.amount;
    }
    set amount(value) {
        this.balanceState.amount = value;
    }
    get utxos() {
        return this.balanceState.utxos;
    }
}
//# sourceMappingURL=index.js.map