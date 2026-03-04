import Config from 'react-native-config';
import { storage } from '../services/storage';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { MithrasClient } from 'mithras-contracts-and-circuits/contracts/clients/Mithras';
import algosdk from 'algosdk';

export const enum DefaultNetwork {
  Mainnet,
  Testnet,
  Localnet
}

export function setDefaultNetwork(network: DefaultNetwork) {
  switch (network) {
    case DefaultNetwork.Mainnet:
      storage.set('network', 'mainnet');
      storage.set('mithrasAppId', Config.MAINNET_MITHRAS_APP_ID || '');
      break;

    case DefaultNetwork.Testnet:
      storage.set('network', 'testnet');
      storage.set('mithrasAppId', Config.TESTNET_MITHRAS_APP_ID || '');
      break;

    case DefaultNetwork.Localnet:
      storage.set('network', 'localnet');
      storage.set('mithrasAppId', Config.LOCALNET_MITHRAS_APP_ID || '');
      break;

    default:
      console.error('Invalid network selection');
      break;
  }
}


export function setCustomNetwork(config: {
  algodUrl: string;
  algodToken: string;
  algodPort: string;
  indexerUrl: string;
  indexerToken: string;
  indexerPort: string;
  mithrasAppId: string;
}) {
  storage.set('network', 'custom');
  storage.set('algodUrl', config.algodUrl);
  storage.set('algodToken', config.algodToken);
  storage.set('algodPort', config.algodPort);
  storage.set('indexerUrl', config.indexerUrl);
  storage.set('indexerToken', config.indexerToken);
  storage.set('indexerPort', config.indexerPort);
  storage.set('mithrasAppId', config.mithrasAppId);
}

export async function validateSetNetwork(): Promise<Boolean> {

  const mithrasAppId = storage.getString('mithrasAppId');

  if (!mithrasAppId) {
    console.warn('No Mithras App ID set for current network');
    return false;
  }


  let algorandClient: AlgorandClient
  const network = storage.getString('network')

  if (network == 'mainnet') { algorandClient = AlgorandClient.mainNet(); }
  if (network == 'testnet') { algorandClient = AlgorandClient.testNet(); }
  if (network == 'localnet') { algorandClient = AlgorandClient.defaultLocalNet(); }
  if (network == 'custom') {
    const algodUrl = storage.getString('algodUrl');
    const algodToken = storage.getString('algodToken');
    const algodPort = storage.getString('algodPort');
    const indexerUrl = storage.getString('indexerUrl');
    const indexerToken = storage.getString('indexerToken');
    const indexerPort = storage.getString('indexerPort');

    if (!algodUrl || algodUrl.trim().length === 0) {
      console.warn('Custom network missing algodUrl');
      return false;
    }
    if (algodToken === undefined || algodPort === undefined) {
      console.warn('Custom network missing algodToken/algodPort');
      return false;
    }
    if (!indexerUrl || indexerUrl.trim().length === 0) {
      console.warn('Custom network missing indexerUrl');
      return false;
    }
    if (indexerToken === undefined || indexerPort === undefined) {
      console.warn('Custom network missing indexerToken/indexerPort');
      return false;
    }

    try {
      const algod = new algosdk.Algodv2(algodToken, algodUrl, algodPort);
      const indexer = new algosdk.Indexer(indexerToken, indexerUrl, indexerPort);
      algorandClient = AlgorandClient.fromClients({ algod, indexer });
    } catch (e) {
      console.warn('Error configuring custom network:', e);
      return false;
    }
  }

  try {
    const mithras = await algorandClient!.app.getById(BigInt(mithrasAppId!));
    if (!mithras || !mithras.appAddress) {
      console.warn('Invalid Mithras App ID on selected network');
      return false;
    }
  } catch (e) {
    console.warn('Error validating Mithras App ID on selected network:', e);
    return false;
  }

  // AlgorandClient/Network is valid and Mithras Exists
  return true;
}

export async function validateNetworkConfig(
  network: 'mainnet' | 'testnet' | 'localnet' | 'custom',
  config?: {
    algodUrl?: string;
    algodToken?: string;
    algodPort?: string;
    indexerUrl?: string;
    indexerToken?: string;
    indexerPort?: string;
    mithrasAppId?: string;
  }
): Promise<Boolean> {
  // Determine mithrasAppId for default networks from env
  let mithrasAppId: string | undefined = undefined;
  if (network === 'mainnet') mithrasAppId = Config.MAINNET_MITHRAS_APP_ID;
  if (network === 'testnet') mithrasAppId = Config.TESTNET_MITHRAS_APP_ID;
  if (network === 'localnet') mithrasAppId = Config.LOCALNET_MITHRAS_APP_ID;
  if (network === 'custom') mithrasAppId = config?.mithrasAppId;

  if (!mithrasAppId) {
    console.warn('No Mithras App ID provided for network validation');
    return false;
  }

  let algorandClient: AlgorandClient | undefined;
  if (network === 'mainnet') {
    algorandClient = AlgorandClient.mainNet();
  } else if (network === 'testnet') {
    algorandClient = AlgorandClient.testNet();
  } else if (network === 'custom') {
    try {
      if (!config?.algodUrl || config.algodToken === undefined || config.algodPort === undefined) {
        console.warn('Custom network validation missing algod config');
        return false;
      }
      if (!config?.indexerUrl || config.indexerToken === undefined || config.indexerPort === undefined) {
        console.warn('Custom network validation missing indexer config');
        return false;
      }
      const algod = new algosdk.Algodv2(config.algodToken, config.algodUrl, config.algodPort);
      const indexer = new algosdk.Indexer(config.indexerToken, config.indexerUrl, config.indexerPort);
      algorandClient = AlgorandClient.fromClients({ algod, indexer });
    } catch (e) {
      console.warn('Error configuring custom network for validation:', e);
      return false;
    }
  }

  try {
    const mithras = await algorandClient!.app.getById(BigInt(mithrasAppId!));
    if (!mithras || !mithras.appAddress) {
      console.warn('Invalid Mithras App ID on selected network');
      return false;
    }
  } catch (e) {
    console.warn('Error validating Mithras App ID on selected network:', e);
    return false;
  }

  return true;
}

/**
 * This must only be called AFTER validateSetNetwork has been called 
 * at least once to ensure the network config is valid
 */
export async function getAlgorandClient(): Promise<AlgorandClient> {
  const network = storage.getString('network');

  if (network === 'mainnet') {
    return AlgorandClient.mainNet();
  }
  if (network === 'testnet') {
    return AlgorandClient.testNet();
  }
  if (network === 'localnet') {
    return AlgorandClient.defaultLocalNet();
  }
  if (network === 'custom') {
    const algodUrl = storage.getString('algodUrl');
    const algodToken = storage.getString('algodToken');
    const algodPort = storage.getString('algodPort');
    const indexerUrl = storage.getString('indexerUrl');
    const indexerToken = storage.getString('indexerToken');
    const indexerPort = storage.getString('indexerPort');

    if (!algodUrl || algodToken === undefined || algodPort === undefined) {
      throw new Error('Custom network missing algodUrl/algodToken/algodPort');
    }
    if (!indexerUrl || indexerToken === undefined || indexerPort === undefined) {
      throw new Error('Custom network missing indexerUrl/indexerToken/indexerPort');
    }

    const algod = new algosdk.Algodv2(algodToken, algodUrl, algodPort);
    const indexer = new algosdk.Indexer(indexerToken, indexerUrl, indexerPort);
    return AlgorandClient.fromClients({ algod, indexer });
  }

  throw new Error('Invalid network configuration');
}

/**
 * Fetch balance (microAlgos) for a single address.
 */
export async function getBalanceForAddress(address: string): Promise<number> {
  const algorandClient = await getAlgorandClient();
  try {
    const info = await algorandClient.client.algod.accountInformation(address).do();
    console.log("info:", info);
    const funds = (info as any)?.amount ?? 0;
    return Number(funds) || 0;
  } catch (e) {
    console.warn(`Error fetching balance for address ${address}:`, e);
    return 0;
  }
}

// Simple check to see if a valid network is configured
// If false, we need to prompt the user to set one up.
export function hasNetwork(): boolean {
  const network = storage.getString('network');
  return network === 'mainnet' || network === 'testnet' || network === 'localnet' || network === 'custom';
}


// Get the typed Mithras Client for the currently configured network and Mithras app ID.
export const getMithrasClient = async (): Promise<MithrasClient> => {
  const algorandClient = await getAlgorandClient()
  const mithrasAppId = storage.getString('mithrasAppId');
  if (!mithrasAppId) {
    throw new Error('Mithras App ID not set in storage');
  }
  return algorandClient.client.getTypedAppClientById(MithrasClient, {
    appId: BigInt(mithrasAppId),
  });

}