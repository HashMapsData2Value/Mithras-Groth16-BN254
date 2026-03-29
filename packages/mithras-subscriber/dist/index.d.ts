import { AlgorandSubscriber } from "@algorandfoundation/algokit-subscriber";
import algosdk from "algosdk";
import { ViewKeypair, HpkeEnvelope, MimcMerkleTree, UtxoSecrets } from "mithras-crypto";
export declare function equalBytes(a: Uint8Array, b: Uint8Array): boolean;
export declare class MithrasMethod {
    type: "deposit" | "spend" | "withdraw";
    hpke_envelopes: HpkeEnvelope[];
    commitments: bigint[];
    nullifier?: bigint | undefined;
    private constructor();
    static fromArgs(args: readonly Uint8Array[]): MithrasMethod | null;
    verifyCommitment(utxo: UtxoSecrets): boolean;
}
export type UtxoInfo = {
    amount: Uint8Array;
    round: Uint8Array;
    txid: Uint8Array;
    firstCommitment: boolean;
};
export declare function algodUtxoLookup(algod: algosdk.Algodv2, info: UtxoInfo, viewKeypair: ViewKeypair): Promise<{
    secrets: UtxoSecrets;
    treeIndex: number;
}>;
export type BalanceSubscriberConfig = {
    viewKeypair: ViewKeypair;
    spendPubkey: Uint8Array;
};
export type MerkleTreeSubscriberConfig = {
    merkleTree?: MimcMerkleTree;
};
export type BalanceAndTreeSubscriberConfig = BalanceSubscriberConfig & MerkleTreeSubscriberConfig;
type BalanceState = {
    amount: bigint;
    /**
     * Maps nullifiers to the amount (BE uint64), round (BE uint64), and txid (raw 32 bytes) for the corresponding UTXO.
     *
     * To spend the UTXO, there needs to be a lookup of the transaction to get the merkle path from the
     * NewLeaf "log" (inner txn args). The round is included to enable lookup of the transaction with
     * an archival algod (and not a full indexer) by getting the block and then finding the tranasction
     *
     * The numbers are encoded as big-endian bytes so they have a fixed size in memory.
     * Each map value is 8 (amount) + 8 (round) + 32 (txid) = 48 bytes
     * so the memory usage of this map can be easily calculated based on the number of UTXOs stored.
     */
    utxos: Map<bigint, UtxoInfo>;
};
type BaseSubscriberConfig = {
    appId: bigint;
    algod: algosdk.Algodv2;
    startRound?: bigint;
};
type BaseSubscriberOptions = {
    algod: algosdk.Algodv2;
    appId: bigint;
    startRound: bigint;
    viewKeypair?: ViewKeypair;
    spendPubkey?: Uint8Array;
    merkleTree?: MimcMerkleTree;
    balanceState?: BalanceState;
};
declare class BaseMithrasSubscriber {
    subscriber: AlgorandSubscriber;
    protected merkleTree?: MimcMerkleTree;
    protected balanceState?: BalanceState;
    protected constructor(options: BaseSubscriberOptions);
}
export declare class BalanceSubscriber extends BaseMithrasSubscriber {
    static fromAppId(config: BaseSubscriberConfig & BalanceSubscriberConfig): Promise<BalanceSubscriber>;
    constructor(algod: algosdk.Algodv2, appId: bigint, startRound: bigint, viewKeypair: ViewKeypair, spendPubkey: Uint8Array);
    get amount(): bigint;
    set amount(value: bigint);
    get utxos(): Map<bigint, UtxoInfo>;
}
export declare class TreeSubscriber extends BaseMithrasSubscriber {
    merkleTree: MimcMerkleTree;
    static fromAppId(config: BaseSubscriberConfig & MerkleTreeSubscriberConfig): Promise<TreeSubscriber>;
    constructor(algod: algosdk.Algodv2, appId: bigint, startRound: bigint, merkleTree: MimcMerkleTree);
}
export declare class BalanceAndTreeSubscriber extends BaseMithrasSubscriber {
    merkleTree: MimcMerkleTree;
    static fromAppId(config: BaseSubscriberConfig & BalanceAndTreeSubscriberConfig): Promise<BalanceAndTreeSubscriber>;
    constructor(algod: algosdk.Algodv2, appId: bigint, startRound: bigint, viewKeypair: ViewKeypair, merkleTree: MimcMerkleTree, spendPubkey: Uint8Array);
    get amount(): bigint;
    set amount(value: bigint);
    get utxos(): Map<bigint, UtxoInfo>;
}
export {};
//# sourceMappingURL=index.d.ts.map