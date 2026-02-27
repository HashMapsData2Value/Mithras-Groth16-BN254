import { fromSeed, XHDWalletAPI, KeyContext } from '@algorandfoundation/xhd-wallet-api';
import { mnemonicToSeed } from './mnemonics';
import { getMnemonic } from './secureStorage';
import { base32 } from '@scure/base'
import { sha512_256 } from '@noble/hashes/sha2.js'
import { getAlgorandClient } from '../blockchain/network';
import { storage } from './storage';

async function getSeed(): Promise<Uint8Array> {
  const mnemonic = await getMnemonic();
  if (!mnemonic) {
    throw new Error('No mnemonic found in storage');
  }
  return mnemonicToSeed(mnemonic);
}

function getWallet(): XHDWalletAPI {
  return new XHDWalletAPI();
}

export async function getPublicKey(index: number): Promise<Uint8Array> {
  const wallet = getWallet();
  const seed = await getSeed();
  const rootKey = fromSeed(seed);
  return wallet.keyGen(rootKey, KeyContext.Address, 0, index)
}

export function encodeAddress(publicKey: Uint8Array): string {
  const hash = sha512_256(publicKey) // 32 bytes
  const checksum = hash.slice(-4) // last 4 bytes
  const addressBytes = new Uint8Array([...publicKey, ...checksum])
  return base32.encode(addressBytes).replace(/=+$/, '').toUpperCase()
}

export function truncAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

export async function sign(index: number, txn: Uint8Array): Promise<Uint8Array> {
  const wallet = getWallet();
  const seed = await getSeed();
  const rootKey = fromSeed(seed);
  return wallet.signAlgoTransaction(rootKey, KeyContext.Address, 0, index, txn);
}

export async function scanAddresses(onProgress?: (index: number, address: string) => void): Promise<string[]> {
  let address: string
  let index = 0;
  const gapLimit = 20;
  let emptyAddresses = 0;
  const foundAddresses: string[] = [];

  const algorandClient = await getAlgorandClient();

  while (emptyAddresses < gapLimit) {
    address = encodeAddress(await getPublicKey(index));
    try {
      if (onProgress) onProgress(index, address);
    } catch (e) {
      console.warn('Error in onProgress callback:', e);
    }
    try {
      try {
        const info = await algorandClient.client.algod.accountInformation(address).do();
        const funds = info.amount || 0;
        if (funds > 0) {
          storage.set(`address:m/44/283'/0'/0/${index}`, address);
          foundAddresses.push(address);
          emptyAddresses = 0; // reset gap counter
        } else {
          emptyAddresses++;
        }
      } catch (algErr) {
        console.warn(`Algod lookup failed for ${address} @ index ${index}:`, algErr);
        emptyAddresses++;
      }
    } catch (e) {
      console.warn(`Account lookup error for ${address} @ index ${index}:`, e);
      emptyAddresses++;
    }
    index++;
    // small delay to avoid hitting indexer rate limits
    await new Promise((r) => setTimeout(r, 160));
  }

  console.log('Address scan complete, found:', foundAddresses.length, 'addresses');
  // If no addresses found, the mnemonic is fresh — store the index 0 address so the app has a default
  if (foundAddresses.length === 0) {
    try {
      const addr0 = encodeAddress(await getPublicKey(0));
      storage.set(`address:m/44/283'/0'/0/0`, addr0);
      foundAddresses.push(addr0);
      console.log('No addresses found; stored default address 0:', addr0);
    } catch (e) {
      console.warn('Failed to derive/store default address 0 after empty scan:', e);
    }
  }

  return foundAddresses;
}

