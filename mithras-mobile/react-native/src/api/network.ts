import Config from 'react-native-config';
import { storage } from '../services/storage';

import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { Algodv2, Indexer } from 'algosdk';

export const enum DefaultNetwork {
  Mainnet,
  Testnet,
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
  if (network == 'custom') {
    const algodUrl = storage.getString('algodUrl');
    const algodToken = storage.getString('algodToken');
    const algodPort = storage.getString('algodPort');
    const indexerUrl = storage.getString('indexerUrl');
    const indexerToken = storage.getString('indexerToken');
    const indexerPort = storage.getString('indexerPort');

    try {
      const algod = new Algodv2(algodToken!, algodUrl!, algodPort!);
      const indexer = new Indexer(indexerToken!, indexerUrl!, indexerPort!);
      algorandClient = AlgorandClient.fromClients({ algod, indexer });
    } catch (e) {
      console.warn('Error configuring custom network:', e);
      return false;
    }
  }

  try {
    const mithras = await algorandClient!.app.getById(BigInt(mithrasAppId!));
    console.log('mithras:', mithras)
    console.log('mithras app address:', mithras.appAddress)
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
  network: 'mainnet' | 'testnet' | 'custom',
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
      const algod = new Algodv2(config?.algodToken || '', config?.algodUrl || '', config?.algodPort || '');
      const indexer = new Indexer(config?.indexerToken || '', config?.indexerUrl || '', config?.indexerPort || '');
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

export default {
  setDefaultNetwork,
  setCustomNetwork,
  validateSetNetwork,
};
