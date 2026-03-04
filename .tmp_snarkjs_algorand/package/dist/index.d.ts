import * as snarkjs from 'snarkjs';
export { snarkjs };
import { AlgorandClient as AlgorandClient$1 } from '@algorandfoundation/algokit-utils';
import * as _algorandfoundation_algokit_utils_types_composer from '@algorandfoundation/algokit-utils/types/composer';
import { AppCallMethodCall, TransactionComposer, SkipSignaturesSimulateOptions, RawSimulateOptions } from '@algorandfoundation/algokit-utils/types/composer';
import * as _algorandfoundation_algokit_utils_types_app_manager from '@algorandfoundation/algokit-utils/types/app-manager';
import * as _algorandfoundation_algokit_utils_types_account from '@algorandfoundation/algokit-utils/types/account';
import * as _algorandfoundation_algokit_utils_types_amount from '@algorandfoundation/algokit-utils/types/amount';
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount';
import * as _algorandfoundation_algokit_utils_types_transaction from '@algorandfoundation/algokit-utils/types/transaction';
import { SendParams, SendAtomicTransactionComposerResults } from '@algorandfoundation/algokit-utils/types/transaction';
import * as _algorandfoundation_algokit_utils_types_app from '@algorandfoundation/algokit-utils/types/app';
import { ABIReturn } from '@algorandfoundation/algokit-utils/types/app';
import * as _algorandfoundation_algokit_utils_types_app_arc56 from '@algorandfoundation/algokit-utils/types/app-arc56';
import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56';
import * as algosdk from 'algosdk';
import { Address, OnApplicationComplete, Transaction, TransactionSigner, modelsv2 } from 'algosdk';
import { AlgorandClient } from '@algorandfoundation/algokit-utils/types/algorand-client';
import { AppClient, AppClientParams, ResolveAppClientByCreatorAndName, ResolveAppClientByNetwork, AppClientMethodCallParams, AppClientBareCallParams, CloneAppClientParams, AppClientCompilationParams } from '@algorandfoundation/algokit-utils/types/app-client';
import { AppFactory, AppFactoryParams, AppFactoryAppClientParams, AppFactoryResolveAppClientByCreatorAndNameParams, AppFactoryDeployParams, CreateSchema } from '@algorandfoundation/algokit-utils/types/app-factory';
import { Encodable, Schema } from '../../../../encoding/encoding.js';
import { SignedTransaction } from '../../../../signedTransaction.js';
import { Address as Address$1 } from '../../../../encoding/address.js';

declare function stringValuesToBigints(obj: any): any;

/**
 * Expands types for IntelliSense so they are more human readable
 * See https://stackoverflow.com/a/69288824
 */
type Expand$8<T> = T extends (...args: infer A) => infer R ? (...args: Expand$8<A>) => Expand$8<R> : T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type PlonkProof$2 = {
    a: Uint8Array;
    b: Uint8Array;
    c: Uint8Array;
    z: Uint8Array;
    t1: Uint8Array;
    t2: Uint8Array;
    t3: Uint8Array;
    wxi: Uint8Array;
    wxiw: Uint8Array;
    evalA: bigint;
    evalB: bigint;
    evalC: bigint;
    evalS1: bigint;
    evalS2: bigint;
    evalZw: bigint;
};
type PlonkVerificationKey$1 = {
    qm: Uint8Array;
    ql: Uint8Array;
    qr: Uint8Array;
    qo: Uint8Array;
    qc: Uint8Array;
    s1: Uint8Array;
    s2: Uint8Array;
    s3: Uint8Array;
    power: bigint;
    nPublic: bigint;
    k1: bigint;
    k2: bigint;
    x_2: Uint8Array;
};
/**
 * The argument types for the PlonkVerifier contract
 */
type PlonkVerifierArgs = {
    /**
     * The object representation of the arguments for each method
     */
    obj: {
        '_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void': {
            _vk: PlonkVerificationKey$1;
        };
        'verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void': {
            signals: bigint[] | number[];
            proof: PlonkProof$2;
        };
    };
    /**
     * The tuple representation of the arguments for each method
     */
    tuple: {
        '_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void': [_vk: PlonkVerificationKey$1];
        'verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void': [signals: bigint[] | number[], proof: PlonkProof$2];
    };
};
/**
 * The return type for each method
 */
type PlonkVerifierReturns = {
    '_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void': void;
    'verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void': void;
};
/**
 * Defines an object containing all relevant parameters for a single call to the contract.
 */
type CallParams$8<TArgs> = Expand$8<Omit<AppClientMethodCallParams, 'method' | 'args' | 'onComplete'> & {
    /** The args for the ABI method call, either as an ordered array or an object */
    args: Expand$8<TArgs>;
}>;
/**
 * Defines supported create method params for this smart contract
 */
type PlonkVerifierCreateCallParams = Expand$8<AppClientBareCallParams & {
    method?: never;
} & {
    onComplete?: OnApplicationComplete.NoOpOC;
} & CreateSchema>;
/**
 * Defines arguments required for the deploy method.
 */
type PlonkVerifierDeployParams = Expand$8<Omit<AppFactoryDeployParams, 'createParams' | 'updateParams' | 'deleteParams'> & {
    /**
     * Create transaction parameters to use if a create needs to be issued as part of deployment; use `method` to define ABI call (if available) or leave out for a bare call (if available)
     */
    createParams?: PlonkVerifierCreateCallParams;
}>;
/**
 * A factory to create and deploy one or more instance of the PlonkVerifier smart contract and to create one or more app clients to interact with those (or other) app instances
 */
declare class PlonkVerifierFactory {
    /**
     * The underlying `AppFactory` for when you want to have more flexibility
     */
    readonly appFactory: AppFactory;
    /**
     * Creates a new instance of `PlonkVerifierFactory`
     *
     * @param params The parameters to initialise the app factory with
     */
    constructor(params: Omit<AppFactoryParams, 'appSpec'>);
    /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app factory is using. */
    get algorand(): AlgorandClient;
    /**
     * Returns a new `AppClient` client for an app instance of the given ID.
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientById(params: AppFactoryAppClientParams): PlonkVerifierClient;
    /**
     * Returns a new `AppClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientByCreatorAndName(params: AppFactoryResolveAppClientByCreatorAndNameParams): Promise<PlonkVerifierClient>;
    /**
     * Idempotently deploys the PlonkVerifier smart contract.
     *
     * @param params The arguments for the contract calls and any additional parameters for the call
     * @returns The deployment result
     */
    deploy(params?: PlonkVerifierDeployParams): Promise<{
        result: {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "create";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "update";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "replace";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
            deleteResult: _algorandfoundation_algokit_utils_types_transaction.ConfirmedTransactionResult;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "nothing";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
        };
        appClient: PlonkVerifierClient;
    }>;
    /**
     * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the PlonkVerifier smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The params for a create call
             */
            bare: (params?: Expand$8<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                approvalProgram: Uint8Array;
                clearStateProgram: Uint8Array;
                compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                deployTimeParams: _algorandfoundation_algokit_utils_types_app.TealTemplateParams | undefined;
                schema: {
                    globalInts: number;
                    globalByteSlices: number;
                    localInts: number;
                    localByteSlices: number;
                };
                maxFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                note?: string | Uint8Array | undefined;
                args?: Uint8Array[] | undefined;
                signer?: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                rejectVersion?: number | undefined;
                lease?: string | Uint8Array | undefined;
                rekeyTo?: string | Address | undefined;
                staticFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                extraFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                validityWindow?: number | bigint | undefined;
                firstValidRound?: bigint | undefined;
                lastValidRound?: bigint | undefined;
                accountReferences?: (string | Address)[] | undefined;
                appReferences?: bigint[] | undefined;
                assetReferences?: bigint[] | undefined;
                boxReferences?: (_algorandfoundation_algokit_utils_types_app_manager.BoxIdentifier | _algorandfoundation_algokit_utils_types_app_manager.BoxReference)[] | undefined;
                accessReferences?: _algorandfoundation_algokit_utils_types_app_manager.ResourceReference[] | undefined;
                sender?: string | Address | undefined;
                updatable?: boolean | undefined;
                deletable?: boolean | undefined;
                onComplete?: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC | undefined;
                extraProgramPages?: number | undefined;
            } & {
                sender: Address;
                signer: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                onComplete: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC;
            }>;
        };
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the PlonkVerifier smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The transaction for a create call
             */
            bare: (params?: Expand$8<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<Transaction>;
        };
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the PlonkVerifier smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The create result
             */
            bare: (params?: Expand$8<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & SendParams & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                result: {
                    compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    return: undefined;
                    groupId: string;
                    txIds: string[];
                    returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
                    confirmations: modelsv2.PendingTransactionResponse[];
                    transactions: Transaction[];
                    confirmation: modelsv2.PendingTransactionResponse;
                    transaction: Transaction;
                    appId: bigint;
                    appAddress: Address;
                };
                appClient: PlonkVerifierClient;
            }>;
        };
    };
}
/**
 * A client to make calls to the PlonkVerifier smart contract
 */
declare class PlonkVerifierClient {
    /**
     * The underlying `AppClient` for when you want to have more flexibility
     */
    readonly appClient: AppClient;
    /**
     * Creates a new instance of `PlonkVerifierClient`
     *
     * @param appClient An `AppClient` instance which has been created with the PlonkVerifier app spec
     */
    constructor(appClient: AppClient);
    /**
     * Creates a new instance of `PlonkVerifierClient`
     *
     * @param params The parameters to initialise the app client with
     */
    constructor(params: Omit<AppClientParams, 'appSpec'>);
    /**
     * Returns a new `PlonkVerifierClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     * @param params The parameters to create the app client
     */
    static fromCreatorAndName(params: Omit<ResolveAppClientByCreatorAndName, 'appSpec'>): Promise<PlonkVerifierClient>;
    /**
     * Returns an `PlonkVerifierClient` instance for the current network based on
     * pre-determined network-specific app IDs specified in the ARC-56 app spec.
     *
     * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
     * @param params The parameters to create the app client
     */
    static fromNetwork(params: Omit<ResolveAppClientByNetwork, 'appSpec'>): Promise<PlonkVerifierClient>;
    /** The ID of the app instance this client is linked to. */
    get appId(): bigint;
    /** The app address of the app instance this client is linked to. */
    get appAddress(): Address;
    /** The name of the app. */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app client is using. */
    get algorand(): AlgorandClient;
    /**
     * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the PlonkVerifier smart contract using the `_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut params
             */
            _dummy: (params: CallParams$8<PlonkVerifierArgs["obj"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"] | PlonkVerifierArgs["tuple"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"]>) => Promise<AppCallMethodCall>;
        };
        /**
         * Makes a clear_state call to an existing instance of the PlonkVerifier smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$8<AppClientBareCallParams>) => _algorandfoundation_algokit_utils_types_composer.AppCallParams;
        /**
         * Makes a call to the PlonkVerifier smart contract using the `verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        verify: (params: CallParams$8<PlonkVerifierArgs["obj"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"] | PlonkVerifierArgs["tuple"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<AppCallMethodCall>;
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the PlonkVerifier smart contract using the `_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut transaction
             */
            _dummy: (params: CallParams$8<PlonkVerifierArgs["obj"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"] | PlonkVerifierArgs["tuple"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"]>) => Promise<{
                transactions: Transaction[];
                methodCalls: Map<number, algosdk.ABIMethod>;
                signers: Map<number, TransactionSigner>;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the PlonkVerifier smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$8<AppClientBareCallParams>) => Promise<Transaction>;
        /**
         * Makes a call to the PlonkVerifier smart contract using the `verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        verify: (params: CallParams$8<PlonkVerifierArgs["obj"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"] | PlonkVerifierArgs["tuple"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            transactions: Transaction[];
            methodCalls: Map<number, algosdk.ABIMethod>;
            signers: Map<number, TransactionSigner>;
        }>;
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the PlonkVerifier smart contract using the `_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut result
             */
            _dummy: (params: CallParams$8<PlonkVerifierArgs["obj"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"] | PlonkVerifierArgs["tuple"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"]> & SendParams) => Promise<{
                return: (undefined | PlonkVerifierReturns["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"]);
                groupId: string;
                txIds: string[];
                returns?: ABIReturn[] | undefined | undefined;
                confirmations: modelsv2.PendingTransactionResponse[];
                transactions: Transaction[];
                confirmation: modelsv2.PendingTransactionResponse;
                transaction: Transaction;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the PlonkVerifier smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$8<AppClientBareCallParams & SendParams>) => Promise<{
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            return?: ABIReturn | undefined;
        }>;
        /**
         * Makes a call to the PlonkVerifier smart contract using the `verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        verify: (params: CallParams$8<PlonkVerifierArgs["obj"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"] | PlonkVerifierArgs["tuple"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]> & SendParams & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            return: (undefined | PlonkVerifierReturns["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]);
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        }>;
    };
    /**
     * Clone this app client with different params
     *
     * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
     * @returns A new app client with the altered params
     */
    clone(params: CloneAppClientParams): PlonkVerifierClient;
    /**
     * Methods to access state for the current PlonkVerifier app
     */
    state: {};
    newGroup(): PlonkVerifierComposer;
}
type PlonkVerifierComposer<TReturns extends [...any[]] = []> = {
    /**
     * Calls the verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void ABI method.
     *
     * @param args The arguments for the contract call
     * @param params Any additional parameters for the call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    verify(params?: CallParams$8<PlonkVerifierArgs['obj']['verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void'] | PlonkVerifierArgs['tuple']['verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void']>): PlonkVerifierComposer<[...TReturns, PlonkVerifierReturns['verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void'] | undefined]>;
    /**
     * Gets available closeOut methods
     */
    readonly closeOut: {
        /**
         * Makes a close out call to an existing instance of the PlonkVerifier smart contract using the _dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void ABI method.
         *
         * @param args The arguments for the smart contract call
         * @param params Any additional parameters for the call
         * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
         */
        _dummy(params?: CallParams$8<PlonkVerifierArgs['obj']['_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void'] | PlonkVerifierArgs['tuple']['_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void']>): PlonkVerifierComposer<[...TReturns, PlonkVerifierReturns['_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void'] | undefined]>;
    };
    /**
     * Makes a clear_state call to an existing instance of the PlonkVerifier smart contract.
     *
     * @param args The arguments for the bare call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    clearState(params?: AppClientBareCallParams): PlonkVerifierComposer<[...TReturns, undefined]>;
    /**
     * Adds a transaction to the composer
     *
     * @param txn A transaction to add to the transaction group
     * @param signer The optional signer to use when signing this transaction.
     */
    addTransaction(txn: Transaction, signer?: TransactionSigner): PlonkVerifierComposer<TReturns>;
    /**
     * Returns the underlying AtomicTransactionComposer instance
     */
    composer(): Promise<TransactionComposer>;
    /**
     * Simulates the transaction group and returns the result
     */
    simulate(): Promise<PlonkVerifierComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: SkipSignaturesSimulateOptions): Promise<PlonkVerifierComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: RawSimulateOptions): Promise<PlonkVerifierComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    /**
     * Sends the transaction group to the network and returns the results
     */
    send(params?: SendParams): Promise<PlonkVerifierComposerResults<TReturns>>;
};
type PlonkVerifierComposerResults<TReturns extends [...any[]]> = Expand$8<SendAtomicTransactionComposerResults & {
    returns: TReturns;
}>;

/**
 * Expands types for IntelliSense so they are more human readable
 * See https://stackoverflow.com/a/69288824
 */
type Expand$7<T> = T extends (...args: infer A) => infer R ? (...args: Expand$7<A>) => Expand$7<R> : T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type PlonkProof$1 = {
    a: Uint8Array;
    b: Uint8Array;
    c: Uint8Array;
    z: Uint8Array;
    t1: Uint8Array;
    t2: Uint8Array;
    t3: Uint8Array;
    wxi: Uint8Array;
    wxiw: Uint8Array;
    evalA: bigint;
    evalB: bigint;
    evalC: bigint;
    evalS1: bigint;
    evalS2: bigint;
    evalZw: bigint;
};
type PlonkVerificationKey = {
    qm: Uint8Array;
    ql: Uint8Array;
    qr: Uint8Array;
    qo: Uint8Array;
    qc: Uint8Array;
    s1: Uint8Array;
    s2: Uint8Array;
    s3: Uint8Array;
    power: bigint;
    nPublic: bigint;
    k1: bigint;
    k2: bigint;
    x_2: Uint8Array;
};
/**
 * The argument types for the PlonkVerifierWithLogs contract
 */
type PlonkVerifierWithLogsArgs = {
    /**
     * The object representation of the arguments for each method
     */
    obj: {
        '_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void': {
            _vk: PlonkVerificationKey;
        };
        'verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void': {
            signals: bigint[] | number[];
            proof: PlonkProof$1;
        };
    };
    /**
     * The tuple representation of the arguments for each method
     */
    tuple: {
        '_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void': [_vk: PlonkVerificationKey];
        'verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void': [signals: bigint[] | number[], proof: PlonkProof$1];
    };
};
/**
 * The return type for each method
 */
type PlonkVerifierWithLogsReturns = {
    '_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void': void;
    'verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void': void;
};
/**
 * Defines an object containing all relevant parameters for a single call to the contract.
 */
type CallParams$7<TArgs> = Expand$7<Omit<AppClientMethodCallParams, 'method' | 'args' | 'onComplete'> & {
    /** The args for the ABI method call, either as an ordered array or an object */
    args: Expand$7<TArgs>;
}>;
/**
 * Defines supported create method params for this smart contract
 */
type PlonkVerifierWithLogsCreateCallParams = Expand$7<AppClientBareCallParams & {
    method?: never;
} & {
    onComplete?: OnApplicationComplete.NoOpOC;
} & CreateSchema>;
/**
 * Defines arguments required for the deploy method.
 */
type PlonkVerifierWithLogsDeployParams = Expand$7<Omit<AppFactoryDeployParams, 'createParams' | 'updateParams' | 'deleteParams'> & {
    /**
     * Create transaction parameters to use if a create needs to be issued as part of deployment; use `method` to define ABI call (if available) or leave out for a bare call (if available)
     */
    createParams?: PlonkVerifierWithLogsCreateCallParams;
}>;
/**
 * A factory to create and deploy one or more instance of the PlonkVerifierWithLogs smart contract and to create one or more app clients to interact with those (or other) app instances
 */
declare class PlonkVerifierWithLogsFactory {
    /**
     * The underlying `AppFactory` for when you want to have more flexibility
     */
    readonly appFactory: AppFactory;
    /**
     * Creates a new instance of `PlonkVerifierWithLogsFactory`
     *
     * @param params The parameters to initialise the app factory with
     */
    constructor(params: Omit<AppFactoryParams, 'appSpec'>);
    /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app factory is using. */
    get algorand(): AlgorandClient;
    /**
     * Returns a new `AppClient` client for an app instance of the given ID.
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientById(params: AppFactoryAppClientParams): PlonkVerifierWithLogsClient;
    /**
     * Returns a new `AppClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientByCreatorAndName(params: AppFactoryResolveAppClientByCreatorAndNameParams): Promise<PlonkVerifierWithLogsClient>;
    /**
     * Idempotently deploys the PlonkVerifierWithLogs smart contract.
     *
     * @param params The arguments for the contract calls and any additional parameters for the call
     * @returns The deployment result
     */
    deploy(params?: PlonkVerifierWithLogsDeployParams): Promise<{
        result: {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "create";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "update";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "replace";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
            deleteResult: _algorandfoundation_algokit_utils_types_transaction.ConfirmedTransactionResult;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "nothing";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
        };
        appClient: PlonkVerifierWithLogsClient;
    }>;
    /**
     * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the PlonkVerifierWithLogs smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The params for a create call
             */
            bare: (params?: Expand$7<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                approvalProgram: Uint8Array;
                clearStateProgram: Uint8Array;
                compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                deployTimeParams: _algorandfoundation_algokit_utils_types_app.TealTemplateParams | undefined;
                schema: {
                    globalInts: number;
                    globalByteSlices: number;
                    localInts: number;
                    localByteSlices: number;
                };
                maxFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                note?: string | Uint8Array | undefined;
                args?: Uint8Array[] | undefined;
                signer?: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                rejectVersion?: number | undefined;
                lease?: string | Uint8Array | undefined;
                rekeyTo?: string | Address | undefined;
                staticFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                extraFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                validityWindow?: number | bigint | undefined;
                firstValidRound?: bigint | undefined;
                lastValidRound?: bigint | undefined;
                accountReferences?: (string | Address)[] | undefined;
                appReferences?: bigint[] | undefined;
                assetReferences?: bigint[] | undefined;
                boxReferences?: (_algorandfoundation_algokit_utils_types_app_manager.BoxIdentifier | _algorandfoundation_algokit_utils_types_app_manager.BoxReference)[] | undefined;
                accessReferences?: _algorandfoundation_algokit_utils_types_app_manager.ResourceReference[] | undefined;
                sender?: string | Address | undefined;
                updatable?: boolean | undefined;
                deletable?: boolean | undefined;
                onComplete?: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC | undefined;
                extraProgramPages?: number | undefined;
            } & {
                sender: Address;
                signer: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                onComplete: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC;
            }>;
        };
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the PlonkVerifierWithLogs smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The transaction for a create call
             */
            bare: (params?: Expand$7<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<Transaction>;
        };
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the PlonkVerifierWithLogs smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The create result
             */
            bare: (params?: Expand$7<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & SendParams & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                result: {
                    compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    return: undefined;
                    groupId: string;
                    txIds: string[];
                    returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
                    confirmations: modelsv2.PendingTransactionResponse[];
                    transactions: Transaction[];
                    confirmation: modelsv2.PendingTransactionResponse;
                    transaction: Transaction;
                    appId: bigint;
                    appAddress: Address;
                };
                appClient: PlonkVerifierWithLogsClient;
            }>;
        };
    };
}
/**
 * A client to make calls to the PlonkVerifierWithLogs smart contract
 */
declare class PlonkVerifierWithLogsClient {
    /**
     * The underlying `AppClient` for when you want to have more flexibility
     */
    readonly appClient: AppClient;
    /**
     * Creates a new instance of `PlonkVerifierWithLogsClient`
     *
     * @param appClient An `AppClient` instance which has been created with the PlonkVerifierWithLogs app spec
     */
    constructor(appClient: AppClient);
    /**
     * Creates a new instance of `PlonkVerifierWithLogsClient`
     *
     * @param params The parameters to initialise the app client with
     */
    constructor(params: Omit<AppClientParams, 'appSpec'>);
    /**
     * Returns a new `PlonkVerifierWithLogsClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     * @param params The parameters to create the app client
     */
    static fromCreatorAndName(params: Omit<ResolveAppClientByCreatorAndName, 'appSpec'>): Promise<PlonkVerifierWithLogsClient>;
    /**
     * Returns an `PlonkVerifierWithLogsClient` instance for the current network based on
     * pre-determined network-specific app IDs specified in the ARC-56 app spec.
     *
     * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
     * @param params The parameters to create the app client
     */
    static fromNetwork(params: Omit<ResolveAppClientByNetwork, 'appSpec'>): Promise<PlonkVerifierWithLogsClient>;
    /** The ID of the app instance this client is linked to. */
    get appId(): bigint;
    /** The app address of the app instance this client is linked to. */
    get appAddress(): Address;
    /** The name of the app. */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app client is using. */
    get algorand(): AlgorandClient;
    /**
     * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the PlonkVerifierWithLogs smart contract using the `_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut params
             */
            _dummy: (params: CallParams$7<PlonkVerifierWithLogsArgs["obj"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"] | PlonkVerifierWithLogsArgs["tuple"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"]>) => Promise<AppCallMethodCall>;
        };
        /**
         * Makes a clear_state call to an existing instance of the PlonkVerifierWithLogs smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$7<AppClientBareCallParams>) => _algorandfoundation_algokit_utils_types_composer.AppCallParams;
        /**
         * Makes a call to the PlonkVerifierWithLogs smart contract using the `verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        verify: (params: CallParams$7<PlonkVerifierWithLogsArgs["obj"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"] | PlonkVerifierWithLogsArgs["tuple"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<AppCallMethodCall>;
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the PlonkVerifierWithLogs smart contract using the `_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut transaction
             */
            _dummy: (params: CallParams$7<PlonkVerifierWithLogsArgs["obj"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"] | PlonkVerifierWithLogsArgs["tuple"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"]>) => Promise<{
                transactions: Transaction[];
                methodCalls: Map<number, algosdk.ABIMethod>;
                signers: Map<number, TransactionSigner>;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the PlonkVerifierWithLogs smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$7<AppClientBareCallParams>) => Promise<Transaction>;
        /**
         * Makes a call to the PlonkVerifierWithLogs smart contract using the `verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        verify: (params: CallParams$7<PlonkVerifierWithLogsArgs["obj"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"] | PlonkVerifierWithLogsArgs["tuple"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            transactions: Transaction[];
            methodCalls: Map<number, algosdk.ABIMethod>;
            signers: Map<number, TransactionSigner>;
        }>;
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the PlonkVerifierWithLogs smart contract using the `_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut result
             */
            _dummy: (params: CallParams$7<PlonkVerifierWithLogsArgs["obj"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"] | PlonkVerifierWithLogsArgs["tuple"]["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"]> & SendParams) => Promise<{
                return: (undefined | PlonkVerifierWithLogsReturns["_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void"]);
                groupId: string;
                txIds: string[];
                returns?: ABIReturn[] | undefined | undefined;
                confirmations: modelsv2.PendingTransactionResponse[];
                transactions: Transaction[];
                confirmation: modelsv2.PendingTransactionResponse;
                transaction: Transaction;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the PlonkVerifierWithLogs smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$7<AppClientBareCallParams & SendParams>) => Promise<{
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            return?: ABIReturn | undefined;
        }>;
        /**
         * Makes a call to the PlonkVerifierWithLogs smart contract using the `verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        verify: (params: CallParams$7<PlonkVerifierWithLogsArgs["obj"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"] | PlonkVerifierWithLogsArgs["tuple"]["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]> & SendParams & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            return: (undefined | PlonkVerifierWithLogsReturns["verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]);
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        }>;
    };
    /**
     * Clone this app client with different params
     *
     * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
     * @returns A new app client with the altered params
     */
    clone(params: CloneAppClientParams): PlonkVerifierWithLogsClient;
    /**
     * Methods to access state for the current PlonkVerifierWithLogs app
     */
    state: {};
    newGroup(): PlonkVerifierWithLogsComposer;
}
type PlonkVerifierWithLogsComposer<TReturns extends [...any[]] = []> = {
    /**
     * Calls the verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void ABI method.
     *
     * @param args The arguments for the contract call
     * @param params Any additional parameters for the call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    verify(params?: CallParams$7<PlonkVerifierWithLogsArgs['obj']['verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void'] | PlonkVerifierWithLogsArgs['tuple']['verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void']>): PlonkVerifierWithLogsComposer<[...TReturns, PlonkVerifierWithLogsReturns['verify(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void'] | undefined]>;
    /**
     * Gets available closeOut methods
     */
    readonly closeOut: {
        /**
         * Makes a close out call to an existing instance of the PlonkVerifierWithLogs smart contract using the _dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void ABI method.
         *
         * @param args The arguments for the smart contract call
         * @param params Any additional parameters for the call
         * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
         */
        _dummy(params?: CallParams$7<PlonkVerifierWithLogsArgs['obj']['_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void'] | PlonkVerifierWithLogsArgs['tuple']['_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void']>): PlonkVerifierWithLogsComposer<[...TReturns, PlonkVerifierWithLogsReturns['_dummy((byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint64,uint64,uint64,uint64,byte[192]))void'] | undefined]>;
    };
    /**
     * Makes a clear_state call to an existing instance of the PlonkVerifierWithLogs smart contract.
     *
     * @param args The arguments for the bare call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    clearState(params?: AppClientBareCallParams): PlonkVerifierWithLogsComposer<[...TReturns, undefined]>;
    /**
     * Adds a transaction to the composer
     *
     * @param txn A transaction to add to the transaction group
     * @param signer The optional signer to use when signing this transaction.
     */
    addTransaction(txn: Transaction, signer?: TransactionSigner): PlonkVerifierWithLogsComposer<TReturns>;
    /**
     * Returns the underlying AtomicTransactionComposer instance
     */
    composer(): Promise<TransactionComposer>;
    /**
     * Simulates the transaction group and returns the result
     */
    simulate(): Promise<PlonkVerifierWithLogsComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: SkipSignaturesSimulateOptions): Promise<PlonkVerifierWithLogsComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: RawSimulateOptions): Promise<PlonkVerifierWithLogsComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    /**
     * Sends the transaction group to the network and returns the results
     */
    send(params?: SendParams): Promise<PlonkVerifierWithLogsComposerResults<TReturns>>;
};
type PlonkVerifierWithLogsComposerResults<TReturns extends [...any[]]> = Expand$7<SendAtomicTransactionComposerResults & {
    returns: TReturns;
}>;

/**
 * Expands types for IntelliSense so they are more human readable
 * See https://stackoverflow.com/a/69288824
 */
type Expand$6<T> = T extends (...args: infer A) => infer R ? (...args: Expand$6<A>) => Expand$6<R> : T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type Groth16Bls12381Proof$2 = {
    piA: Uint8Array;
    piB: Uint8Array;
    piC: Uint8Array;
};
type Groth16Bls12381VerificationKey$1 = {
    vkAlpha_1: Uint8Array;
    vkBeta_2: Uint8Array;
    vkGamma_2: Uint8Array;
    vkDelta_2: Uint8Array;
    nPublic: bigint;
    ic: Uint8Array[];
};
/**
 * The argument types for the Groth16Bls12381Verifier contract
 */
type Groth16Bls12381VerifierArgs = {
    /**
     * The object representation of the arguments for each method
     */
    obj: {
        '_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void': {
            _vk: Groth16Bls12381VerificationKey$1;
        };
        'verify(uint256[],(byte[96],byte[192],byte[96]))void': {
            signals: bigint[] | number[];
            proof: Groth16Bls12381Proof$2;
        };
    };
    /**
     * The tuple representation of the arguments for each method
     */
    tuple: {
        '_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void': [_vk: Groth16Bls12381VerificationKey$1];
        'verify(uint256[],(byte[96],byte[192],byte[96]))void': [signals: bigint[] | number[], proof: Groth16Bls12381Proof$2];
    };
};
/**
 * The return type for each method
 */
type Groth16Bls12381VerifierReturns = {
    '_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void': void;
    'verify(uint256[],(byte[96],byte[192],byte[96]))void': void;
};
/**
 * Defines an object containing all relevant parameters for a single call to the contract.
 */
type CallParams$6<TArgs> = Expand$6<Omit<AppClientMethodCallParams, 'method' | 'args' | 'onComplete'> & {
    /** The args for the ABI method call, either as an ordered array or an object */
    args: Expand$6<TArgs>;
}>;
/**
 * Defines supported create method params for this smart contract
 */
type Groth16Bls12381VerifierCreateCallParams = Expand$6<AppClientBareCallParams & {
    method?: never;
} & {
    onComplete?: OnApplicationComplete.NoOpOC;
} & CreateSchema>;
/**
 * Defines arguments required for the deploy method.
 */
type Groth16Bls12381VerifierDeployParams = Expand$6<Omit<AppFactoryDeployParams, 'createParams' | 'updateParams' | 'deleteParams'> & {
    /**
     * Create transaction parameters to use if a create needs to be issued as part of deployment; use `method` to define ABI call (if available) or leave out for a bare call (if available)
     */
    createParams?: Groth16Bls12381VerifierCreateCallParams;
}>;
/**
 * A factory to create and deploy one or more instance of the Groth16Bls12381Verifier smart contract and to create one or more app clients to interact with those (or other) app instances
 */
declare class Groth16Bls12381VerifierFactory {
    /**
     * The underlying `AppFactory` for when you want to have more flexibility
     */
    readonly appFactory: AppFactory;
    /**
     * Creates a new instance of `Groth16Bls12381VerifierFactory`
     *
     * @param params The parameters to initialise the app factory with
     */
    constructor(params: Omit<AppFactoryParams, 'appSpec'>);
    /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app factory is using. */
    get algorand(): AlgorandClient;
    /**
     * Returns a new `AppClient` client for an app instance of the given ID.
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientById(params: AppFactoryAppClientParams): Groth16Bls12381VerifierClient;
    /**
     * Returns a new `AppClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientByCreatorAndName(params: AppFactoryResolveAppClientByCreatorAndNameParams): Promise<Groth16Bls12381VerifierClient>;
    /**
     * Idempotently deploys the Groth16Bls12381Verifier smart contract.
     *
     * @param params The arguments for the contract calls and any additional parameters for the call
     * @returns The deployment result
     */
    deploy(params?: Groth16Bls12381VerifierDeployParams): Promise<{
        result: {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "create";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "update";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "replace";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
            deleteResult: _algorandfoundation_algokit_utils_types_transaction.ConfirmedTransactionResult;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "nothing";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
        };
        appClient: Groth16Bls12381VerifierClient;
    }>;
    /**
     * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bls12381Verifier smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The params for a create call
             */
            bare: (params?: Expand$6<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                approvalProgram: Uint8Array;
                clearStateProgram: Uint8Array;
                compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                deployTimeParams: _algorandfoundation_algokit_utils_types_app.TealTemplateParams | undefined;
                schema: {
                    globalInts: number;
                    globalByteSlices: number;
                    localInts: number;
                    localByteSlices: number;
                };
                maxFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                note?: string | Uint8Array | undefined;
                args?: Uint8Array[] | undefined;
                signer?: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                rejectVersion?: number | undefined;
                lease?: string | Uint8Array | undefined;
                rekeyTo?: string | Address | undefined;
                staticFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                extraFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                validityWindow?: number | bigint | undefined;
                firstValidRound?: bigint | undefined;
                lastValidRound?: bigint | undefined;
                accountReferences?: (string | Address)[] | undefined;
                appReferences?: bigint[] | undefined;
                assetReferences?: bigint[] | undefined;
                boxReferences?: (_algorandfoundation_algokit_utils_types_app_manager.BoxIdentifier | _algorandfoundation_algokit_utils_types_app_manager.BoxReference)[] | undefined;
                accessReferences?: _algorandfoundation_algokit_utils_types_app_manager.ResourceReference[] | undefined;
                sender?: string | Address | undefined;
                updatable?: boolean | undefined;
                deletable?: boolean | undefined;
                onComplete?: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC | undefined;
                extraProgramPages?: number | undefined;
            } & {
                sender: Address;
                signer: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                onComplete: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC;
            }>;
        };
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bls12381Verifier smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The transaction for a create call
             */
            bare: (params?: Expand$6<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<Transaction>;
        };
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bls12381Verifier smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The create result
             */
            bare: (params?: Expand$6<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & SendParams & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                result: {
                    compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    return: undefined;
                    groupId: string;
                    txIds: string[];
                    returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
                    confirmations: modelsv2.PendingTransactionResponse[];
                    transactions: Transaction[];
                    confirmation: modelsv2.PendingTransactionResponse;
                    transaction: Transaction;
                    appId: bigint;
                    appAddress: Address;
                };
                appClient: Groth16Bls12381VerifierClient;
            }>;
        };
    };
}
/**
 * A client to make calls to the Groth16Bls12381Verifier smart contract
 */
declare class Groth16Bls12381VerifierClient {
    /**
     * The underlying `AppClient` for when you want to have more flexibility
     */
    readonly appClient: AppClient;
    /**
     * Creates a new instance of `Groth16Bls12381VerifierClient`
     *
     * @param appClient An `AppClient` instance which has been created with the Groth16Bls12381Verifier app spec
     */
    constructor(appClient: AppClient);
    /**
     * Creates a new instance of `Groth16Bls12381VerifierClient`
     *
     * @param params The parameters to initialise the app client with
     */
    constructor(params: Omit<AppClientParams, 'appSpec'>);
    /**
     * Returns a new `Groth16Bls12381VerifierClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     * @param params The parameters to create the app client
     */
    static fromCreatorAndName(params: Omit<ResolveAppClientByCreatorAndName, 'appSpec'>): Promise<Groth16Bls12381VerifierClient>;
    /**
     * Returns an `Groth16Bls12381VerifierClient` instance for the current network based on
     * pre-determined network-specific app IDs specified in the ARC-56 app spec.
     *
     * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
     * @param params The parameters to create the app client
     */
    static fromNetwork(params: Omit<ResolveAppClientByNetwork, 'appSpec'>): Promise<Groth16Bls12381VerifierClient>;
    /** The ID of the app instance this client is linked to. */
    get appId(): bigint;
    /** The app address of the app instance this client is linked to. */
    get appAddress(): Address;
    /** The name of the app. */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app client is using. */
    get algorand(): AlgorandClient;
    /**
     * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bls12381Verifier smart contract using the `_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut params
             */
            _dummy: (params: CallParams$6<Groth16Bls12381VerifierArgs["obj"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"] | Groth16Bls12381VerifierArgs["tuple"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"]>) => Promise<AppCallMethodCall>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bls12381Verifier smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$6<AppClientBareCallParams>) => _algorandfoundation_algokit_utils_types_composer.AppCallParams;
        /**
         * Makes a call to the Groth16Bls12381Verifier smart contract using the `verify(uint256[],(byte[96],byte[192],byte[96]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        verify: (params: CallParams$6<Groth16Bls12381VerifierArgs["obj"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"] | Groth16Bls12381VerifierArgs["tuple"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<AppCallMethodCall>;
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bls12381Verifier smart contract using the `_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut transaction
             */
            _dummy: (params: CallParams$6<Groth16Bls12381VerifierArgs["obj"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"] | Groth16Bls12381VerifierArgs["tuple"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"]>) => Promise<{
                transactions: Transaction[];
                methodCalls: Map<number, algosdk.ABIMethod>;
                signers: Map<number, TransactionSigner>;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bls12381Verifier smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$6<AppClientBareCallParams>) => Promise<Transaction>;
        /**
         * Makes a call to the Groth16Bls12381Verifier smart contract using the `verify(uint256[],(byte[96],byte[192],byte[96]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        verify: (params: CallParams$6<Groth16Bls12381VerifierArgs["obj"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"] | Groth16Bls12381VerifierArgs["tuple"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            transactions: Transaction[];
            methodCalls: Map<number, algosdk.ABIMethod>;
            signers: Map<number, TransactionSigner>;
        }>;
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bls12381Verifier smart contract using the `_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut result
             */
            _dummy: (params: CallParams$6<Groth16Bls12381VerifierArgs["obj"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"] | Groth16Bls12381VerifierArgs["tuple"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"]> & SendParams) => Promise<{
                return: (undefined | Groth16Bls12381VerifierReturns["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"]);
                groupId: string;
                txIds: string[];
                returns?: ABIReturn[] | undefined | undefined;
                confirmations: modelsv2.PendingTransactionResponse[];
                transactions: Transaction[];
                confirmation: modelsv2.PendingTransactionResponse;
                transaction: Transaction;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bls12381Verifier smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$6<AppClientBareCallParams & SendParams>) => Promise<{
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            return?: ABIReturn | undefined;
        }>;
        /**
         * Makes a call to the Groth16Bls12381Verifier smart contract using the `verify(uint256[],(byte[96],byte[192],byte[96]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        verify: (params: CallParams$6<Groth16Bls12381VerifierArgs["obj"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"] | Groth16Bls12381VerifierArgs["tuple"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"]> & SendParams & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            return: (undefined | Groth16Bls12381VerifierReturns["verify(uint256[],(byte[96],byte[192],byte[96]))void"]);
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        }>;
    };
    /**
     * Clone this app client with different params
     *
     * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
     * @returns A new app client with the altered params
     */
    clone(params: CloneAppClientParams): Groth16Bls12381VerifierClient;
    /**
     * Methods to access state for the current Groth16Bls12381Verifier app
     */
    state: {};
    newGroup(): Groth16Bls12381VerifierComposer;
}
type Groth16Bls12381VerifierComposer<TReturns extends [...any[]] = []> = {
    /**
     * Calls the verify(uint256[],(byte[96],byte[192],byte[96]))void ABI method.
     *
     * @param args The arguments for the contract call
     * @param params Any additional parameters for the call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    verify(params?: CallParams$6<Groth16Bls12381VerifierArgs['obj']['verify(uint256[],(byte[96],byte[192],byte[96]))void'] | Groth16Bls12381VerifierArgs['tuple']['verify(uint256[],(byte[96],byte[192],byte[96]))void']>): Groth16Bls12381VerifierComposer<[...TReturns, Groth16Bls12381VerifierReturns['verify(uint256[],(byte[96],byte[192],byte[96]))void'] | undefined]>;
    /**
     * Gets available closeOut methods
     */
    readonly closeOut: {
        /**
         * Makes a close out call to an existing instance of the Groth16Bls12381Verifier smart contract using the _dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void ABI method.
         *
         * @param args The arguments for the smart contract call
         * @param params Any additional parameters for the call
         * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
         */
        _dummy(params?: CallParams$6<Groth16Bls12381VerifierArgs['obj']['_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void'] | Groth16Bls12381VerifierArgs['tuple']['_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void']>): Groth16Bls12381VerifierComposer<[...TReturns, Groth16Bls12381VerifierReturns['_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void'] | undefined]>;
    };
    /**
     * Makes a clear_state call to an existing instance of the Groth16Bls12381Verifier smart contract.
     *
     * @param args The arguments for the bare call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    clearState(params?: AppClientBareCallParams): Groth16Bls12381VerifierComposer<[...TReturns, undefined]>;
    /**
     * Adds a transaction to the composer
     *
     * @param txn A transaction to add to the transaction group
     * @param signer The optional signer to use when signing this transaction.
     */
    addTransaction(txn: Transaction, signer?: TransactionSigner): Groth16Bls12381VerifierComposer<TReturns>;
    /**
     * Returns the underlying AtomicTransactionComposer instance
     */
    composer(): Promise<TransactionComposer>;
    /**
     * Simulates the transaction group and returns the result
     */
    simulate(): Promise<Groth16Bls12381VerifierComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: SkipSignaturesSimulateOptions): Promise<Groth16Bls12381VerifierComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: RawSimulateOptions): Promise<Groth16Bls12381VerifierComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    /**
     * Sends the transaction group to the network and returns the results
     */
    send(params?: SendParams): Promise<Groth16Bls12381VerifierComposerResults<TReturns>>;
};
type Groth16Bls12381VerifierComposerResults<TReturns extends [...any[]]> = Expand$6<SendAtomicTransactionComposerResults & {
    returns: TReturns;
}>;

/**
 * NOTICE: This file was generated. Editing this file manually is not recommended.
 */

/**
 * Application state delta.
 */
declare class AccountStateDelta implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    address: string;
    /**
     * Application state delta.
     */
    delta: EvalDeltaKeyValue[];
    /**
     * Creates a new `AccountStateDelta` object.
     * @param address -
     * @param delta - Application state delta.
     */
    constructor({ address, delta, }: {
        address: string;
        delta: EvalDeltaKeyValue[];
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): AccountStateDelta;
}
/**
 * An application's initial global/local/box states that were accessed during
 * simulation.
 */
declare class ApplicationInitialStates implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * Application index.
     */
    id: bigint;
    /**
     * An application's global/local/box state.
     */
    appBoxes?: ApplicationKVStorage;
    /**
     * An application's global/local/box state.
     */
    appGlobals?: ApplicationKVStorage;
    /**
     * An application's initial local states tied to different accounts.
     */
    appLocals?: ApplicationKVStorage[];
    /**
     * Creates a new `ApplicationInitialStates` object.
     * @param id - Application index.
     * @param appBoxes - An application's global/local/box state.
     * @param appGlobals - An application's global/local/box state.
     * @param appLocals - An application's initial local states tied to different accounts.
     */
    constructor({ id, appBoxes, appGlobals, appLocals, }: {
        id: number | bigint;
        appBoxes?: ApplicationKVStorage;
        appGlobals?: ApplicationKVStorage;
        appLocals?: ApplicationKVStorage[];
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): ApplicationInitialStates;
}
/**
 * An application's global/local/box state.
 */
declare class ApplicationKVStorage implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * Key-Value pairs representing application states.
     */
    kvs: AvmKeyValue[];
    /**
     * The address of the account associated with the local state.
     */
    account?: Address$1;
    /**
     * Creates a new `ApplicationKVStorage` object.
     * @param kvs - Key-Value pairs representing application states.
     * @param account - The address of the account associated with the local state.
     */
    constructor({ kvs, account, }: {
        kvs: AvmKeyValue[];
        account?: Address$1 | string;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): ApplicationKVStorage;
}
/**
 * References an account's local state for an application.
 */
declare class ApplicationLocalReference implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * Address of the account with the local state.
     */
    account: Address$1;
    /**
     * Application ID of the local state application.
     */
    app: bigint;
    /**
     * Creates a new `ApplicationLocalReference` object.
     * @param account - Address of the account with the local state.
     * @param app - Application ID of the local state application.
     */
    constructor({ account, app, }: {
        account: Address$1 | string;
        app: number | bigint;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): ApplicationLocalReference;
}
/**
 * An operation against an application's global/local/box state.
 */
declare class ApplicationStateOperation implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * Type of application state. Value `g` is **global state**, `l` is **local
     * state**, `b` is **boxes**.
     */
    appStateType: string;
    /**
     * The key (name) of the global/local/box state.
     */
    key: Uint8Array;
    /**
     * Operation type. Value `w` is **write**, `d` is **delete**.
     */
    operation: string;
    /**
     * For local state changes, the address of the account associated with the local
     * state.
     */
    account?: Address$1;
    /**
     * Represents an AVM value.
     */
    newValue?: AvmValue;
    /**
     * Creates a new `ApplicationStateOperation` object.
     * @param appStateType - Type of application state. Value `g` is **global state**, `l` is **local
     * state**, `b` is **boxes**.
     * @param key - The key (name) of the global/local/box state.
     * @param operation - Operation type. Value `w` is **write**, `d` is **delete**.
     * @param account - For local state changes, the address of the account associated with the local
     * state.
     * @param newValue - Represents an AVM value.
     */
    constructor({ appStateType, key, operation, account, newValue, }: {
        appStateType: string;
        key: string | Uint8Array;
        operation: string;
        account?: Address$1 | string;
        newValue?: AvmValue;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): ApplicationStateOperation;
}
/**
 * References an asset held by an account.
 */
declare class AssetHoldingReference implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * Address of the account holding the asset.
     */
    account: Address$1;
    /**
     * Asset ID of the holding.
     */
    asset: bigint;
    /**
     * Creates a new `AssetHoldingReference` object.
     * @param account - Address of the account holding the asset.
     * @param asset - Asset ID of the holding.
     */
    constructor({ account, asset, }: {
        account: Address$1 | string;
        asset: number | bigint;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): AssetHoldingReference;
}
/**
 * Represents an AVM key-value pair in an application store.
 */
declare class AvmKeyValue implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    key: Uint8Array;
    /**
     * Represents an AVM value.
     */
    value: AvmValue;
    /**
     * Creates a new `AvmKeyValue` object.
     * @param key -
     * @param value - Represents an AVM value.
     */
    constructor({ key, value }: {
        key: string | Uint8Array;
        value: AvmValue;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): AvmKeyValue;
}
/**
 * Represents an AVM value.
 */
declare class AvmValue implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * value type. Value `1` refers to **bytes**, value `2` refers to **uint64**
     */
    type: number;
    /**
     * bytes value.
     */
    bytes?: Uint8Array;
    /**
     * uint value.
     */
    uint?: bigint;
    /**
     * Creates a new `AvmValue` object.
     * @param type - value type. Value `1` refers to **bytes**, value `2` refers to **uint64**
     * @param bytes - bytes value.
     * @param uint - uint value.
     */
    constructor({ type, bytes, uint, }: {
        type: number | bigint;
        bytes?: string | Uint8Array;
        uint?: number | bigint;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): AvmValue;
}
/**
 * References a box of an application.
 */
declare class BoxReference implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * Application ID which this box belongs to
     */
    app: bigint;
    /**
     * Base64 encoded box name
     */
    name: Uint8Array;
    /**
     * Creates a new `BoxReference` object.
     * @param app - Application ID which this box belongs to
     * @param name - Base64 encoded box name
     */
    constructor({ app, name, }: {
        app: number | bigint;
        name: string | Uint8Array;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): BoxReference;
}
/**
 * Represents a TEAL value delta.
 */
declare class EvalDelta implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * (at) delta action.
     */
    action: number;
    /**
     * (bs) bytes value.
     */
    bytes?: string;
    /**
     * (ui) uint value.
     */
    uint?: bigint;
    /**
     * Creates a new `EvalDelta` object.
     * @param action - (at) delta action.
     * @param bytes - (bs) bytes value.
     * @param uint - (ui) uint value.
     */
    constructor({ action, bytes, uint, }: {
        action: number | bigint;
        bytes?: string;
        uint?: number | bigint;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): EvalDelta;
}
/**
 * Key-value pairs for StateDelta.
 */
declare class EvalDeltaKeyValue implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    key: string;
    /**
     * Represents a TEAL value delta.
     */
    value: EvalDelta;
    /**
     * Creates a new `EvalDeltaKeyValue` object.
     * @param key -
     * @param value - Represents a TEAL value delta.
     */
    constructor({ key, value }: {
        key: string;
        value: EvalDelta;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): EvalDeltaKeyValue;
}
/**
 * Details about a pending transaction. If the transaction was recently confirmed,
 * includes confirmation details like the round and reward details.
 */
declare class PendingTransactionResponse implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * Indicates that the transaction was kicked out of this node's transaction pool
     * (and specifies why that happened). An empty string indicates the transaction
     * wasn't kicked out of this node's txpool due to an error.
     */
    poolError: string;
    /**
     * The raw signed transaction.
     */
    txn: SignedTransaction;
    /**
     * The application index if the transaction was found and it created an
     * application.
     */
    applicationIndex?: bigint;
    /**
     * The number of the asset's unit that were transferred to the close-to address.
     */
    assetClosingAmount?: bigint;
    /**
     * The asset index if the transaction was found and it created an asset.
     */
    assetIndex?: bigint;
    /**
     * Rewards in microalgos applied to the close remainder to account.
     */
    closeRewards?: bigint;
    /**
     * Closing amount for the transaction.
     */
    closingAmount?: bigint;
    /**
     * The round where this transaction was confirmed, if present.
     */
    confirmedRound?: bigint;
    /**
     * Global state key/value changes for the application being executed by this
     * transaction.
     */
    globalStateDelta?: EvalDeltaKeyValue[];
    /**
     * Inner transactions produced by application execution.
     */
    innerTxns?: PendingTransactionResponse[];
    /**
     * Local state key/value changes for the application being executed by this
     * transaction.
     */
    localStateDelta?: AccountStateDelta[];
    /**
     * Logs for the application being executed by this transaction.
     */
    logs?: Uint8Array[];
    /**
     * Rewards in microalgos applied to the receiver account.
     */
    receiverRewards?: bigint;
    /**
     * Rewards in microalgos applied to the sender account.
     */
    senderRewards?: bigint;
    /**
     * Creates a new `PendingTransactionResponse` object.
     * @param poolError - Indicates that the transaction was kicked out of this node's transaction pool
     * (and specifies why that happened). An empty string indicates the transaction
     * wasn't kicked out of this node's txpool due to an error.
     * @param txn - The raw signed transaction.
     * @param applicationIndex - The application index if the transaction was found and it created an
     * application.
     * @param assetClosingAmount - The number of the asset's unit that were transferred to the close-to address.
     * @param assetIndex - The asset index if the transaction was found and it created an asset.
     * @param closeRewards - Rewards in microalgos applied to the close remainder to account.
     * @param closingAmount - Closing amount for the transaction.
     * @param confirmedRound - The round where this transaction was confirmed, if present.
     * @param globalStateDelta - Global state key/value changes for the application being executed by this
     * transaction.
     * @param innerTxns - Inner transactions produced by application execution.
     * @param localStateDelta - Local state key/value changes for the application being executed by this
     * transaction.
     * @param logs - Logs for the application being executed by this transaction.
     * @param receiverRewards - Rewards in microalgos applied to the receiver account.
     * @param senderRewards - Rewards in microalgos applied to the sender account.
     */
    constructor({ poolError, txn, applicationIndex, assetClosingAmount, assetIndex, closeRewards, closingAmount, confirmedRound, globalStateDelta, innerTxns, localStateDelta, logs, receiverRewards, senderRewards, }: {
        poolError: string;
        txn: SignedTransaction;
        applicationIndex?: number | bigint;
        assetClosingAmount?: number | bigint;
        assetIndex?: number | bigint;
        closeRewards?: number | bigint;
        closingAmount?: number | bigint;
        confirmedRound?: number | bigint;
        globalStateDelta?: EvalDeltaKeyValue[];
        innerTxns?: PendingTransactionResponse[];
        localStateDelta?: AccountStateDelta[];
        logs?: Uint8Array[];
        receiverRewards?: number | bigint;
        senderRewards?: number | bigint;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): PendingTransactionResponse;
}
/**
 * A write operation into a scratch slot.
 */
declare class ScratchChange implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * Represents an AVM value.
     */
    newValue: AvmValue;
    /**
     * The scratch slot written.
     */
    slot: number;
    /**
     * Creates a new `ScratchChange` object.
     * @param newValue - Represents an AVM value.
     * @param slot - The scratch slot written.
     */
    constructor({ newValue, slot, }: {
        newValue: AvmValue;
        slot: number | bigint;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): ScratchChange;
}
/**
 * Initial states of resources that were accessed during simulation.
 */
declare class SimulateInitialStates implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * The initial states of accessed application before simulation. The order of this
     * array is arbitrary.
     */
    appInitialStates?: ApplicationInitialStates[];
    /**
     * Creates a new `SimulateInitialStates` object.
     * @param appInitialStates - The initial states of accessed application before simulation. The order of this
     * array is arbitrary.
     */
    constructor({ appInitialStates, }: {
        appInitialStates?: ApplicationInitialStates[];
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): SimulateInitialStates;
}
/**
 * Result of a transaction group simulation.
 */
declare class SimulateResponse implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * The round immediately preceding this simulation. State changes through this
     * round were used to run this simulation.
     */
    lastRound: bigint;
    /**
     * A result object for each transaction group that was simulated.
     */
    txnGroups: SimulateTransactionGroupResult[];
    /**
     * The version of this response object.
     */
    version: number;
    /**
     * The set of parameters and limits override during simulation. If this set of
     * parameters is present, then evaluation parameters may differ from standard
     * evaluation in certain ways.
     */
    evalOverrides?: SimulationEvalOverrides;
    /**
     * An object that configures simulation execution trace.
     */
    execTraceConfig?: SimulateTraceConfig;
    /**
     * Initial states of resources that were accessed during simulation.
     */
    initialStates?: SimulateInitialStates;
    /**
     * Creates a new `SimulateResponse` object.
     * @param lastRound - The round immediately preceding this simulation. State changes through this
     * round were used to run this simulation.
     * @param txnGroups - A result object for each transaction group that was simulated.
     * @param version - The version of this response object.
     * @param evalOverrides - The set of parameters and limits override during simulation. If this set of
     * parameters is present, then evaluation parameters may differ from standard
     * evaluation in certain ways.
     * @param execTraceConfig - An object that configures simulation execution trace.
     * @param initialStates - Initial states of resources that were accessed during simulation.
     */
    constructor({ lastRound, txnGroups, version, evalOverrides, execTraceConfig, initialStates, }: {
        lastRound: number | bigint;
        txnGroups: SimulateTransactionGroupResult[];
        version: number | bigint;
        evalOverrides?: SimulationEvalOverrides;
        execTraceConfig?: SimulateTraceConfig;
        initialStates?: SimulateInitialStates;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): SimulateResponse;
}
/**
 * An object that configures simulation execution trace.
 */
declare class SimulateTraceConfig implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * A boolean option for opting in execution trace features simulation endpoint.
     */
    enable?: boolean;
    /**
     * A boolean option enabling returning scratch slot changes together with execution
     * trace during simulation.
     */
    scratchChange?: boolean;
    /**
     * A boolean option enabling returning stack changes together with execution trace
     * during simulation.
     */
    stackChange?: boolean;
    /**
     * A boolean option enabling returning application state changes (global, local,
     * and box changes) with the execution trace during simulation.
     */
    stateChange?: boolean;
    /**
     * Creates a new `SimulateTraceConfig` object.
     * @param enable - A boolean option for opting in execution trace features simulation endpoint.
     * @param scratchChange - A boolean option enabling returning scratch slot changes together with execution
     * trace during simulation.
     * @param stackChange - A boolean option enabling returning stack changes together with execution trace
     * during simulation.
     * @param stateChange - A boolean option enabling returning application state changes (global, local,
     * and box changes) with the execution trace during simulation.
     */
    constructor({ enable, scratchChange, stackChange, stateChange, }: {
        enable?: boolean;
        scratchChange?: boolean;
        stackChange?: boolean;
        stateChange?: boolean;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): SimulateTraceConfig;
}
/**
 * Simulation result for an atomic transaction group
 */
declare class SimulateTransactionGroupResult implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * Simulation result for individual transactions
     */
    txnResults: SimulateTransactionResult[];
    /**
     * Total budget added during execution of app calls in the transaction group.
     */
    appBudgetAdded?: number;
    /**
     * Total budget consumed during execution of app calls in the transaction group.
     */
    appBudgetConsumed?: number;
    /**
     * If present, indicates which transaction in this group caused the failure. This
     * array represents the path to the failing transaction. Indexes are zero based,
     * the first element indicates the top-level transaction, and successive elements
     * indicate deeper inner transactions.
     */
    failedAt?: number[];
    /**
     * If present, indicates that the transaction group failed and specifies why that
     * happened
     */
    failureMessage?: string;
    /**
     * These are resources that were accessed by this group that would normally have
     * caused failure, but were allowed in simulation. Depending on where this object
     * is in the response, the unnamed resources it contains may or may not qualify for
     * group resource sharing. If this is a field in SimulateTransactionGroupResult,
     * the resources do qualify, but if this is a field in SimulateTransactionResult,
     * they do not qualify. In order to make this group valid for actual submission,
     * resources that qualify for group sharing can be made available by any
     * transaction of the group; otherwise, resources must be placed in the same
     * transaction which accessed them.
     */
    unnamedResourcesAccessed?: SimulateUnnamedResourcesAccessed;
    /**
     * Creates a new `SimulateTransactionGroupResult` object.
     * @param txnResults - Simulation result for individual transactions
     * @param appBudgetAdded - Total budget added during execution of app calls in the transaction group.
     * @param appBudgetConsumed - Total budget consumed during execution of app calls in the transaction group.
     * @param failedAt - If present, indicates which transaction in this group caused the failure. This
     * array represents the path to the failing transaction. Indexes are zero based,
     * the first element indicates the top-level transaction, and successive elements
     * indicate deeper inner transactions.
     * @param failureMessage - If present, indicates that the transaction group failed and specifies why that
     * happened
     * @param unnamedResourcesAccessed - These are resources that were accessed by this group that would normally have
     * caused failure, but were allowed in simulation. Depending on where this object
     * is in the response, the unnamed resources it contains may or may not qualify for
     * group resource sharing. If this is a field in SimulateTransactionGroupResult,
     * the resources do qualify, but if this is a field in SimulateTransactionResult,
     * they do not qualify. In order to make this group valid for actual submission,
     * resources that qualify for group sharing can be made available by any
     * transaction of the group; otherwise, resources must be placed in the same
     * transaction which accessed them.
     */
    constructor({ txnResults, appBudgetAdded, appBudgetConsumed, failedAt, failureMessage, unnamedResourcesAccessed, }: {
        txnResults: SimulateTransactionResult[];
        appBudgetAdded?: number | bigint;
        appBudgetConsumed?: number | bigint;
        failedAt?: (number | bigint)[];
        failureMessage?: string;
        unnamedResourcesAccessed?: SimulateUnnamedResourcesAccessed;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): SimulateTransactionGroupResult;
}
/**
 * Simulation result for an individual transaction
 */
declare class SimulateTransactionResult implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * Details about a pending transaction. If the transaction was recently confirmed,
     * includes confirmation details like the round and reward details.
     */
    txnResult: PendingTransactionResponse;
    /**
     * Budget used during execution of an app call transaction. This value includes
     * budged used by inner app calls spawned by this transaction.
     */
    appBudgetConsumed?: number;
    /**
     * The execution trace of calling an app or a logic sig, containing the inner app
     * call trace in a recursive way.
     */
    execTrace?: SimulationTransactionExecTrace;
    /**
     * The account that needed to sign this transaction when no signature was provided
     * and the provided signer was incorrect.
     */
    fixedSigner?: Address$1;
    /**
     * Budget used during execution of a logic sig transaction.
     */
    logicSigBudgetConsumed?: number;
    /**
     * These are resources that were accessed by this group that would normally have
     * caused failure, but were allowed in simulation. Depending on where this object
     * is in the response, the unnamed resources it contains may or may not qualify for
     * group resource sharing. If this is a field in SimulateTransactionGroupResult,
     * the resources do qualify, but if this is a field in SimulateTransactionResult,
     * they do not qualify. In order to make this group valid for actual submission,
     * resources that qualify for group sharing can be made available by any
     * transaction of the group; otherwise, resources must be placed in the same
     * transaction which accessed them.
     */
    unnamedResourcesAccessed?: SimulateUnnamedResourcesAccessed;
    /**
     * Creates a new `SimulateTransactionResult` object.
     * @param txnResult - Details about a pending transaction. If the transaction was recently confirmed,
     * includes confirmation details like the round and reward details.
     * @param appBudgetConsumed - Budget used during execution of an app call transaction. This value includes
     * budged used by inner app calls spawned by this transaction.
     * @param execTrace - The execution trace of calling an app or a logic sig, containing the inner app
     * call trace in a recursive way.
     * @param fixedSigner - The account that needed to sign this transaction when no signature was provided
     * and the provided signer was incorrect.
     * @param logicSigBudgetConsumed - Budget used during execution of a logic sig transaction.
     * @param unnamedResourcesAccessed - These are resources that were accessed by this group that would normally have
     * caused failure, but were allowed in simulation. Depending on where this object
     * is in the response, the unnamed resources it contains may or may not qualify for
     * group resource sharing. If this is a field in SimulateTransactionGroupResult,
     * the resources do qualify, but if this is a field in SimulateTransactionResult,
     * they do not qualify. In order to make this group valid for actual submission,
     * resources that qualify for group sharing can be made available by any
     * transaction of the group; otherwise, resources must be placed in the same
     * transaction which accessed them.
     */
    constructor({ txnResult, appBudgetConsumed, execTrace, fixedSigner, logicSigBudgetConsumed, unnamedResourcesAccessed, }: {
        txnResult: PendingTransactionResponse;
        appBudgetConsumed?: number | bigint;
        execTrace?: SimulationTransactionExecTrace;
        fixedSigner?: Address$1 | string;
        logicSigBudgetConsumed?: number | bigint;
        unnamedResourcesAccessed?: SimulateUnnamedResourcesAccessed;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): SimulateTransactionResult;
}
/**
 * These are resources that were accessed by this group that would normally have
 * caused failure, but were allowed in simulation. Depending on where this object
 * is in the response, the unnamed resources it contains may or may not qualify for
 * group resource sharing. If this is a field in SimulateTransactionGroupResult,
 * the resources do qualify, but if this is a field in SimulateTransactionResult,
 * they do not qualify. In order to make this group valid for actual submission,
 * resources that qualify for group sharing can be made available by any
 * transaction of the group; otherwise, resources must be placed in the same
 * transaction which accessed them.
 */
declare class SimulateUnnamedResourcesAccessed implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * The unnamed accounts that were referenced. The order of this array is arbitrary.
     */
    accounts?: Address$1[];
    /**
     * The unnamed application local states that were referenced. The order of this
     * array is arbitrary.
     */
    appLocals?: ApplicationLocalReference[];
    /**
     * The unnamed applications that were referenced. The order of this array is
     * arbitrary.
     */
    apps?: bigint[];
    /**
     * The unnamed asset holdings that were referenced. The order of this array is
     * arbitrary.
     */
    assetHoldings?: AssetHoldingReference[];
    /**
     * The unnamed assets that were referenced. The order of this array is arbitrary.
     */
    assets?: bigint[];
    /**
     * The unnamed boxes that were referenced. The order of this array is arbitrary.
     */
    boxes?: BoxReference[];
    /**
     * The number of extra box references used to increase the IO budget. This is in
     * addition to the references defined in the input transaction group and any
     * referenced to unnamed boxes.
     */
    extraBoxRefs?: number;
    /**
     * Creates a new `SimulateUnnamedResourcesAccessed` object.
     * @param accounts - The unnamed accounts that were referenced. The order of this array is arbitrary.
     * @param appLocals - The unnamed application local states that were referenced. The order of this
     * array is arbitrary.
     * @param apps - The unnamed applications that were referenced. The order of this array is
     * arbitrary.
     * @param assetHoldings - The unnamed asset holdings that were referenced. The order of this array is
     * arbitrary.
     * @param assets - The unnamed assets that were referenced. The order of this array is arbitrary.
     * @param boxes - The unnamed boxes that were referenced. The order of this array is arbitrary.
     * @param extraBoxRefs - The number of extra box references used to increase the IO budget. This is in
     * addition to the references defined in the input transaction group and any
     * referenced to unnamed boxes.
     */
    constructor({ accounts, appLocals, apps, assetHoldings, assets, boxes, extraBoxRefs, }: {
        accounts?: (Address$1 | string)[];
        appLocals?: ApplicationLocalReference[];
        apps?: (number | bigint)[];
        assetHoldings?: AssetHoldingReference[];
        assets?: (number | bigint)[];
        boxes?: BoxReference[];
        extraBoxRefs?: number | bigint;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): SimulateUnnamedResourcesAccessed;
}
/**
 * The set of parameters and limits override during simulation. If this set of
 * parameters is present, then evaluation parameters may differ from standard
 * evaluation in certain ways.
 */
declare class SimulationEvalOverrides implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * If true, transactions without signatures are allowed and simulated as if they
     * were properly signed.
     */
    allowEmptySignatures?: boolean;
    /**
     * If true, allows access to unnamed resources during simulation.
     */
    allowUnnamedResources?: boolean;
    /**
     * The extra opcode budget added to each transaction group during simulation
     */
    extraOpcodeBudget?: number;
    /**
     * If true, signers for transactions that are missing signatures will be fixed
     * during evaluation.
     */
    fixSigners?: boolean;
    /**
     * The maximum log calls one can make during simulation
     */
    maxLogCalls?: number;
    /**
     * The maximum byte number to log during simulation
     */
    maxLogSize?: number;
    /**
     * Creates a new `SimulationEvalOverrides` object.
     * @param allowEmptySignatures - If true, transactions without signatures are allowed and simulated as if they
     * were properly signed.
     * @param allowUnnamedResources - If true, allows access to unnamed resources during simulation.
     * @param extraOpcodeBudget - The extra opcode budget added to each transaction group during simulation
     * @param fixSigners - If true, signers for transactions that are missing signatures will be fixed
     * during evaluation.
     * @param maxLogCalls - The maximum log calls one can make during simulation
     * @param maxLogSize - The maximum byte number to log during simulation
     */
    constructor({ allowEmptySignatures, allowUnnamedResources, extraOpcodeBudget, fixSigners, maxLogCalls, maxLogSize, }: {
        allowEmptySignatures?: boolean;
        allowUnnamedResources?: boolean;
        extraOpcodeBudget?: number | bigint;
        fixSigners?: boolean;
        maxLogCalls?: number | bigint;
        maxLogSize?: number | bigint;
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): SimulationEvalOverrides;
}
/**
 * The set of trace information and effect from evaluating a single opcode.
 */
declare class SimulationOpcodeTraceUnit implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * The program counter of the current opcode being evaluated.
     */
    pc: number;
    /**
     * The writes into scratch slots.
     */
    scratchChanges?: ScratchChange[];
    /**
     * The indexes of the traces for inner transactions spawned by this opcode, if any.
     */
    spawnedInners?: number[];
    /**
     * The values added by this opcode to the stack.
     */
    stackAdditions?: AvmValue[];
    /**
     * The number of deleted stack values by this opcode.
     */
    stackPopCount?: number;
    /**
     * The operations against the current application's states.
     */
    stateChanges?: ApplicationStateOperation[];
    /**
     * Creates a new `SimulationOpcodeTraceUnit` object.
     * @param pc - The program counter of the current opcode being evaluated.
     * @param scratchChanges - The writes into scratch slots.
     * @param spawnedInners - The indexes of the traces for inner transactions spawned by this opcode, if any.
     * @param stackAdditions - The values added by this opcode to the stack.
     * @param stackPopCount - The number of deleted stack values by this opcode.
     * @param stateChanges - The operations against the current application's states.
     */
    constructor({ pc, scratchChanges, spawnedInners, stackAdditions, stackPopCount, stateChanges, }: {
        pc: number | bigint;
        scratchChanges?: ScratchChange[];
        spawnedInners?: (number | bigint)[];
        stackAdditions?: AvmValue[];
        stackPopCount?: number | bigint;
        stateChanges?: ApplicationStateOperation[];
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): SimulationOpcodeTraceUnit;
}
/**
 * The execution trace of calling an app or a logic sig, containing the inner app
 * call trace in a recursive way.
 */
declare class SimulationTransactionExecTrace implements Encodable {
    private static encodingSchemaValue;
    static get encodingSchema(): Schema;
    /**
     * SHA512_256 hash digest of the approval program executed in transaction.
     */
    approvalProgramHash?: Uint8Array;
    /**
     * Program trace that contains a trace of opcode effects in an approval program.
     */
    approvalProgramTrace?: SimulationOpcodeTraceUnit[];
    /**
     * SHA512_256 hash digest of the clear state program executed in transaction.
     */
    clearStateProgramHash?: Uint8Array;
    /**
     * Program trace that contains a trace of opcode effects in a clear state program.
     */
    clearStateProgramTrace?: SimulationOpcodeTraceUnit[];
    /**
     * If true, indicates that the clear state program failed and any persistent state
     * changes it produced should be reverted once the program exits.
     */
    clearStateRollback?: boolean;
    /**
     * The error message explaining why the clear state program failed. This field will
     * only be populated if clear-state-rollback is true and the failure was due to an
     * execution error.
     */
    clearStateRollbackError?: string;
    /**
     * An array of SimulationTransactionExecTrace representing the execution trace of
     * any inner transactions executed.
     */
    innerTrace?: SimulationTransactionExecTrace[];
    /**
     * SHA512_256 hash digest of the logic sig executed in transaction.
     */
    logicSigHash?: Uint8Array;
    /**
     * Program trace that contains a trace of opcode effects in a logic sig.
     */
    logicSigTrace?: SimulationOpcodeTraceUnit[];
    /**
     * Creates a new `SimulationTransactionExecTrace` object.
     * @param approvalProgramHash - SHA512_256 hash digest of the approval program executed in transaction.
     * @param approvalProgramTrace - Program trace that contains a trace of opcode effects in an approval program.
     * @param clearStateProgramHash - SHA512_256 hash digest of the clear state program executed in transaction.
     * @param clearStateProgramTrace - Program trace that contains a trace of opcode effects in a clear state program.
     * @param clearStateRollback - If true, indicates that the clear state program failed and any persistent state
     * changes it produced should be reverted once the program exits.
     * @param clearStateRollbackError - The error message explaining why the clear state program failed. This field will
     * only be populated if clear-state-rollback is true and the failure was due to an
     * execution error.
     * @param innerTrace - An array of SimulationTransactionExecTrace representing the execution trace of
     * any inner transactions executed.
     * @param logicSigHash - SHA512_256 hash digest of the logic sig executed in transaction.
     * @param logicSigTrace - Program trace that contains a trace of opcode effects in a logic sig.
     */
    constructor({ approvalProgramHash, approvalProgramTrace, clearStateProgramHash, clearStateProgramTrace, clearStateRollback, clearStateRollbackError, innerTrace, logicSigHash, logicSigTrace, }: {
        approvalProgramHash?: string | Uint8Array;
        approvalProgramTrace?: SimulationOpcodeTraceUnit[];
        clearStateProgramHash?: string | Uint8Array;
        clearStateProgramTrace?: SimulationOpcodeTraceUnit[];
        clearStateRollback?: boolean;
        clearStateRollbackError?: string;
        innerTrace?: SimulationTransactionExecTrace[];
        logicSigHash?: string | Uint8Array;
        logicSigTrace?: SimulationOpcodeTraceUnit[];
    });
    getEncodingSchema(): Schema;
    toEncodingData(): Map<string, unknown>;
    static fromEncodingData(data: unknown): SimulationTransactionExecTrace;
}

/**
 * Expands types for IntelliSense so they are more human readable
 * See https://stackoverflow.com/a/69288824
 */
type Expand$5<T> = T extends (...args: infer A) => infer R ? (...args: Expand$5<A>) => Expand$5<R> : T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type Groth16Bls12381Proof$1 = {
    piA: Uint8Array;
    piB: Uint8Array;
    piC: Uint8Array;
};
type Groth16Bls12381VerificationKey = {
    vkAlpha_1: Uint8Array;
    vkBeta_2: Uint8Array;
    vkGamma_2: Uint8Array;
    vkDelta_2: Uint8Array;
    nPublic: bigint;
    ic: Uint8Array[];
};
/**
 * The argument types for the Groth16Bls12381VerifierWithLogs contract
 */
type Groth16Bls12381VerifierWithLogsArgs = {
    /**
     * The object representation of the arguments for each method
     */
    obj: {
        '_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void': {
            _vk: Groth16Bls12381VerificationKey;
        };
        'verify(uint256[],(byte[96],byte[192],byte[96]))void': {
            signals: bigint[] | number[];
            proof: Groth16Bls12381Proof$1;
        };
    };
    /**
     * The tuple representation of the arguments for each method
     */
    tuple: {
        '_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void': [_vk: Groth16Bls12381VerificationKey];
        'verify(uint256[],(byte[96],byte[192],byte[96]))void': [signals: bigint[] | number[], proof: Groth16Bls12381Proof$1];
    };
};
/**
 * The return type for each method
 */
type Groth16Bls12381VerifierWithLogsReturns = {
    '_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void': void;
    'verify(uint256[],(byte[96],byte[192],byte[96]))void': void;
};
/**
 * Defines an object containing all relevant parameters for a single call to the contract.
 */
type CallParams$5<TArgs> = Expand$5<Omit<AppClientMethodCallParams, 'method' | 'args' | 'onComplete'> & {
    /** The args for the ABI method call, either as an ordered array or an object */
    args: Expand$5<TArgs>;
}>;
/**
 * Defines supported create method params for this smart contract
 */
type Groth16Bls12381VerifierWithLogsCreateCallParams = Expand$5<AppClientBareCallParams & {
    method?: never;
} & {
    onComplete?: OnApplicationComplete.NoOpOC;
} & CreateSchema>;
/**
 * Defines arguments required for the deploy method.
 */
type Groth16Bls12381VerifierWithLogsDeployParams = Expand$5<Omit<AppFactoryDeployParams, 'createParams' | 'updateParams' | 'deleteParams'> & {
    /**
     * Create transaction parameters to use if a create needs to be issued as part of deployment; use `method` to define ABI call (if available) or leave out for a bare call (if available)
     */
    createParams?: Groth16Bls12381VerifierWithLogsCreateCallParams;
}>;
/**
 * A factory to create and deploy one or more instance of the Groth16Bls12381VerifierWithLogs smart contract and to create one or more app clients to interact with those (or other) app instances
 */
declare class Groth16Bls12381VerifierWithLogsFactory {
    /**
     * The underlying `AppFactory` for when you want to have more flexibility
     */
    readonly appFactory: AppFactory;
    /**
     * Creates a new instance of `Groth16Bls12381VerifierWithLogsFactory`
     *
     * @param params The parameters to initialise the app factory with
     */
    constructor(params: Omit<AppFactoryParams, 'appSpec'>);
    /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app factory is using. */
    get algorand(): AlgorandClient;
    /**
     * Returns a new `AppClient` client for an app instance of the given ID.
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientById(params: AppFactoryAppClientParams): Groth16Bls12381VerifierWithLogsClient;
    /**
     * Returns a new `AppClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientByCreatorAndName(params: AppFactoryResolveAppClientByCreatorAndNameParams): Promise<Groth16Bls12381VerifierWithLogsClient>;
    /**
     * Idempotently deploys the Groth16Bls12381VerifierWithLogs smart contract.
     *
     * @param params The arguments for the contract calls and any additional parameters for the call
     * @returns The deployment result
     */
    deploy(params?: Groth16Bls12381VerifierWithLogsDeployParams): Promise<{
        result: {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "create";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "update";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "replace";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
            deleteResult: _algorandfoundation_algokit_utils_types_transaction.ConfirmedTransactionResult;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "nothing";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
        };
        appClient: Groth16Bls12381VerifierWithLogsClient;
    }>;
    /**
     * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bls12381VerifierWithLogs smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The params for a create call
             */
            bare: (params?: Expand$5<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                approvalProgram: Uint8Array;
                clearStateProgram: Uint8Array;
                compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                deployTimeParams: _algorandfoundation_algokit_utils_types_app.TealTemplateParams | undefined;
                schema: {
                    globalInts: number;
                    globalByteSlices: number;
                    localInts: number;
                    localByteSlices: number;
                };
                maxFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                note?: string | Uint8Array | undefined;
                args?: Uint8Array[] | undefined;
                signer?: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                rejectVersion?: number | undefined;
                lease?: string | Uint8Array | undefined;
                rekeyTo?: string | Address | undefined;
                staticFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                extraFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                validityWindow?: number | bigint | undefined;
                firstValidRound?: bigint | undefined;
                lastValidRound?: bigint | undefined;
                accountReferences?: (string | Address)[] | undefined;
                appReferences?: bigint[] | undefined;
                assetReferences?: bigint[] | undefined;
                boxReferences?: (_algorandfoundation_algokit_utils_types_app_manager.BoxIdentifier | _algorandfoundation_algokit_utils_types_app_manager.BoxReference)[] | undefined;
                accessReferences?: _algorandfoundation_algokit_utils_types_app_manager.ResourceReference[] | undefined;
                sender?: string | Address | undefined;
                updatable?: boolean | undefined;
                deletable?: boolean | undefined;
                onComplete?: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC | undefined;
                extraProgramPages?: number | undefined;
            } & {
                sender: Address;
                signer: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                onComplete: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC;
            }>;
        };
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bls12381VerifierWithLogs smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The transaction for a create call
             */
            bare: (params?: Expand$5<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<Transaction>;
        };
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bls12381VerifierWithLogs smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The create result
             */
            bare: (params?: Expand$5<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & SendParams & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                result: {
                    compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    return: undefined;
                    groupId: string;
                    txIds: string[];
                    returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
                    confirmations: modelsv2.PendingTransactionResponse[];
                    transactions: Transaction[];
                    confirmation: modelsv2.PendingTransactionResponse;
                    transaction: Transaction;
                    appId: bigint;
                    appAddress: Address;
                };
                appClient: Groth16Bls12381VerifierWithLogsClient;
            }>;
        };
    };
}
/**
 * A client to make calls to the Groth16Bls12381VerifierWithLogs smart contract
 */
declare class Groth16Bls12381VerifierWithLogsClient {
    /**
     * The underlying `AppClient` for when you want to have more flexibility
     */
    readonly appClient: AppClient;
    /**
     * Creates a new instance of `Groth16Bls12381VerifierWithLogsClient`
     *
     * @param appClient An `AppClient` instance which has been created with the Groth16Bls12381VerifierWithLogs app spec
     */
    constructor(appClient: AppClient);
    /**
     * Creates a new instance of `Groth16Bls12381VerifierWithLogsClient`
     *
     * @param params The parameters to initialise the app client with
     */
    constructor(params: Omit<AppClientParams, 'appSpec'>);
    /**
     * Returns a new `Groth16Bls12381VerifierWithLogsClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     * @param params The parameters to create the app client
     */
    static fromCreatorAndName(params: Omit<ResolveAppClientByCreatorAndName, 'appSpec'>): Promise<Groth16Bls12381VerifierWithLogsClient>;
    /**
     * Returns an `Groth16Bls12381VerifierWithLogsClient` instance for the current network based on
     * pre-determined network-specific app IDs specified in the ARC-56 app spec.
     *
     * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
     * @param params The parameters to create the app client
     */
    static fromNetwork(params: Omit<ResolveAppClientByNetwork, 'appSpec'>): Promise<Groth16Bls12381VerifierWithLogsClient>;
    /** The ID of the app instance this client is linked to. */
    get appId(): bigint;
    /** The app address of the app instance this client is linked to. */
    get appAddress(): Address;
    /** The name of the app. */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app client is using. */
    get algorand(): AlgorandClient;
    /**
     * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bls12381VerifierWithLogs smart contract using the `_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut params
             */
            _dummy: (params: CallParams$5<Groth16Bls12381VerifierWithLogsArgs["obj"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"] | Groth16Bls12381VerifierWithLogsArgs["tuple"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"]>) => Promise<AppCallMethodCall>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bls12381VerifierWithLogs smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$5<AppClientBareCallParams>) => _algorandfoundation_algokit_utils_types_composer.AppCallParams;
        /**
         * Makes a call to the Groth16Bls12381VerifierWithLogs smart contract using the `verify(uint256[],(byte[96],byte[192],byte[96]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        verify: (params: CallParams$5<Groth16Bls12381VerifierWithLogsArgs["obj"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"] | Groth16Bls12381VerifierWithLogsArgs["tuple"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<AppCallMethodCall>;
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bls12381VerifierWithLogs smart contract using the `_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut transaction
             */
            _dummy: (params: CallParams$5<Groth16Bls12381VerifierWithLogsArgs["obj"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"] | Groth16Bls12381VerifierWithLogsArgs["tuple"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"]>) => Promise<{
                transactions: Transaction[];
                methodCalls: Map<number, algosdk.ABIMethod>;
                signers: Map<number, TransactionSigner>;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bls12381VerifierWithLogs smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$5<AppClientBareCallParams>) => Promise<Transaction>;
        /**
         * Makes a call to the Groth16Bls12381VerifierWithLogs smart contract using the `verify(uint256[],(byte[96],byte[192],byte[96]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        verify: (params: CallParams$5<Groth16Bls12381VerifierWithLogsArgs["obj"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"] | Groth16Bls12381VerifierWithLogsArgs["tuple"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            transactions: Transaction[];
            methodCalls: Map<number, algosdk.ABIMethod>;
            signers: Map<number, TransactionSigner>;
        }>;
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bls12381VerifierWithLogs smart contract using the `_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut result
             */
            _dummy: (params: CallParams$5<Groth16Bls12381VerifierWithLogsArgs["obj"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"] | Groth16Bls12381VerifierWithLogsArgs["tuple"]["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"]> & SendParams) => Promise<{
                return: (undefined | Groth16Bls12381VerifierWithLogsReturns["_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void"]);
                groupId: string;
                txIds: string[];
                returns?: ABIReturn[] | undefined | undefined;
                confirmations: modelsv2.PendingTransactionResponse[];
                transactions: Transaction[];
                confirmation: modelsv2.PendingTransactionResponse;
                transaction: Transaction;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bls12381VerifierWithLogs smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$5<AppClientBareCallParams & SendParams>) => Promise<{
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            return?: ABIReturn | undefined;
        }>;
        /**
         * Makes a call to the Groth16Bls12381VerifierWithLogs smart contract using the `verify(uint256[],(byte[96],byte[192],byte[96]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        verify: (params: CallParams$5<Groth16Bls12381VerifierWithLogsArgs["obj"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"] | Groth16Bls12381VerifierWithLogsArgs["tuple"]["verify(uint256[],(byte[96],byte[192],byte[96]))void"]> & SendParams & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            return: (undefined | Groth16Bls12381VerifierWithLogsReturns["verify(uint256[],(byte[96],byte[192],byte[96]))void"]);
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        }>;
    };
    /**
     * Clone this app client with different params
     *
     * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
     * @returns A new app client with the altered params
     */
    clone(params: CloneAppClientParams): Groth16Bls12381VerifierWithLogsClient;
    /**
     * Methods to access state for the current Groth16Bls12381VerifierWithLogs app
     */
    state: {};
    newGroup(): Groth16Bls12381VerifierWithLogsComposer;
}
type Groth16Bls12381VerifierWithLogsComposer<TReturns extends [...any[]] = []> = {
    /**
     * Calls the verify(uint256[],(byte[96],byte[192],byte[96]))void ABI method.
     *
     * @param args The arguments for the contract call
     * @param params Any additional parameters for the call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    verify(params?: CallParams$5<Groth16Bls12381VerifierWithLogsArgs['obj']['verify(uint256[],(byte[96],byte[192],byte[96]))void'] | Groth16Bls12381VerifierWithLogsArgs['tuple']['verify(uint256[],(byte[96],byte[192],byte[96]))void']>): Groth16Bls12381VerifierWithLogsComposer<[...TReturns, Groth16Bls12381VerifierWithLogsReturns['verify(uint256[],(byte[96],byte[192],byte[96]))void'] | undefined]>;
    /**
     * Gets available closeOut methods
     */
    readonly closeOut: {
        /**
         * Makes a close out call to an existing instance of the Groth16Bls12381VerifierWithLogs smart contract using the _dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void ABI method.
         *
         * @param args The arguments for the smart contract call
         * @param params Any additional parameters for the call
         * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
         */
        _dummy(params?: CallParams$5<Groth16Bls12381VerifierWithLogsArgs['obj']['_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void'] | Groth16Bls12381VerifierWithLogsArgs['tuple']['_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void']>): Groth16Bls12381VerifierWithLogsComposer<[...TReturns, Groth16Bls12381VerifierWithLogsReturns['_dummy((byte[96],byte[192],byte[192],byte[192],uint64,byte[96][]))void'] | undefined]>;
    };
    /**
     * Makes a clear_state call to an existing instance of the Groth16Bls12381VerifierWithLogs smart contract.
     *
     * @param args The arguments for the bare call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    clearState(params?: AppClientBareCallParams): Groth16Bls12381VerifierWithLogsComposer<[...TReturns, undefined]>;
    /**
     * Adds a transaction to the composer
     *
     * @param txn A transaction to add to the transaction group
     * @param signer The optional signer to use when signing this transaction.
     */
    addTransaction(txn: Transaction, signer?: TransactionSigner): Groth16Bls12381VerifierWithLogsComposer<TReturns>;
    /**
     * Returns the underlying AtomicTransactionComposer instance
     */
    composer(): Promise<TransactionComposer>;
    /**
     * Simulates the transaction group and returns the result
     */
    simulate(): Promise<Groth16Bls12381VerifierWithLogsComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: SkipSignaturesSimulateOptions): Promise<Groth16Bls12381VerifierWithLogsComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: RawSimulateOptions): Promise<Groth16Bls12381VerifierWithLogsComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    /**
     * Sends the transaction group to the network and returns the results
     */
    send(params?: SendParams): Promise<Groth16Bls12381VerifierWithLogsComposerResults<TReturns>>;
};
type Groth16Bls12381VerifierWithLogsComposerResults<TReturns extends [...any[]]> = Expand$5<SendAtomicTransactionComposerResults & {
    returns: TReturns;
}>;

/**
 * Expands types for IntelliSense so they are more human readable
 * See https://stackoverflow.com/a/69288824
 */
type Expand$4<T> = T extends (...args: infer A) => infer R ? (...args: Expand$4<A>) => Expand$4<R> : T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type Groth16Bn254Proof$2 = {
    piA: Uint8Array;
    piB: Uint8Array;
    piC: Uint8Array;
};
type Groth16Bn254VerificationKey$1 = {
    vkAlpha_1: Uint8Array;
    vkBeta_2: Uint8Array;
    vkGamma_2: Uint8Array;
    vkDelta_2: Uint8Array;
    nPublic: bigint;
    ic: Uint8Array[];
};
/**
 * The argument types for the Groth16Bn254Verifier contract
 */
type Groth16Bn254VerifierArgs = {
    /**
     * The object representation of the arguments for each method
     */
    obj: {
        '_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void': {
            _vk: Groth16Bn254VerificationKey$1;
        };
        'verify(uint256[],(byte[64],byte[128],byte[64]))void': {
            signals: bigint[] | number[];
            proof: Groth16Bn254Proof$2;
        };
    };
    /**
     * The tuple representation of the arguments for each method
     */
    tuple: {
        '_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void': [_vk: Groth16Bn254VerificationKey$1];
        'verify(uint256[],(byte[64],byte[128],byte[64]))void': [signals: bigint[] | number[], proof: Groth16Bn254Proof$2];
    };
};
/**
 * The return type for each method
 */
type Groth16Bn254VerifierReturns = {
    '_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void': void;
    'verify(uint256[],(byte[64],byte[128],byte[64]))void': void;
};
/**
 * Defines an object containing all relevant parameters for a single call to the contract.
 */
type CallParams$4<TArgs> = Expand$4<Omit<AppClientMethodCallParams, 'method' | 'args' | 'onComplete'> & {
    /** The args for the ABI method call, either as an ordered array or an object */
    args: Expand$4<TArgs>;
}>;
/**
 * Defines supported create method params for this smart contract
 */
type Groth16Bn254VerifierCreateCallParams = Expand$4<AppClientBareCallParams & {
    method?: never;
} & {
    onComplete?: OnApplicationComplete.NoOpOC;
} & CreateSchema>;
/**
 * Defines arguments required for the deploy method.
 */
type Groth16Bn254VerifierDeployParams = Expand$4<Omit<AppFactoryDeployParams, 'createParams' | 'updateParams' | 'deleteParams'> & {
    /**
     * Create transaction parameters to use if a create needs to be issued as part of deployment; use `method` to define ABI call (if available) or leave out for a bare call (if available)
     */
    createParams?: Groth16Bn254VerifierCreateCallParams;
}>;
/**
 * A factory to create and deploy one or more instance of the Groth16Bn254Verifier smart contract and to create one or more app clients to interact with those (or other) app instances
 */
declare class Groth16Bn254VerifierFactory {
    /**
     * The underlying `AppFactory` for when you want to have more flexibility
     */
    readonly appFactory: AppFactory;
    /**
     * Creates a new instance of `Groth16Bn254VerifierFactory`
     *
     * @param params The parameters to initialise the app factory with
     */
    constructor(params: Omit<AppFactoryParams, 'appSpec'>);
    /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app factory is using. */
    get algorand(): AlgorandClient;
    /**
     * Returns a new `AppClient` client for an app instance of the given ID.
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientById(params: AppFactoryAppClientParams): Groth16Bn254VerifierClient;
    /**
     * Returns a new `AppClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientByCreatorAndName(params: AppFactoryResolveAppClientByCreatorAndNameParams): Promise<Groth16Bn254VerifierClient>;
    /**
     * Idempotently deploys the Groth16Bn254Verifier smart contract.
     *
     * @param params The arguments for the contract calls and any additional parameters for the call
     * @returns The deployment result
     */
    deploy(params?: Groth16Bn254VerifierDeployParams): Promise<{
        result: {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "create";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "update";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "replace";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
            deleteResult: _algorandfoundation_algokit_utils_types_transaction.ConfirmedTransactionResult;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "nothing";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
        };
        appClient: Groth16Bn254VerifierClient;
    }>;
    /**
     * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bn254Verifier smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The params for a create call
             */
            bare: (params?: Expand$4<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                approvalProgram: Uint8Array;
                clearStateProgram: Uint8Array;
                compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                deployTimeParams: _algorandfoundation_algokit_utils_types_app.TealTemplateParams | undefined;
                schema: {
                    globalInts: number;
                    globalByteSlices: number;
                    localInts: number;
                    localByteSlices: number;
                };
                maxFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                note?: string | Uint8Array | undefined;
                args?: Uint8Array[] | undefined;
                signer?: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                rejectVersion?: number | undefined;
                lease?: string | Uint8Array | undefined;
                rekeyTo?: string | Address | undefined;
                staticFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                extraFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                validityWindow?: number | bigint | undefined;
                firstValidRound?: bigint | undefined;
                lastValidRound?: bigint | undefined;
                accountReferences?: (string | Address)[] | undefined;
                appReferences?: bigint[] | undefined;
                assetReferences?: bigint[] | undefined;
                boxReferences?: (_algorandfoundation_algokit_utils_types_app_manager.BoxIdentifier | _algorandfoundation_algokit_utils_types_app_manager.BoxReference)[] | undefined;
                accessReferences?: _algorandfoundation_algokit_utils_types_app_manager.ResourceReference[] | undefined;
                sender?: string | Address | undefined;
                updatable?: boolean | undefined;
                deletable?: boolean | undefined;
                onComplete?: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC | undefined;
                extraProgramPages?: number | undefined;
            } & {
                sender: Address;
                signer: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                onComplete: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC;
            }>;
        };
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bn254Verifier smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The transaction for a create call
             */
            bare: (params?: Expand$4<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<Transaction>;
        };
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bn254Verifier smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The create result
             */
            bare: (params?: Expand$4<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & SendParams & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                result: {
                    compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    return: undefined;
                    groupId: string;
                    txIds: string[];
                    returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
                    confirmations: modelsv2.PendingTransactionResponse[];
                    transactions: Transaction[];
                    confirmation: modelsv2.PendingTransactionResponse;
                    transaction: Transaction;
                    appId: bigint;
                    appAddress: Address;
                };
                appClient: Groth16Bn254VerifierClient;
            }>;
        };
    };
}
/**
 * A client to make calls to the Groth16Bn254Verifier smart contract
 */
declare class Groth16Bn254VerifierClient {
    /**
     * The underlying `AppClient` for when you want to have more flexibility
     */
    readonly appClient: AppClient;
    /**
     * Creates a new instance of `Groth16Bn254VerifierClient`
     *
     * @param appClient An `AppClient` instance which has been created with the Groth16Bn254Verifier app spec
     */
    constructor(appClient: AppClient);
    /**
     * Creates a new instance of `Groth16Bn254VerifierClient`
     *
     * @param params The parameters to initialise the app client with
     */
    constructor(params: Omit<AppClientParams, 'appSpec'>);
    /**
     * Returns a new `Groth16Bn254VerifierClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     * @param params The parameters to create the app client
     */
    static fromCreatorAndName(params: Omit<ResolveAppClientByCreatorAndName, 'appSpec'>): Promise<Groth16Bn254VerifierClient>;
    /**
     * Returns an `Groth16Bn254VerifierClient` instance for the current network based on
     * pre-determined network-specific app IDs specified in the ARC-56 app spec.
     *
     * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
     * @param params The parameters to create the app client
     */
    static fromNetwork(params: Omit<ResolveAppClientByNetwork, 'appSpec'>): Promise<Groth16Bn254VerifierClient>;
    /** The ID of the app instance this client is linked to. */
    get appId(): bigint;
    /** The app address of the app instance this client is linked to. */
    get appAddress(): Address;
    /** The name of the app. */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app client is using. */
    get algorand(): AlgorandClient;
    /**
     * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bn254Verifier smart contract using the `_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut params
             */
            _dummy: (params: CallParams$4<Groth16Bn254VerifierArgs["obj"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"] | Groth16Bn254VerifierArgs["tuple"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"]>) => Promise<AppCallMethodCall>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bn254Verifier smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$4<AppClientBareCallParams>) => _algorandfoundation_algokit_utils_types_composer.AppCallParams;
        /**
         * Makes a call to the Groth16Bn254Verifier smart contract using the `verify(uint256[],(byte[64],byte[128],byte[64]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        verify: (params: CallParams$4<Groth16Bn254VerifierArgs["obj"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"] | Groth16Bn254VerifierArgs["tuple"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<AppCallMethodCall>;
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bn254Verifier smart contract using the `_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut transaction
             */
            _dummy: (params: CallParams$4<Groth16Bn254VerifierArgs["obj"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"] | Groth16Bn254VerifierArgs["tuple"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"]>) => Promise<{
                transactions: Transaction[];
                methodCalls: Map<number, algosdk.ABIMethod>;
                signers: Map<number, TransactionSigner>;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bn254Verifier smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$4<AppClientBareCallParams>) => Promise<Transaction>;
        /**
         * Makes a call to the Groth16Bn254Verifier smart contract using the `verify(uint256[],(byte[64],byte[128],byte[64]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        verify: (params: CallParams$4<Groth16Bn254VerifierArgs["obj"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"] | Groth16Bn254VerifierArgs["tuple"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            transactions: Transaction[];
            methodCalls: Map<number, algosdk.ABIMethod>;
            signers: Map<number, TransactionSigner>;
        }>;
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bn254Verifier smart contract using the `_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut result
             */
            _dummy: (params: CallParams$4<Groth16Bn254VerifierArgs["obj"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"] | Groth16Bn254VerifierArgs["tuple"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"]> & SendParams) => Promise<{
                return: (undefined | Groth16Bn254VerifierReturns["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"]);
                groupId: string;
                txIds: string[];
                returns?: ABIReturn[] | undefined | undefined;
                confirmations: modelsv2.PendingTransactionResponse[];
                transactions: Transaction[];
                confirmation: modelsv2.PendingTransactionResponse;
                transaction: Transaction;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bn254Verifier smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$4<AppClientBareCallParams & SendParams>) => Promise<{
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            return?: ABIReturn | undefined;
        }>;
        /**
         * Makes a call to the Groth16Bn254Verifier smart contract using the `verify(uint256[],(byte[64],byte[128],byte[64]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        verify: (params: CallParams$4<Groth16Bn254VerifierArgs["obj"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"] | Groth16Bn254VerifierArgs["tuple"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"]> & SendParams & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            return: (undefined | Groth16Bn254VerifierReturns["verify(uint256[],(byte[64],byte[128],byte[64]))void"]);
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        }>;
    };
    /**
     * Clone this app client with different params
     *
     * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
     * @returns A new app client with the altered params
     */
    clone(params: CloneAppClientParams): Groth16Bn254VerifierClient;
    /**
     * Methods to access state for the current Groth16Bn254Verifier app
     */
    state: {};
    newGroup(): Groth16Bn254VerifierComposer;
}
type Groth16Bn254VerifierComposer<TReturns extends [...any[]] = []> = {
    /**
     * Calls the verify(uint256[],(byte[64],byte[128],byte[64]))void ABI method.
     *
     * @param args The arguments for the contract call
     * @param params Any additional parameters for the call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    verify(params?: CallParams$4<Groth16Bn254VerifierArgs['obj']['verify(uint256[],(byte[64],byte[128],byte[64]))void'] | Groth16Bn254VerifierArgs['tuple']['verify(uint256[],(byte[64],byte[128],byte[64]))void']>): Groth16Bn254VerifierComposer<[...TReturns, Groth16Bn254VerifierReturns['verify(uint256[],(byte[64],byte[128],byte[64]))void'] | undefined]>;
    /**
     * Gets available closeOut methods
     */
    readonly closeOut: {
        /**
         * Makes a close out call to an existing instance of the Groth16Bn254Verifier smart contract using the _dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void ABI method.
         *
         * @param args The arguments for the smart contract call
         * @param params Any additional parameters for the call
         * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
         */
        _dummy(params?: CallParams$4<Groth16Bn254VerifierArgs['obj']['_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void'] | Groth16Bn254VerifierArgs['tuple']['_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void']>): Groth16Bn254VerifierComposer<[...TReturns, Groth16Bn254VerifierReturns['_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void'] | undefined]>;
    };
    /**
     * Makes a clear_state call to an existing instance of the Groth16Bn254Verifier smart contract.
     *
     * @param args The arguments for the bare call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    clearState(params?: AppClientBareCallParams): Groth16Bn254VerifierComposer<[...TReturns, undefined]>;
    /**
     * Adds a transaction to the composer
     *
     * @param txn A transaction to add to the transaction group
     * @param signer The optional signer to use when signing this transaction.
     */
    addTransaction(txn: Transaction, signer?: TransactionSigner): Groth16Bn254VerifierComposer<TReturns>;
    /**
     * Returns the underlying AtomicTransactionComposer instance
     */
    composer(): Promise<TransactionComposer>;
    /**
     * Simulates the transaction group and returns the result
     */
    simulate(): Promise<Groth16Bn254VerifierComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: SkipSignaturesSimulateOptions): Promise<Groth16Bn254VerifierComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: RawSimulateOptions): Promise<Groth16Bn254VerifierComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    /**
     * Sends the transaction group to the network and returns the results
     */
    send(params?: SendParams): Promise<Groth16Bn254VerifierComposerResults<TReturns>>;
};
type Groth16Bn254VerifierComposerResults<TReturns extends [...any[]]> = Expand$4<SendAtomicTransactionComposerResults & {
    returns: TReturns;
}>;

/**
 * Expands types for IntelliSense so they are more human readable
 * See https://stackoverflow.com/a/69288824
 */
type Expand$3<T> = T extends (...args: infer A) => infer R ? (...args: Expand$3<A>) => Expand$3<R> : T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type Groth16Bn254Proof$1 = {
    piA: Uint8Array;
    piB: Uint8Array;
    piC: Uint8Array;
};
type Groth16Bn254VerificationKey = {
    vkAlpha_1: Uint8Array;
    vkBeta_2: Uint8Array;
    vkGamma_2: Uint8Array;
    vkDelta_2: Uint8Array;
    nPublic: bigint;
    ic: Uint8Array[];
};
/**
 * The argument types for the Groth16Bn254VerifierWithLogs contract
 */
type Groth16Bn254VerifierWithLogsArgs = {
    /**
     * The object representation of the arguments for each method
     */
    obj: {
        '_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void': {
            _vk: Groth16Bn254VerificationKey;
        };
        'verify(uint256[],(byte[64],byte[128],byte[64]))void': {
            signals: bigint[] | number[];
            proof: Groth16Bn254Proof$1;
        };
    };
    /**
     * The tuple representation of the arguments for each method
     */
    tuple: {
        '_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void': [_vk: Groth16Bn254VerificationKey];
        'verify(uint256[],(byte[64],byte[128],byte[64]))void': [signals: bigint[] | number[], proof: Groth16Bn254Proof$1];
    };
};
/**
 * The return type for each method
 */
type Groth16Bn254VerifierWithLogsReturns = {
    '_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void': void;
    'verify(uint256[],(byte[64],byte[128],byte[64]))void': void;
};
/**
 * Defines an object containing all relevant parameters for a single call to the contract.
 */
type CallParams$3<TArgs> = Expand$3<Omit<AppClientMethodCallParams, 'method' | 'args' | 'onComplete'> & {
    /** The args for the ABI method call, either as an ordered array or an object */
    args: Expand$3<TArgs>;
}>;
/**
 * Defines supported create method params for this smart contract
 */
type Groth16Bn254VerifierWithLogsCreateCallParams = Expand$3<AppClientBareCallParams & {
    method?: never;
} & {
    onComplete?: OnApplicationComplete.NoOpOC;
} & CreateSchema>;
/**
 * Defines arguments required for the deploy method.
 */
type Groth16Bn254VerifierWithLogsDeployParams = Expand$3<Omit<AppFactoryDeployParams, 'createParams' | 'updateParams' | 'deleteParams'> & {
    /**
     * Create transaction parameters to use if a create needs to be issued as part of deployment; use `method` to define ABI call (if available) or leave out for a bare call (if available)
     */
    createParams?: Groth16Bn254VerifierWithLogsCreateCallParams;
}>;
/**
 * A factory to create and deploy one or more instance of the Groth16Bn254VerifierWithLogs smart contract and to create one or more app clients to interact with those (or other) app instances
 */
declare class Groth16Bn254VerifierWithLogsFactory {
    /**
     * The underlying `AppFactory` for when you want to have more flexibility
     */
    readonly appFactory: AppFactory;
    /**
     * Creates a new instance of `Groth16Bn254VerifierWithLogsFactory`
     *
     * @param params The parameters to initialise the app factory with
     */
    constructor(params: Omit<AppFactoryParams, 'appSpec'>);
    /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app factory is using. */
    get algorand(): AlgorandClient;
    /**
     * Returns a new `AppClient` client for an app instance of the given ID.
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientById(params: AppFactoryAppClientParams): Groth16Bn254VerifierWithLogsClient;
    /**
     * Returns a new `AppClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientByCreatorAndName(params: AppFactoryResolveAppClientByCreatorAndNameParams): Promise<Groth16Bn254VerifierWithLogsClient>;
    /**
     * Idempotently deploys the Groth16Bn254VerifierWithLogs smart contract.
     *
     * @param params The arguments for the contract calls and any additional parameters for the call
     * @returns The deployment result
     */
    deploy(params?: Groth16Bn254VerifierWithLogsDeployParams): Promise<{
        result: {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "create";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "update";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "replace";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
            deleteResult: _algorandfoundation_algokit_utils_types_transaction.ConfirmedTransactionResult;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "nothing";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
        };
        appClient: Groth16Bn254VerifierWithLogsClient;
    }>;
    /**
     * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bn254VerifierWithLogs smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The params for a create call
             */
            bare: (params?: Expand$3<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                approvalProgram: Uint8Array;
                clearStateProgram: Uint8Array;
                compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                deployTimeParams: _algorandfoundation_algokit_utils_types_app.TealTemplateParams | undefined;
                schema: {
                    globalInts: number;
                    globalByteSlices: number;
                    localInts: number;
                    localByteSlices: number;
                };
                maxFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                note?: string | Uint8Array | undefined;
                args?: Uint8Array[] | undefined;
                signer?: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                rejectVersion?: number | undefined;
                lease?: string | Uint8Array | undefined;
                rekeyTo?: string | Address | undefined;
                staticFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                extraFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                validityWindow?: number | bigint | undefined;
                firstValidRound?: bigint | undefined;
                lastValidRound?: bigint | undefined;
                accountReferences?: (string | Address)[] | undefined;
                appReferences?: bigint[] | undefined;
                assetReferences?: bigint[] | undefined;
                boxReferences?: (_algorandfoundation_algokit_utils_types_app_manager.BoxIdentifier | _algorandfoundation_algokit_utils_types_app_manager.BoxReference)[] | undefined;
                accessReferences?: _algorandfoundation_algokit_utils_types_app_manager.ResourceReference[] | undefined;
                sender?: string | Address | undefined;
                updatable?: boolean | undefined;
                deletable?: boolean | undefined;
                onComplete?: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC | undefined;
                extraProgramPages?: number | undefined;
            } & {
                sender: Address;
                signer: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                onComplete: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC;
            }>;
        };
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bn254VerifierWithLogs smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The transaction for a create call
             */
            bare: (params?: Expand$3<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<Transaction>;
        };
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bn254VerifierWithLogs smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The create result
             */
            bare: (params?: Expand$3<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & SendParams & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                result: {
                    compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    return: undefined;
                    groupId: string;
                    txIds: string[];
                    returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
                    confirmations: modelsv2.PendingTransactionResponse[];
                    transactions: Transaction[];
                    confirmation: modelsv2.PendingTransactionResponse;
                    transaction: Transaction;
                    appId: bigint;
                    appAddress: Address;
                };
                appClient: Groth16Bn254VerifierWithLogsClient;
            }>;
        };
    };
}
/**
 * A client to make calls to the Groth16Bn254VerifierWithLogs smart contract
 */
declare class Groth16Bn254VerifierWithLogsClient {
    /**
     * The underlying `AppClient` for when you want to have more flexibility
     */
    readonly appClient: AppClient;
    /**
     * Creates a new instance of `Groth16Bn254VerifierWithLogsClient`
     *
     * @param appClient An `AppClient` instance which has been created with the Groth16Bn254VerifierWithLogs app spec
     */
    constructor(appClient: AppClient);
    /**
     * Creates a new instance of `Groth16Bn254VerifierWithLogsClient`
     *
     * @param params The parameters to initialise the app client with
     */
    constructor(params: Omit<AppClientParams, 'appSpec'>);
    /**
     * Returns a new `Groth16Bn254VerifierWithLogsClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     * @param params The parameters to create the app client
     */
    static fromCreatorAndName(params: Omit<ResolveAppClientByCreatorAndName, 'appSpec'>): Promise<Groth16Bn254VerifierWithLogsClient>;
    /**
     * Returns an `Groth16Bn254VerifierWithLogsClient` instance for the current network based on
     * pre-determined network-specific app IDs specified in the ARC-56 app spec.
     *
     * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
     * @param params The parameters to create the app client
     */
    static fromNetwork(params: Omit<ResolveAppClientByNetwork, 'appSpec'>): Promise<Groth16Bn254VerifierWithLogsClient>;
    /** The ID of the app instance this client is linked to. */
    get appId(): bigint;
    /** The app address of the app instance this client is linked to. */
    get appAddress(): Address;
    /** The name of the app. */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app client is using. */
    get algorand(): AlgorandClient;
    /**
     * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bn254VerifierWithLogs smart contract using the `_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut params
             */
            _dummy: (params: CallParams$3<Groth16Bn254VerifierWithLogsArgs["obj"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"] | Groth16Bn254VerifierWithLogsArgs["tuple"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"]>) => Promise<AppCallMethodCall>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bn254VerifierWithLogs smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$3<AppClientBareCallParams>) => _algorandfoundation_algokit_utils_types_composer.AppCallParams;
        /**
         * Makes a call to the Groth16Bn254VerifierWithLogs smart contract using the `verify(uint256[],(byte[64],byte[128],byte[64]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        verify: (params: CallParams$3<Groth16Bn254VerifierWithLogsArgs["obj"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"] | Groth16Bn254VerifierWithLogsArgs["tuple"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<AppCallMethodCall>;
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bn254VerifierWithLogs smart contract using the `_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut transaction
             */
            _dummy: (params: CallParams$3<Groth16Bn254VerifierWithLogsArgs["obj"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"] | Groth16Bn254VerifierWithLogsArgs["tuple"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"]>) => Promise<{
                transactions: Transaction[];
                methodCalls: Map<number, algosdk.ABIMethod>;
                signers: Map<number, TransactionSigner>;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bn254VerifierWithLogs smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$3<AppClientBareCallParams>) => Promise<Transaction>;
        /**
         * Makes a call to the Groth16Bn254VerifierWithLogs smart contract using the `verify(uint256[],(byte[64],byte[128],byte[64]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        verify: (params: CallParams$3<Groth16Bn254VerifierWithLogsArgs["obj"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"] | Groth16Bn254VerifierWithLogsArgs["tuple"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            transactions: Transaction[];
            methodCalls: Map<number, algosdk.ABIMethod>;
            signers: Map<number, TransactionSigner>;
        }>;
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available closeOut methods
         */
        closeOut: {
            /**
             * Makes a close out call to an existing instance of the Groth16Bn254VerifierWithLogs smart contract using the `_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void` ABI method.
             *
             * Dummy function that only exists so we can have the VerificationKey type in the generated client
             *
             * @param params The params for the smart contract call
             * @returns The closeOut result
             */
            _dummy: (params: CallParams$3<Groth16Bn254VerifierWithLogsArgs["obj"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"] | Groth16Bn254VerifierWithLogsArgs["tuple"]["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"]> & SendParams) => Promise<{
                return: (undefined | Groth16Bn254VerifierWithLogsReturns["_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void"]);
                groupId: string;
                txIds: string[];
                returns?: ABIReturn[] | undefined | undefined;
                confirmations: modelsv2.PendingTransactionResponse[];
                transactions: Transaction[];
                confirmation: modelsv2.PendingTransactionResponse;
                transaction: Transaction;
            }>;
        };
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bn254VerifierWithLogs smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$3<AppClientBareCallParams & SendParams>) => Promise<{
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            return?: ABIReturn | undefined;
        }>;
        /**
         * Makes a call to the Groth16Bn254VerifierWithLogs smart contract using the `verify(uint256[],(byte[64],byte[128],byte[64]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        verify: (params: CallParams$3<Groth16Bn254VerifierWithLogsArgs["obj"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"] | Groth16Bn254VerifierWithLogsArgs["tuple"]["verify(uint256[],(byte[64],byte[128],byte[64]))void"]> & SendParams & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            return: (undefined | Groth16Bn254VerifierWithLogsReturns["verify(uint256[],(byte[64],byte[128],byte[64]))void"]);
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        }>;
    };
    /**
     * Clone this app client with different params
     *
     * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
     * @returns A new app client with the altered params
     */
    clone(params: CloneAppClientParams): Groth16Bn254VerifierWithLogsClient;
    /**
     * Methods to access state for the current Groth16Bn254VerifierWithLogs app
     */
    state: {};
    newGroup(): Groth16Bn254VerifierWithLogsComposer;
}
type Groth16Bn254VerifierWithLogsComposer<TReturns extends [...any[]] = []> = {
    /**
     * Calls the verify(uint256[],(byte[64],byte[128],byte[64]))void ABI method.
     *
     * @param args The arguments for the contract call
     * @param params Any additional parameters for the call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    verify(params?: CallParams$3<Groth16Bn254VerifierWithLogsArgs['obj']['verify(uint256[],(byte[64],byte[128],byte[64]))void'] | Groth16Bn254VerifierWithLogsArgs['tuple']['verify(uint256[],(byte[64],byte[128],byte[64]))void']>): Groth16Bn254VerifierWithLogsComposer<[...TReturns, Groth16Bn254VerifierWithLogsReturns['verify(uint256[],(byte[64],byte[128],byte[64]))void'] | undefined]>;
    /**
     * Gets available closeOut methods
     */
    readonly closeOut: {
        /**
         * Makes a close out call to an existing instance of the Groth16Bn254VerifierWithLogs smart contract using the _dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void ABI method.
         *
         * @param args The arguments for the smart contract call
         * @param params Any additional parameters for the call
         * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
         */
        _dummy(params?: CallParams$3<Groth16Bn254VerifierWithLogsArgs['obj']['_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void'] | Groth16Bn254VerifierWithLogsArgs['tuple']['_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void']>): Groth16Bn254VerifierWithLogsComposer<[...TReturns, Groth16Bn254VerifierWithLogsReturns['_dummy((byte[64],byte[128],byte[128],byte[128],uint64,byte[64][]))void'] | undefined]>;
    };
    /**
     * Makes a clear_state call to an existing instance of the Groth16Bn254VerifierWithLogs smart contract.
     *
     * @param args The arguments for the bare call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    clearState(params?: AppClientBareCallParams): Groth16Bn254VerifierWithLogsComposer<[...TReturns, undefined]>;
    /**
     * Adds a transaction to the composer
     *
     * @param txn A transaction to add to the transaction group
     * @param signer The optional signer to use when signing this transaction.
     */
    addTransaction(txn: Transaction, signer?: TransactionSigner): Groth16Bn254VerifierWithLogsComposer<TReturns>;
    /**
     * Returns the underlying AtomicTransactionComposer instance
     */
    composer(): Promise<TransactionComposer>;
    /**
     * Simulates the transaction group and returns the result
     */
    simulate(): Promise<Groth16Bn254VerifierWithLogsComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: SkipSignaturesSimulateOptions): Promise<Groth16Bn254VerifierWithLogsComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: RawSimulateOptions): Promise<Groth16Bn254VerifierWithLogsComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    /**
     * Sends the transaction group to the network and returns the results
     */
    send(params?: SendParams): Promise<Groth16Bn254VerifierWithLogsComposerResults<TReturns>>;
};
type Groth16Bn254VerifierWithLogsComposerResults<TReturns extends [...any[]]> = Expand$3<SendAtomicTransactionComposerResults & {
    returns: TReturns;
}>;

/**
 * Expands types for IntelliSense so they are more human readable
 * See https://stackoverflow.com/a/69288824
 */
type Expand$2<T> = T extends (...args: infer A) => infer R ? (...args: Expand$2<A>) => Expand$2<R> : T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type Groth16Bls12381Proof = {
    piA: Uint8Array;
    piB: Uint8Array;
    piC: Uint8Array;
};
/**
 * The argument types for the Groth16Bls12381SignalsAndProof contract
 */
type Groth16Bls12381SignalsAndProofArgs = {
    /**
     * The object representation of the arguments for each method
     */
    obj: {
        'signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void': {
            signals: bigint[] | number[];
            proof: Groth16Bls12381Proof;
        };
    };
    /**
     * The tuple representation of the arguments for each method
     */
    tuple: {
        'signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void': [signals: bigint[] | number[], proof: Groth16Bls12381Proof];
    };
};
/**
 * The return type for each method
 */
type Groth16Bls12381SignalsAndProofReturns = {
    'signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void': void;
};
/**
 * Defines an object containing all relevant parameters for a single call to the contract.
 */
type CallParams$2<TArgs> = Expand$2<Omit<AppClientMethodCallParams, 'method' | 'args' | 'onComplete'> & {
    /** The args for the ABI method call, either as an ordered array or an object */
    args: Expand$2<TArgs>;
}>;
/**
 * Defines supported create method params for this smart contract
 */
type Groth16Bls12381SignalsAndProofCreateCallParams = Expand$2<AppClientBareCallParams & {
    method?: never;
} & {
    onComplete?: OnApplicationComplete.NoOpOC;
} & CreateSchema>;
/**
 * Defines arguments required for the deploy method.
 */
type Groth16Bls12381SignalsAndProofDeployParams = Expand$2<Omit<AppFactoryDeployParams, 'createParams' | 'updateParams' | 'deleteParams'> & {
    /**
     * Create transaction parameters to use if a create needs to be issued as part of deployment; use `method` to define ABI call (if available) or leave out for a bare call (if available)
     */
    createParams?: Groth16Bls12381SignalsAndProofCreateCallParams;
}>;
/**
 * A factory to create and deploy one or more instance of the Groth16Bls12381SignalsAndProof smart contract and to create one or more app clients to interact with those (or other) app instances
 */
declare class Groth16Bls12381SignalsAndProofFactory {
    /**
     * The underlying `AppFactory` for when you want to have more flexibility
     */
    readonly appFactory: AppFactory;
    /**
     * Creates a new instance of `Groth16Bls12381SignalsAndProofFactory`
     *
     * @param params The parameters to initialise the app factory with
     */
    constructor(params: Omit<AppFactoryParams, 'appSpec'>);
    /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app factory is using. */
    get algorand(): AlgorandClient;
    /**
     * Returns a new `AppClient` client for an app instance of the given ID.
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientById(params: AppFactoryAppClientParams): Groth16Bls12381SignalsAndProofClient;
    /**
     * Returns a new `AppClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientByCreatorAndName(params: AppFactoryResolveAppClientByCreatorAndNameParams): Promise<Groth16Bls12381SignalsAndProofClient>;
    /**
     * Idempotently deploys the Groth16Bls12381SignalsAndProof smart contract.
     *
     * @param params The arguments for the contract calls and any additional parameters for the call
     * @returns The deployment result
     */
    deploy(params?: Groth16Bls12381SignalsAndProofDeployParams): Promise<{
        result: {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "create";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "update";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "replace";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
            deleteResult: _algorandfoundation_algokit_utils_types_transaction.ConfirmedTransactionResult;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "nothing";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
        };
        appClient: Groth16Bls12381SignalsAndProofClient;
    }>;
    /**
     * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bls12381SignalsAndProof smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The params for a create call
             */
            bare: (params?: Expand$2<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                approvalProgram: Uint8Array;
                clearStateProgram: Uint8Array;
                compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                deployTimeParams: _algorandfoundation_algokit_utils_types_app.TealTemplateParams | undefined;
                schema: {
                    globalInts: number;
                    globalByteSlices: number;
                    localInts: number;
                    localByteSlices: number;
                };
                maxFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                note?: string | Uint8Array | undefined;
                args?: Uint8Array[] | undefined;
                signer?: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                rejectVersion?: number | undefined;
                lease?: string | Uint8Array | undefined;
                rekeyTo?: string | Address | undefined;
                staticFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                extraFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                validityWindow?: number | bigint | undefined;
                firstValidRound?: bigint | undefined;
                lastValidRound?: bigint | undefined;
                accountReferences?: (string | Address)[] | undefined;
                appReferences?: bigint[] | undefined;
                assetReferences?: bigint[] | undefined;
                boxReferences?: (_algorandfoundation_algokit_utils_types_app_manager.BoxIdentifier | _algorandfoundation_algokit_utils_types_app_manager.BoxReference)[] | undefined;
                accessReferences?: _algorandfoundation_algokit_utils_types_app_manager.ResourceReference[] | undefined;
                sender?: string | Address | undefined;
                updatable?: boolean | undefined;
                deletable?: boolean | undefined;
                onComplete?: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC | undefined;
                extraProgramPages?: number | undefined;
            } & {
                sender: Address;
                signer: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                onComplete: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC;
            }>;
        };
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bls12381SignalsAndProof smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The transaction for a create call
             */
            bare: (params?: Expand$2<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<Transaction>;
        };
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bls12381SignalsAndProof smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The create result
             */
            bare: (params?: Expand$2<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & SendParams & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                result: {
                    compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    return: undefined;
                    groupId: string;
                    txIds: string[];
                    returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
                    confirmations: modelsv2.PendingTransactionResponse[];
                    transactions: Transaction[];
                    confirmation: modelsv2.PendingTransactionResponse;
                    transaction: Transaction;
                    appId: bigint;
                    appAddress: Address;
                };
                appClient: Groth16Bls12381SignalsAndProofClient;
            }>;
        };
    };
}
/**
 * A client to make calls to the Groth16Bls12381SignalsAndProof smart contract
 */
declare class Groth16Bls12381SignalsAndProofClient {
    /**
     * The underlying `AppClient` for when you want to have more flexibility
     */
    readonly appClient: AppClient;
    /**
     * Creates a new instance of `Groth16Bls12381SignalsAndProofClient`
     *
     * @param appClient An `AppClient` instance which has been created with the Groth16Bls12381SignalsAndProof app spec
     */
    constructor(appClient: AppClient);
    /**
     * Creates a new instance of `Groth16Bls12381SignalsAndProofClient`
     *
     * @param params The parameters to initialise the app client with
     */
    constructor(params: Omit<AppClientParams, 'appSpec'>);
    /**
     * Returns a new `Groth16Bls12381SignalsAndProofClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     * @param params The parameters to create the app client
     */
    static fromCreatorAndName(params: Omit<ResolveAppClientByCreatorAndName, 'appSpec'>): Promise<Groth16Bls12381SignalsAndProofClient>;
    /**
     * Returns an `Groth16Bls12381SignalsAndProofClient` instance for the current network based on
     * pre-determined network-specific app IDs specified in the ARC-56 app spec.
     *
     * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
     * @param params The parameters to create the app client
     */
    static fromNetwork(params: Omit<ResolveAppClientByNetwork, 'appSpec'>): Promise<Groth16Bls12381SignalsAndProofClient>;
    /** The ID of the app instance this client is linked to. */
    get appId(): bigint;
    /** The app address of the app instance this client is linked to. */
    get appAddress(): Address;
    /** The name of the app. */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app client is using. */
    get algorand(): AlgorandClient;
    /**
     * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bls12381SignalsAndProof smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$2<AppClientBareCallParams>) => _algorandfoundation_algokit_utils_types_composer.AppCallParams;
        /**
         * Makes a call to the Groth16Bls12381SignalsAndProof smart contract using the `signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        signalsAndProof: (params: CallParams$2<Groth16Bls12381SignalsAndProofArgs["obj"]["signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void"] | Groth16Bls12381SignalsAndProofArgs["tuple"]["signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<AppCallMethodCall>;
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bls12381SignalsAndProof smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$2<AppClientBareCallParams>) => Promise<Transaction>;
        /**
         * Makes a call to the Groth16Bls12381SignalsAndProof smart contract using the `signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        signalsAndProof: (params: CallParams$2<Groth16Bls12381SignalsAndProofArgs["obj"]["signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void"] | Groth16Bls12381SignalsAndProofArgs["tuple"]["signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            transactions: Transaction[];
            methodCalls: Map<number, algosdk.ABIMethod>;
            signers: Map<number, TransactionSigner>;
        }>;
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bls12381SignalsAndProof smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$2<AppClientBareCallParams & SendParams>) => Promise<{
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            return?: ABIReturn | undefined;
        }>;
        /**
         * Makes a call to the Groth16Bls12381SignalsAndProof smart contract using the `signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        signalsAndProof: (params: CallParams$2<Groth16Bls12381SignalsAndProofArgs["obj"]["signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void"] | Groth16Bls12381SignalsAndProofArgs["tuple"]["signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void"]> & SendParams & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            return: (undefined | Groth16Bls12381SignalsAndProofReturns["signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void"]);
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        }>;
    };
    /**
     * Clone this app client with different params
     *
     * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
     * @returns A new app client with the altered params
     */
    clone(params: CloneAppClientParams): Groth16Bls12381SignalsAndProofClient;
    /**
     * Methods to access state for the current Groth16Bls12381SignalsAndProof app
     */
    state: {};
    newGroup(): Groth16Bls12381SignalsAndProofComposer;
}
type Groth16Bls12381SignalsAndProofComposer<TReturns extends [...any[]] = []> = {
    /**
     * Calls the signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void ABI method.
     *
     * @param args The arguments for the contract call
     * @param params Any additional parameters for the call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    signalsAndProof(params?: CallParams$2<Groth16Bls12381SignalsAndProofArgs['obj']['signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void'] | Groth16Bls12381SignalsAndProofArgs['tuple']['signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void']>): Groth16Bls12381SignalsAndProofComposer<[...TReturns, Groth16Bls12381SignalsAndProofReturns['signalsAndProof(uint256[],(byte[96],byte[192],byte[96]))void'] | undefined]>;
    /**
     * Makes a clear_state call to an existing instance of the Groth16Bls12381SignalsAndProof smart contract.
     *
     * @param args The arguments for the bare call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    clearState(params?: AppClientBareCallParams): Groth16Bls12381SignalsAndProofComposer<[...TReturns, undefined]>;
    /**
     * Adds a transaction to the composer
     *
     * @param txn A transaction to add to the transaction group
     * @param signer The optional signer to use when signing this transaction.
     */
    addTransaction(txn: Transaction, signer?: TransactionSigner): Groth16Bls12381SignalsAndProofComposer<TReturns>;
    /**
     * Returns the underlying AtomicTransactionComposer instance
     */
    composer(): Promise<TransactionComposer>;
    /**
     * Simulates the transaction group and returns the result
     */
    simulate(): Promise<Groth16Bls12381SignalsAndProofComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: SkipSignaturesSimulateOptions): Promise<Groth16Bls12381SignalsAndProofComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: RawSimulateOptions): Promise<Groth16Bls12381SignalsAndProofComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    /**
     * Sends the transaction group to the network and returns the results
     */
    send(params?: SendParams): Promise<Groth16Bls12381SignalsAndProofComposerResults<TReturns>>;
};
type Groth16Bls12381SignalsAndProofComposerResults<TReturns extends [...any[]]> = Expand$2<SendAtomicTransactionComposerResults & {
    returns: TReturns;
}>;

/**
 * Expands types for IntelliSense so they are more human readable
 * See https://stackoverflow.com/a/69288824
 */
type Expand$1<T> = T extends (...args: infer A) => infer R ? (...args: Expand$1<A>) => Expand$1<R> : T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type Groth16Bn254Proof = {
    piA: Uint8Array;
    piB: Uint8Array;
    piC: Uint8Array;
};
/**
 * The argument types for the Groth16Bn254SignalsAndProof contract
 */
type Groth16Bn254SignalsAndProofArgs = {
    /**
     * The object representation of the arguments for each method
     */
    obj: {
        'signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void': {
            signals: bigint[] | number[];
            proof: Groth16Bn254Proof;
        };
    };
    /**
     * The tuple representation of the arguments for each method
     */
    tuple: {
        'signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void': [signals: bigint[] | number[], proof: Groth16Bn254Proof];
    };
};
/**
 * The return type for each method
 */
type Groth16Bn254SignalsAndProofReturns = {
    'signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void': void;
};
/**
 * Defines an object containing all relevant parameters for a single call to the contract.
 */
type CallParams$1<TArgs> = Expand$1<Omit<AppClientMethodCallParams, 'method' | 'args' | 'onComplete'> & {
    /** The args for the ABI method call, either as an ordered array or an object */
    args: Expand$1<TArgs>;
}>;
/**
 * Defines supported create method params for this smart contract
 */
type Groth16Bn254SignalsAndProofCreateCallParams = Expand$1<AppClientBareCallParams & {
    method?: never;
} & {
    onComplete?: OnApplicationComplete.NoOpOC;
} & CreateSchema>;
/**
 * Defines arguments required for the deploy method.
 */
type Groth16Bn254SignalsAndProofDeployParams = Expand$1<Omit<AppFactoryDeployParams, 'createParams' | 'updateParams' | 'deleteParams'> & {
    /**
     * Create transaction parameters to use if a create needs to be issued as part of deployment; use `method` to define ABI call (if available) or leave out for a bare call (if available)
     */
    createParams?: Groth16Bn254SignalsAndProofCreateCallParams;
}>;
/**
 * A factory to create and deploy one or more instance of the Groth16Bn254SignalsAndProof smart contract and to create one or more app clients to interact with those (or other) app instances
 */
declare class Groth16Bn254SignalsAndProofFactory {
    /**
     * The underlying `AppFactory` for when you want to have more flexibility
     */
    readonly appFactory: AppFactory;
    /**
     * Creates a new instance of `Groth16Bn254SignalsAndProofFactory`
     *
     * @param params The parameters to initialise the app factory with
     */
    constructor(params: Omit<AppFactoryParams, 'appSpec'>);
    /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app factory is using. */
    get algorand(): AlgorandClient;
    /**
     * Returns a new `AppClient` client for an app instance of the given ID.
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientById(params: AppFactoryAppClientParams): Groth16Bn254SignalsAndProofClient;
    /**
     * Returns a new `AppClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientByCreatorAndName(params: AppFactoryResolveAppClientByCreatorAndNameParams): Promise<Groth16Bn254SignalsAndProofClient>;
    /**
     * Idempotently deploys the Groth16Bn254SignalsAndProof smart contract.
     *
     * @param params The arguments for the contract calls and any additional parameters for the call
     * @returns The deployment result
     */
    deploy(params?: Groth16Bn254SignalsAndProofDeployParams): Promise<{
        result: {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "create";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "update";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "replace";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
            deleteResult: _algorandfoundation_algokit_utils_types_transaction.ConfirmedTransactionResult;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "nothing";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
        };
        appClient: Groth16Bn254SignalsAndProofClient;
    }>;
    /**
     * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bn254SignalsAndProof smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The params for a create call
             */
            bare: (params?: Expand$1<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                approvalProgram: Uint8Array;
                clearStateProgram: Uint8Array;
                compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                deployTimeParams: _algorandfoundation_algokit_utils_types_app.TealTemplateParams | undefined;
                schema: {
                    globalInts: number;
                    globalByteSlices: number;
                    localInts: number;
                    localByteSlices: number;
                };
                maxFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                note?: string | Uint8Array | undefined;
                args?: Uint8Array[] | undefined;
                signer?: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                rejectVersion?: number | undefined;
                lease?: string | Uint8Array | undefined;
                rekeyTo?: string | Address | undefined;
                staticFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                extraFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                validityWindow?: number | bigint | undefined;
                firstValidRound?: bigint | undefined;
                lastValidRound?: bigint | undefined;
                accountReferences?: (string | Address)[] | undefined;
                appReferences?: bigint[] | undefined;
                assetReferences?: bigint[] | undefined;
                boxReferences?: (_algorandfoundation_algokit_utils_types_app_manager.BoxIdentifier | _algorandfoundation_algokit_utils_types_app_manager.BoxReference)[] | undefined;
                accessReferences?: _algorandfoundation_algokit_utils_types_app_manager.ResourceReference[] | undefined;
                sender?: string | Address | undefined;
                updatable?: boolean | undefined;
                deletable?: boolean | undefined;
                onComplete?: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC | undefined;
                extraProgramPages?: number | undefined;
            } & {
                sender: Address;
                signer: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                onComplete: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC;
            }>;
        };
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bn254SignalsAndProof smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The transaction for a create call
             */
            bare: (params?: Expand$1<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<Transaction>;
        };
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the Groth16Bn254SignalsAndProof smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The create result
             */
            bare: (params?: Expand$1<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & SendParams & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                result: {
                    compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    return: undefined;
                    groupId: string;
                    txIds: string[];
                    returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
                    confirmations: modelsv2.PendingTransactionResponse[];
                    transactions: Transaction[];
                    confirmation: modelsv2.PendingTransactionResponse;
                    transaction: Transaction;
                    appId: bigint;
                    appAddress: Address;
                };
                appClient: Groth16Bn254SignalsAndProofClient;
            }>;
        };
    };
}
/**
 * A client to make calls to the Groth16Bn254SignalsAndProof smart contract
 */
declare class Groth16Bn254SignalsAndProofClient {
    /**
     * The underlying `AppClient` for when you want to have more flexibility
     */
    readonly appClient: AppClient;
    /**
     * Creates a new instance of `Groth16Bn254SignalsAndProofClient`
     *
     * @param appClient An `AppClient` instance which has been created with the Groth16Bn254SignalsAndProof app spec
     */
    constructor(appClient: AppClient);
    /**
     * Creates a new instance of `Groth16Bn254SignalsAndProofClient`
     *
     * @param params The parameters to initialise the app client with
     */
    constructor(params: Omit<AppClientParams, 'appSpec'>);
    /**
     * Returns a new `Groth16Bn254SignalsAndProofClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     * @param params The parameters to create the app client
     */
    static fromCreatorAndName(params: Omit<ResolveAppClientByCreatorAndName, 'appSpec'>): Promise<Groth16Bn254SignalsAndProofClient>;
    /**
     * Returns an `Groth16Bn254SignalsAndProofClient` instance for the current network based on
     * pre-determined network-specific app IDs specified in the ARC-56 app spec.
     *
     * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
     * @param params The parameters to create the app client
     */
    static fromNetwork(params: Omit<ResolveAppClientByNetwork, 'appSpec'>): Promise<Groth16Bn254SignalsAndProofClient>;
    /** The ID of the app instance this client is linked to. */
    get appId(): bigint;
    /** The app address of the app instance this client is linked to. */
    get appAddress(): Address;
    /** The name of the app. */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app client is using. */
    get algorand(): AlgorandClient;
    /**
     * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bn254SignalsAndProof smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$1<AppClientBareCallParams>) => _algorandfoundation_algokit_utils_types_composer.AppCallParams;
        /**
         * Makes a call to the Groth16Bn254SignalsAndProof smart contract using the `signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        signalsAndProof: (params: CallParams$1<Groth16Bn254SignalsAndProofArgs["obj"]["signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void"] | Groth16Bn254SignalsAndProofArgs["tuple"]["signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<AppCallMethodCall>;
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bn254SignalsAndProof smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$1<AppClientBareCallParams>) => Promise<Transaction>;
        /**
         * Makes a call to the Groth16Bn254SignalsAndProof smart contract using the `signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        signalsAndProof: (params: CallParams$1<Groth16Bn254SignalsAndProofArgs["obj"]["signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void"] | Groth16Bn254SignalsAndProofArgs["tuple"]["signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            transactions: Transaction[];
            methodCalls: Map<number, algosdk.ABIMethod>;
            signers: Map<number, TransactionSigner>;
        }>;
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Makes a clear_state call to an existing instance of the Groth16Bn254SignalsAndProof smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand$1<AppClientBareCallParams & SendParams>) => Promise<{
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            return?: ABIReturn | undefined;
        }>;
        /**
         * Makes a call to the Groth16Bn254SignalsAndProof smart contract using the `signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        signalsAndProof: (params: CallParams$1<Groth16Bn254SignalsAndProofArgs["obj"]["signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void"] | Groth16Bn254SignalsAndProofArgs["tuple"]["signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void"]> & SendParams & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            return: (undefined | Groth16Bn254SignalsAndProofReturns["signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void"]);
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        }>;
    };
    /**
     * Clone this app client with different params
     *
     * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
     * @returns A new app client with the altered params
     */
    clone(params: CloneAppClientParams): Groth16Bn254SignalsAndProofClient;
    /**
     * Methods to access state for the current Groth16Bn254SignalsAndProof app
     */
    state: {};
    newGroup(): Groth16Bn254SignalsAndProofComposer;
}
type Groth16Bn254SignalsAndProofComposer<TReturns extends [...any[]] = []> = {
    /**
     * Calls the signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void ABI method.
     *
     * @param args The arguments for the contract call
     * @param params Any additional parameters for the call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    signalsAndProof(params?: CallParams$1<Groth16Bn254SignalsAndProofArgs['obj']['signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void'] | Groth16Bn254SignalsAndProofArgs['tuple']['signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void']>): Groth16Bn254SignalsAndProofComposer<[...TReturns, Groth16Bn254SignalsAndProofReturns['signalsAndProof(uint256[],(byte[64],byte[128],byte[64]))void'] | undefined]>;
    /**
     * Makes a clear_state call to an existing instance of the Groth16Bn254SignalsAndProof smart contract.
     *
     * @param args The arguments for the bare call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    clearState(params?: AppClientBareCallParams): Groth16Bn254SignalsAndProofComposer<[...TReturns, undefined]>;
    /**
     * Adds a transaction to the composer
     *
     * @param txn A transaction to add to the transaction group
     * @param signer The optional signer to use when signing this transaction.
     */
    addTransaction(txn: Transaction, signer?: TransactionSigner): Groth16Bn254SignalsAndProofComposer<TReturns>;
    /**
     * Returns the underlying AtomicTransactionComposer instance
     */
    composer(): Promise<TransactionComposer>;
    /**
     * Simulates the transaction group and returns the result
     */
    simulate(): Promise<Groth16Bn254SignalsAndProofComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: SkipSignaturesSimulateOptions): Promise<Groth16Bn254SignalsAndProofComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: RawSimulateOptions): Promise<Groth16Bn254SignalsAndProofComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    /**
     * Sends the transaction group to the network and returns the results
     */
    send(params?: SendParams): Promise<Groth16Bn254SignalsAndProofComposerResults<TReturns>>;
};
type Groth16Bn254SignalsAndProofComposerResults<TReturns extends [...any[]]> = Expand$1<SendAtomicTransactionComposerResults & {
    returns: TReturns;
}>;

declare function getGroth16Bls12381Vkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<Groth16Bls12381VerificationKey$1>;
declare function encodeGroth16Bls12381Vk(vkey: Groth16Bls12381VerificationKey$1, appSpec: Arc56Contract): Uint8Array;
declare function getGroth16Bls12381Proof(path: string, curve: any): Promise<Groth16Bls12381Proof$2>;
declare function encodeGroth16Bls12381Proof(proof: any, curve: any): Groth16Bls12381Proof$2;
type Groth16Bls12381Witness = {
    proof: Groth16Bls12381Proof$2;
    signals: bigint[];
};
declare class Groth16Bls12381LsigVerifier extends LsigVerifier<Groth16Bls12381VerificationKey$1, Groth16Bls12381Witness> {
    constructor(options: LsigVerifierOptions<Groth16Bls12381VerificationKey$1>);
    protected getVkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<Groth16Bls12381VerificationKey$1>;
    protected encodeVkey(vk: Groth16Bls12381VerificationKey$1, appSpec: Arc56Contract): Uint8Array;
    protected encodeProof(proof: any, curve: any): Groth16Bls12381Proof$2;
    protected fullProve(inputs: snarkjs.CircuitSignals, wasmProver: snarkjs.ZKArtifact, zKey: snarkjs.ZKArtifact): Promise<{
        proof: any;
        publicSignals: any;
    }>;
    protected getLsigSource(): string;
    protected getAppSpec(): Arc56Contract;
}
declare class Groth16Bls12381AppVerifier extends AppVerifier<Groth16Bls12381VerifierFactory, Groth16Bls12381VerifierWithLogsFactory, Groth16Bls12381VerifierClient, Groth16Bls12381Witness, Groth16Bls12381VerifierDeployParams, Groth16Bls12381VerificationKey$1> {
    constructor(options: AppVerifierOptions<Groth16Bls12381VerificationKey$1>);
    protected newFactory(o: {
        algorand: AlgorandClient$1;
        defaultSender: Address;
    }): Groth16Bls12381VerifierFactory;
    protected newLogsFactory(o: {
        algorand: AlgorandClient$1;
        defaultSender: Address;
    }): Groth16Bls12381VerifierWithLogsFactory;
    protected getVkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<Groth16Bls12381VerificationKey$1>;
    protected encodeVkey(vk: Groth16Bls12381VerificationKey$1, appSpec: Arc56Contract): Uint8Array;
    protected encodeProof(proof: any, curve: any): Groth16Bls12381Proof$2;
    protected fullProve(inputs: snarkjs.CircuitSignals, wasmProver: snarkjs.ZKArtifact, zKey: snarkjs.ZKArtifact): Promise<{
        proof: any;
        publicSignals: any;
    }>;
}
declare function getGroth16Bn254Vkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<Groth16Bn254VerificationKey$1>;
declare function encodeGroth16Bn254Vk(vkey: Groth16Bn254VerificationKey$1, appSpec: Arc56Contract): Uint8Array;
declare function getGroth16Bn254Proof(path: string, curve: any): Promise<Groth16Bn254Proof$2>;
declare function encodeGroth16Bn254Proof(proof: any, curve: any): Groth16Bn254Proof$2;
type Groth16Bn254Witness = {
    proof: Groth16Bn254Proof$2;
    signals: bigint[];
};
declare class Groth16Bn254LsigVerifier extends LsigVerifier<Groth16Bn254VerificationKey$1, Groth16Bn254Witness> {
    constructor(options: LsigVerifierOptions<Groth16Bn254VerificationKey$1>);
    protected getVkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<Groth16Bn254VerificationKey$1>;
    protected encodeVkey(vk: Groth16Bn254VerificationKey$1, appSpec: Arc56Contract): Uint8Array;
    protected encodeProof(proof: any, curve: any): Groth16Bn254Proof$2;
    protected fullProve(inputs: snarkjs.CircuitSignals, wasmProver: snarkjs.ZKArtifact, zKey: snarkjs.ZKArtifact): Promise<{
        proof: any;
        publicSignals: any;
    }>;
    protected getLsigSource(): string;
    protected getAppSpec(): Arc56Contract;
}
declare class Groth16Bn254AppVerifier extends AppVerifier<Groth16Bn254VerifierFactory, Groth16Bn254VerifierWithLogsFactory, Groth16Bn254VerifierClient, Groth16Bn254Witness, Groth16Bn254VerifierDeployParams, Groth16Bn254VerificationKey$1> {
    constructor(options: AppVerifierOptions<Groth16Bn254VerificationKey$1>);
    protected newFactory(o: {
        algorand: AlgorandClient$1;
        defaultSender: Address;
    }): Groth16Bn254VerifierFactory;
    protected newLogsFactory(o: {
        algorand: AlgorandClient$1;
        defaultSender: Address;
    }): Groth16Bn254VerifierWithLogsFactory;
    protected getVkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<Groth16Bn254VerificationKey$1>;
    protected encodeVkey(vk: Groth16Bn254VerificationKey$1, appSpec: Arc56Contract): Uint8Array;
    protected encodeProof(proof: any, curve: any): Groth16Bn254Proof$2;
    protected fullProve(inputs: snarkjs.CircuitSignals, wasmProver: snarkjs.ZKArtifact, zKey: snarkjs.ZKArtifact): Promise<{
        proof: any;
        publicSignals: any;
    }>;
}

type AppVerifierOptions<VerificationKey> = {
    algorand: AlgorandClient$1;
} & ({
    zKey: snarkjs.ZKArtifact;
    wasmProver: snarkjs.ZKArtifact;
} | {
    vk: VerificationKey;
});
declare abstract class AppVerifier<Factory extends Groth16Bls12381VerifierFactory | PlonkVerifierFactory, LogsFactory extends Groth16Bls12381VerifierWithLogsFactory | PlonkVerifierWithLogsFactory, Client extends ReturnType<Factory["getAppClientById"]>, Witness extends {
    signals: any;
    proof: any;
} & Parameters<Client["send"]["verify"]>[0]["args"], DeployTimeParams extends Parameters<Factory["deploy"]>[0], VerificationKey extends ({
    _vk: any;
} & Parameters<Client["send"]["closeOut"]["_dummy"]>[0]["args"])["_vk"]> {
    curveName: "bls12381" | "bn254";
    appClient?: Client;
    curve?: any;
    vk?: VerificationKey;
    algorand: AlgorandClient$1;
    zKey?: snarkjs.ZKArtifact;
    wasmProver?: snarkjs.ZKArtifact;
    constructor(curveName: "bls12381" | "bn254", options: AppVerifierOptions<VerificationKey>);
    protected abstract newFactory(o: {
        algorand: AlgorandClient$1;
        defaultSender: Address;
    }): Factory;
    protected abstract newLogsFactory(o: {
        algorand: AlgorandClient$1;
        defaultSender: Address;
    }): LogsFactory;
    protected abstract getVkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<VerificationKey>;
    protected abstract encodeVkey(vk: VerificationKey, appSpec: Factory["appSpec"]): Uint8Array;
    protected abstract encodeProof(proof: any, curve: any): Witness["proof"];
    protected abstract fullProve(inputs: snarkjs.CircuitSignals, wasmProver: snarkjs.ZKArtifact, zKey: snarkjs.ZKArtifact): Promise<{
        proof: any;
        publicSignals: any;
    }>;
    protected getAdditionalDeployParams(vk: VerificationKey, curve: any): Record<string, any>;
    private ensureCurveInstantiation;
    deploy(params: Omit<DeployTimeParams, "deployTimeParams"> & {
        defaultSender: Address;
        debugLogging?: boolean;
    }): Promise<PlonkVerifierClient | Groth16Bls12381VerifierClient>;
    proofAndSignals(inputs: snarkjs.CircuitSignals): Promise<Witness>;
    private assertDeployed;
    simulateVerificationWithProofAndSignals(proofAndSignals: Witness, simParams?: RawSimulateOptions): Promise<{
        groupId: string;
        txIds: string[];
        returns: _algorandfoundation_algokit_utils_types_app.ABIReturn[] & [void | undefined];
        confirmations: PendingTransactionResponse[];
        transactions: Transaction[];
    } & {
        simulateResponse: SimulateResponse;
    }>;
    verifyTransactionFromProofAndSignals(proofAndSignals: Witness): Promise<Transaction>;
    callVerifyFromProofAndSignals(proofAndSignals: Witness, callParams?: Omit<AppClientMethodCallParams, "method" | "args" | "onComplete">): Promise<{
        return: (undefined | Groth16Bls12381VerifierReturns["verify(uint256[],(byte[96],byte[192],byte[96]))void"]);
        groupId: string;
        txIds: string[];
        returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined | undefined;
        confirmations: PendingTransactionResponse[];
        transactions: Transaction[];
        confirmation: PendingTransactionResponse;
        transaction: Transaction;
    }>;
    simulateVerification(inputs: snarkjs.CircuitSignals, simParams?: RawSimulateOptions): Promise<{
        groupId: string;
        txIds: string[];
        returns: _algorandfoundation_algokit_utils_types_app.ABIReturn[] & [void | undefined];
        confirmations: PendingTransactionResponse[];
        transactions: Transaction[];
    } & {
        simulateResponse: SimulateResponse;
    }>;
    verifyTransaction(inputs: snarkjs.CircuitSignals): Promise<Transaction>;
    callVerify(inputs: snarkjs.CircuitSignals, callParams?: Omit<AppClientMethodCallParams, "method" | "args" | "onComplete">): Promise<{
        return: (undefined | Groth16Bls12381VerifierReturns["verify(uint256[],(byte[96],byte[192],byte[96]))void"]);
        groupId: string;
        txIds: string[];
        returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined | undefined;
        confirmations: PendingTransactionResponse[];
        transactions: Transaction[];
        confirmation: PendingTransactionResponse;
        transaction: Transaction;
    }>;
}
type LsigVerifierOptions<VerificationKey> = AppVerifierOptions<VerificationKey> & {
    /** The number added to the lsig's group index to get the signals and proof from app call index */
    appOffset: number;
    /** The total number of lsigs that will be used to call the app (including the one created by lsigAccount and any extra ones created in verificationParams) */
    totalLsigs: number;
};
type LsigVerificationArgs<Witness extends Record<string, any>> = {
    composer: {
        addTransaction: (txn: Transaction) => unknown;
    };
    addExtraLsigs?: boolean;
    paramsCallback: (params: {
        lsigParams: {
            sender: Address;
            staticFee: AlgoAmount;
        };
        args: {
            signals: Witness["signals"];
            proof: Witness["proof"];
        };
        lsigsFee: AlgoAmount;
        extraLsigsTxns: Transaction[];
    }) => Promise<void>;
} & ({
    inputs: snarkjs.CircuitSignals;
} | {
    proof: Witness["proof"];
    signals: Witness["signals"];
});
declare abstract class LsigVerifier<VerificationKey extends Groth16Bls12381VerificationKey$1 | PlonkVerificationKey$1, Witness extends Groth16Bls12381Witness | PlonkWitness> {
    curveName: "bls12381" | "bn254";
    curve?: any;
    algorand: AlgorandClient$1;
    zKey?: snarkjs.ZKArtifact;
    wasmProver?: snarkjs.ZKArtifact;
    totalLsigs: number;
    vk?: VerificationKey;
    appOffset: number;
    constructor(curveName: "bls12381" | "bn254", options: LsigVerifierOptions<VerificationKey>);
    protected abstract getVkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<VerificationKey>;
    protected abstract encodeVkey(vk: VerificationKey, appSpec: Arc56Contract): Uint8Array;
    protected abstract encodeProof(proof: any, curve: any): Witness["proof"];
    protected abstract fullProve(inputs: snarkjs.CircuitSignals, wasmProver: snarkjs.ZKArtifact, zKey: snarkjs.ZKArtifact): Promise<{
        proof: any;
        publicSignals: any;
    }>;
    protected abstract getLsigSource(): string;
    protected abstract getAppSpec(): Arc56Contract;
    protected getAdditionalTemplateParams(vk: VerificationKey, curve: any): Record<string, any>;
    private ensureCurveInstantiation;
    proofAndSignals(inputs: snarkjs.CircuitSignals): Promise<Witness>;
    lsigAccount(): Promise<Address & _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount & {
        account: algosdk.LogicSigAccount;
    }>;
    verificationParams(args: LsigVerificationArgs<Witness>): Promise<void>;
}

/**
 * Expands types for IntelliSense so they are more human readable
 * See https://stackoverflow.com/a/69288824
 */
type Expand<T> = T extends (...args: infer A) => infer R ? (...args: Expand<A>) => Expand<R> : T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type PlonkProof = {
    a: Uint8Array;
    b: Uint8Array;
    c: Uint8Array;
    z: Uint8Array;
    t1: Uint8Array;
    t2: Uint8Array;
    t3: Uint8Array;
    wxi: Uint8Array;
    wxiw: Uint8Array;
    evalA: bigint;
    evalB: bigint;
    evalC: bigint;
    evalS1: bigint;
    evalS2: bigint;
    evalZw: bigint;
};
/**
 * The argument types for the PlonkSignalsAndProof contract
 */
type PlonkSignalsAndProofArgs = {
    /**
     * The object representation of the arguments for each method
     */
    obj: {
        'signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void': {
            signals: bigint[] | number[];
            proof: PlonkProof;
        };
    };
    /**
     * The tuple representation of the arguments for each method
     */
    tuple: {
        'signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void': [signals: bigint[] | number[], proof: PlonkProof];
    };
};
/**
 * The return type for each method
 */
type PlonkSignalsAndProofReturns = {
    'signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void': void;
};
/**
 * Defines an object containing all relevant parameters for a single call to the contract.
 */
type CallParams<TArgs> = Expand<Omit<AppClientMethodCallParams, 'method' | 'args' | 'onComplete'> & {
    /** The args for the ABI method call, either as an ordered array or an object */
    args: Expand<TArgs>;
}>;
/**
 * Defines supported create method params for this smart contract
 */
type PlonkSignalsAndProofCreateCallParams = Expand<AppClientBareCallParams & {
    method?: never;
} & {
    onComplete?: OnApplicationComplete.NoOpOC;
} & CreateSchema>;
/**
 * Defines arguments required for the deploy method.
 */
type PlonkSignalsAndProofDeployParams = Expand<Omit<AppFactoryDeployParams, 'createParams' | 'updateParams' | 'deleteParams'> & {
    /**
     * Create transaction parameters to use if a create needs to be issued as part of deployment; use `method` to define ABI call (if available) or leave out for a bare call (if available)
     */
    createParams?: PlonkSignalsAndProofCreateCallParams;
}>;
/**
 * A factory to create and deploy one or more instance of the PlonkSignalsAndProof smart contract and to create one or more app clients to interact with those (or other) app instances
 */
declare class PlonkSignalsAndProofFactory {
    /**
     * The underlying `AppFactory` for when you want to have more flexibility
     */
    readonly appFactory: AppFactory;
    /**
     * Creates a new instance of `PlonkSignalsAndProofFactory`
     *
     * @param params The parameters to initialise the app factory with
     */
    constructor(params: Omit<AppFactoryParams, 'appSpec'>);
    /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app factory is using. */
    get algorand(): AlgorandClient;
    /**
     * Returns a new `AppClient` client for an app instance of the given ID.
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientById(params: AppFactoryAppClientParams): PlonkSignalsAndProofClient;
    /**
     * Returns a new `AppClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientByCreatorAndName(params: AppFactoryResolveAppClientByCreatorAndNameParams): Promise<PlonkSignalsAndProofClient>;
    /**
     * Idempotently deploys the PlonkSignalsAndProof smart contract.
     *
     * @param params The arguments for the contract calls and any additional parameters for the call
     * @returns The deployment result
     */
    deploy(params?: PlonkSignalsAndProofDeployParams): Promise<{
        result: {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "create";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "update";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "replace";
            version: string;
            name: string;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
            groupId: string;
            txIds: string[];
            returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            appId: bigint;
            appAddress: Address;
            deleteResult: _algorandfoundation_algokit_utils_types_transaction.ConfirmedTransactionResult;
        } | {
            return: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            deleteReturn: algosdk.ABIValue | _algorandfoundation_algokit_utils_types_app_arc56.ABIStruct | undefined;
            compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
            operationPerformed: "nothing";
            appId: bigint;
            appAddress: Address;
            createdRound: bigint;
            updatedRound: bigint;
            createdMetadata: _algorandfoundation_algokit_utils_types_app.AppDeployMetadata;
            deleted: boolean;
            name: string;
            version: string;
            deletable?: boolean | undefined;
            updatable?: boolean | undefined;
        };
        appClient: PlonkSignalsAndProofClient;
    }>;
    /**
     * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the PlonkSignalsAndProof smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The params for a create call
             */
            bare: (params?: Expand<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                approvalProgram: Uint8Array;
                clearStateProgram: Uint8Array;
                compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                deployTimeParams: _algorandfoundation_algokit_utils_types_app.TealTemplateParams | undefined;
                schema: {
                    globalInts: number;
                    globalByteSlices: number;
                    localInts: number;
                    localByteSlices: number;
                };
                maxFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                note?: string | Uint8Array | undefined;
                args?: Uint8Array[] | undefined;
                signer?: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                rejectVersion?: number | undefined;
                lease?: string | Uint8Array | undefined;
                rekeyTo?: string | Address | undefined;
                staticFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                extraFee?: _algorandfoundation_algokit_utils_types_amount.AlgoAmount | undefined;
                validityWindow?: number | bigint | undefined;
                firstValidRound?: bigint | undefined;
                lastValidRound?: bigint | undefined;
                accountReferences?: (string | Address)[] | undefined;
                appReferences?: bigint[] | undefined;
                assetReferences?: bigint[] | undefined;
                boxReferences?: (_algorandfoundation_algokit_utils_types_app_manager.BoxIdentifier | _algorandfoundation_algokit_utils_types_app_manager.BoxReference)[] | undefined;
                accessReferences?: _algorandfoundation_algokit_utils_types_app_manager.ResourceReference[] | undefined;
                sender?: string | Address | undefined;
                updatable?: boolean | undefined;
                deletable?: boolean | undefined;
                onComplete?: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC | undefined;
                extraProgramPages?: number | undefined;
            } & {
                sender: Address;
                signer: TransactionSigner | _algorandfoundation_algokit_utils_types_account.TransactionSignerAccount | undefined;
                onComplete: OnApplicationComplete.NoOpOC | OnApplicationComplete.OptInOC | OnApplicationComplete.CloseOutOC | OnApplicationComplete.UpdateApplicationOC | OnApplicationComplete.DeleteApplicationOC;
            }>;
        };
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the PlonkSignalsAndProof smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The transaction for a create call
             */
            bare: (params?: Expand<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<Transaction>;
        };
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the PlonkSignalsAndProof smart contract using a bare call.
             *
             * @param params The params for the bare (raw) call
             * @returns The create result
             */
            bare: (params?: Expand<AppClientBareCallParams & AppClientCompilationParams & CreateSchema & SendParams & {
                onComplete?: OnApplicationComplete.NoOpOC;
            }>) => Promise<{
                result: {
                    compiledApproval?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    compiledClear?: _algorandfoundation_algokit_utils_types_app.CompiledTeal | undefined;
                    return: undefined;
                    groupId: string;
                    txIds: string[];
                    returns?: _algorandfoundation_algokit_utils_types_app.ABIReturn[] | undefined;
                    confirmations: modelsv2.PendingTransactionResponse[];
                    transactions: Transaction[];
                    confirmation: modelsv2.PendingTransactionResponse;
                    transaction: Transaction;
                    appId: bigint;
                    appAddress: Address;
                };
                appClient: PlonkSignalsAndProofClient;
            }>;
        };
    };
}
/**
 * A client to make calls to the PlonkSignalsAndProof smart contract
 */
declare class PlonkSignalsAndProofClient {
    /**
     * The underlying `AppClient` for when you want to have more flexibility
     */
    readonly appClient: AppClient;
    /**
     * Creates a new instance of `PlonkSignalsAndProofClient`
     *
     * @param appClient An `AppClient` instance which has been created with the PlonkSignalsAndProof app spec
     */
    constructor(appClient: AppClient);
    /**
     * Creates a new instance of `PlonkSignalsAndProofClient`
     *
     * @param params The parameters to initialise the app client with
     */
    constructor(params: Omit<AppClientParams, 'appSpec'>);
    /**
     * Returns a new `PlonkSignalsAndProofClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     * @param params The parameters to create the app client
     */
    static fromCreatorAndName(params: Omit<ResolveAppClientByCreatorAndName, 'appSpec'>): Promise<PlonkSignalsAndProofClient>;
    /**
     * Returns an `PlonkSignalsAndProofClient` instance for the current network based on
     * pre-determined network-specific app IDs specified in the ARC-56 app spec.
     *
     * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
     * @param params The parameters to create the app client
     */
    static fromNetwork(params: Omit<ResolveAppClientByNetwork, 'appSpec'>): Promise<PlonkSignalsAndProofClient>;
    /** The ID of the app instance this client is linked to. */
    get appId(): bigint;
    /** The app address of the app instance this client is linked to. */
    get appAddress(): Address;
    /** The name of the app. */
    get appName(): string;
    /** The ARC-56 app spec being used */
    get appSpec(): Arc56Contract;
    /** A reference to the underlying `AlgorandClient` this app client is using. */
    get algorand(): AlgorandClient;
    /**
     * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    readonly params: {
        /**
         * Makes a clear_state call to an existing instance of the PlonkSignalsAndProof smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand<AppClientBareCallParams>) => _algorandfoundation_algokit_utils_types_composer.AppCallParams;
        /**
         * Makes a call to the PlonkSignalsAndProof smart contract using the `signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        signalsAndProof: (params: CallParams<PlonkSignalsAndProofArgs["obj"]["signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"] | PlonkSignalsAndProofArgs["tuple"]["signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<AppCallMethodCall>;
    };
    /**
     * Create transactions for the current app
     */
    readonly createTransaction: {
        /**
         * Makes a clear_state call to an existing instance of the PlonkSignalsAndProof smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand<AppClientBareCallParams>) => Promise<Transaction>;
        /**
         * Makes a call to the PlonkSignalsAndProof smart contract using the `signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        signalsAndProof: (params: CallParams<PlonkSignalsAndProofArgs["obj"]["signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"] | PlonkSignalsAndProofArgs["tuple"]["signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]> & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            transactions: Transaction[];
            methodCalls: Map<number, algosdk.ABIMethod>;
            signers: Map<number, TransactionSigner>;
        }>;
    };
    /**
     * Send calls to the current app
     */
    readonly send: {
        /**
         * Makes a clear_state call to an existing instance of the PlonkSignalsAndProof smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params?: Expand<AppClientBareCallParams & SendParams>) => Promise<{
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
            return?: ABIReturn | undefined;
        }>;
        /**
         * Makes a call to the PlonkSignalsAndProof smart contract using the `signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        signalsAndProof: (params: CallParams<PlonkSignalsAndProofArgs["obj"]["signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"] | PlonkSignalsAndProofArgs["tuple"]["signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]> & SendParams & {
            onComplete?: OnApplicationComplete.NoOpOC;
        }) => Promise<{
            return: (undefined | PlonkSignalsAndProofReturns["signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void"]);
            groupId: string;
            txIds: string[];
            returns?: ABIReturn[] | undefined | undefined;
            confirmations: modelsv2.PendingTransactionResponse[];
            transactions: Transaction[];
            confirmation: modelsv2.PendingTransactionResponse;
            transaction: Transaction;
        }>;
    };
    /**
     * Clone this app client with different params
     *
     * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
     * @returns A new app client with the altered params
     */
    clone(params: CloneAppClientParams): PlonkSignalsAndProofClient;
    /**
     * Methods to access state for the current PlonkSignalsAndProof app
     */
    state: {};
    newGroup(): PlonkSignalsAndProofComposer;
}
type PlonkSignalsAndProofComposer<TReturns extends [...any[]] = []> = {
    /**
     * Calls the signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void ABI method.
     *
     * @param args The arguments for the contract call
     * @param params Any additional parameters for the call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    signalsAndProof(params?: CallParams<PlonkSignalsAndProofArgs['obj']['signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void'] | PlonkSignalsAndProofArgs['tuple']['signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void']>): PlonkSignalsAndProofComposer<[...TReturns, PlonkSignalsAndProofReturns['signalsAndProof(uint256[],(byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],byte[96],uint256,uint256,uint256,uint256,uint256,uint256))void'] | undefined]>;
    /**
     * Makes a clear_state call to an existing instance of the PlonkSignalsAndProof smart contract.
     *
     * @param args The arguments for the bare call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    clearState(params?: AppClientBareCallParams): PlonkSignalsAndProofComposer<[...TReturns, undefined]>;
    /**
     * Adds a transaction to the composer
     *
     * @param txn A transaction to add to the transaction group
     * @param signer The optional signer to use when signing this transaction.
     */
    addTransaction(txn: Transaction, signer?: TransactionSigner): PlonkSignalsAndProofComposer<TReturns>;
    /**
     * Returns the underlying AtomicTransactionComposer instance
     */
    composer(): Promise<TransactionComposer>;
    /**
     * Simulates the transaction group and returns the result
     */
    simulate(): Promise<PlonkSignalsAndProofComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: SkipSignaturesSimulateOptions): Promise<PlonkSignalsAndProofComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    simulate(options: RawSimulateOptions): Promise<PlonkSignalsAndProofComposerResults<TReturns> & {
        simulateResponse: modelsv2.SimulateResponse;
    }>;
    /**
     * Sends the transaction group to the network and returns the results
     */
    send(params?: SendParams): Promise<PlonkSignalsAndProofComposerResults<TReturns>>;
};
type PlonkSignalsAndProofComposerResults<TReturns extends [...any[]]> = Expand<SendAtomicTransactionComposerResults & {
    returns: TReturns;
}>;

declare function getPlonkVkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<PlonkVerificationKey$1>;
declare function encodePlonkVk(vkey: PlonkVerificationKey$1, appSpec: Arc56Contract): Uint8Array;
declare function getPlonkProof(path: string, curve: any): Promise<PlonkProof$2>;
declare function encodePlonkProof(proof: any, curve: any): PlonkProof$2;
declare function encodePlonkSignals(...inputs: string[]): bigint[];
type PlonkWitness = {
    proof: PlonkProof$2;
    signals: bigint[];
};
declare class PlonkLsigVerifier extends LsigVerifier<PlonkVerificationKey$1, PlonkWitness> {
    constructor(o: LsigVerifierOptions<PlonkVerificationKey$1>);
    protected getVkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<PlonkVerificationKey$1>;
    protected encodeVkey(vk: PlonkVerificationKey$1, appSpec: Arc56Contract): Uint8Array;
    protected encodeProof(proof: any, curve: any): PlonkProof$2;
    protected encodeSignals(...signals: string[]): bigint[];
    protected fullProve(inputs: snarkjs.CircuitSignals, wasmProver: snarkjs.ZKArtifact, zKey: snarkjs.ZKArtifact): Promise<{
        proof: any;
        publicSignals: any;
    }>;
    protected getLsigSource(): string;
    protected getAppSpec(): Arc56Contract;
    protected getAdditionalTemplateParams(vk: PlonkVerificationKey$1, curve: any): Record<string, any>;
}
declare class PlonkAppVerifier extends AppVerifier<PlonkVerifierFactory, PlonkVerifierWithLogsFactory, PlonkVerifierClient, PlonkWitness, PlonkVerifierDeployParams, PlonkVerificationKey$1> {
    constructor(o: AppVerifierOptions<PlonkVerificationKey$1>);
    protected newFactory(o: {
        algorand: AlgorandClient$1;
        defaultSender: Address;
    }): PlonkVerifierFactory;
    protected newLogsFactory(o: {
        algorand: AlgorandClient$1;
        defaultSender: Address;
    }): PlonkVerifierWithLogsFactory;
    protected getVkey(zKey: snarkjs.ZKArtifact, curve: any): Promise<PlonkVerificationKey$1>;
    protected encodeVkey(vk: PlonkVerificationKey$1, appSpec: Arc56Contract): Uint8Array;
    protected encodeProof(proof: any, curve: any): PlonkProof$2;
    protected fullProve(inputs: snarkjs.CircuitSignals, wasmProver: snarkjs.ZKArtifact, zKey: snarkjs.ZKArtifact): Promise<{
        proof: any;
        publicSignals: any;
    }>;
    protected getAdditionalDeployParams(vk: PlonkVerificationKey$1, curve: any): Record<string, any>;
}

declare function decodeGnarkGroth16Bn254Proof(encodedProof: Uint8Array): Groth16Bn254Proof$2;
declare function decodeGnarkGroth16Bn254Vk(vkBytes: Uint8Array): Groth16Bn254VerificationKey$1;

export { Groth16Bls12381AppVerifier, Groth16Bls12381LsigVerifier, type Groth16Bls12381Proof$2 as Groth16Bls12381Proof, Groth16Bls12381SignalsAndProofClient, Groth16Bls12381SignalsAndProofFactory, type Groth16Bls12381VerificationKey$1 as Groth16Bls12381VerificationKey, Groth16Bls12381VerifierClient, type Groth16Bls12381VerifierDeployParams, type Groth16Bls12381Witness, Groth16Bn254AppVerifier, Groth16Bn254LsigVerifier, type Groth16Bn254Proof$2 as Groth16Bn254Proof, Groth16Bn254SignalsAndProofClient, Groth16Bn254SignalsAndProofFactory, type Groth16Bn254VerificationKey$1 as Groth16Bn254VerificationKey, Groth16Bn254VerifierClient, type Groth16Bn254VerifierDeployParams, type Groth16Bn254Witness, PlonkAppVerifier, PlonkLsigVerifier, type PlonkProof$2 as PlonkProof, PlonkSignalsAndProofClient, PlonkSignalsAndProofFactory, type PlonkVerificationKey$1 as PlonkVerificationKey, PlonkVerifierClient, type PlonkVerifierDeployParams, type PlonkWitness, decodeGnarkGroth16Bn254Proof, decodeGnarkGroth16Bn254Vk, encodeGroth16Bls12381Proof, encodeGroth16Bls12381Vk, encodeGroth16Bn254Proof, encodeGroth16Bn254Vk, encodePlonkProof, encodePlonkSignals, encodePlonkVk, getGroth16Bls12381Proof, getGroth16Bls12381Vkey, getGroth16Bn254Proof, getGroth16Bn254Vkey, getPlonkProof, getPlonkVkey, stringValuesToBigints };
