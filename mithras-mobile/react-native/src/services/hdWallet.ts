import { fromSeed, XHDWalletAPI, KeyContext, BIP32DerivationType } from '@algorandfoundation/xhd-wallet-api';
import { mnemonicToSeed } from './mnemonics';
import { getMnemonic } from './secureStorage';
import { base32 } from '@scure/base';
import { sha512_256 } from '@noble/hashes/sha2.js';
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

function hardenBip32Index(n: number): number {
  return 0x80000000 + n;
}

function bip44PathForAlgorandAddress(account: number, index: number): number[] {
  // m/44'/283'/account'/0/index
  return [hardenBip32Index(44), hardenBip32Index(283), hardenBip32Index(account), 0, index];
}

// Account is default 0 for Public Addresses
// Account is 1 for SpendKeys and 2 for ViewKeys of Shielded Addresses
export async function getPublicKey(index: number, account = 0): Promise<Uint8Array> {
  const wallet = getWallet();
  const seed = await getSeed();
  const rootKey = fromSeed(seed);
  return wallet.keyGen(rootKey, KeyContext.Address, account, index);
}

/**
 * Derive the raw private node key material for the given BIP44 path.
 *
 * `xhd-wallet-api` returns a 96-byte extended private key: (kL || kR || chainCode).
 * We return only the first 32 bytes (kL) as deterministic key material.
 */
export async function derivePrivateNodeKeyMaterial(index: number, account = 0): Promise<Uint8Array> {
  const wallet = getWallet();
  const seed = await getSeed();
  const rootKey = fromSeed(seed);

  const path = bip44PathForAlgorandAddress(account, index);
  const extended = await wallet.deriveKey(rootKey, path, true, BIP32DerivationType.Peikert);
  return extended.slice(0, 32);
}

export function encodeAddress(publicKey: Uint8Array): string {
  const hash = sha512_256(publicKey); // 32 bytes
  const checksum = hash.slice(-4); // last 4 bytes
  const addressBytes = new Uint8Array([...publicKey, ...checksum]);
  return base32.encode(addressBytes).replace(/=+$/, '').toUpperCase();
}

export function truncAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

// Account is default 0 for Public Addresses
// Account is 1 for SpendKeys and 2 for ViewKeys of Shielded Addresses
export async function sign(index: number, account = 0, txn: Uint8Array): Promise<Uint8Array> {
  const wallet = getWallet();
  const seed = await getSeed();
  const rootKey = fromSeed(seed);
  return wallet.signAlgoTransaction(rootKey, KeyContext.Address, account, index, txn);
}

export async function scanAddresses(onProgress?: (index: number, address: string) => void): Promise<string[]> {
  let address: string;
  let index = 0;
  const gapLimit = 20;
  let emptyAddresses = 0;
  const foundAddresses: string[] = [];

  const algorandClient = await getAlgorandClient();

  while (emptyAddresses < gapLimit) {
    address = encodeAddress(await getPublicKey(index));
    try {
      onProgress?.(index, address);
    } catch (e) {
      console.warn('Error in onProgress callback:', e);
    }

    try {
      const info: any = await algorandClient.client.algod.accountInformation(address);
      const funds = Number(info?.amount ?? 0);
      if (funds > 0) {
        storage.set(`address:m/44'/283'/0'/0/${index}`, address);
        foundAddresses.push(address);
        emptyAddresses = 0;
      } else {
        emptyAddresses++;
      }
    } catch (algErr) {
      console.warn(`Algod lookup failed for ${address} @ index ${index}:`, algErr);
      emptyAddresses++;
    }

    index++;
  }

  // If no addresses found, the mnemonic is fresh — store index 0 so the app has a default.
  if (foundAddresses.length === 0) {
    try {
      const addr0 = encodeAddress(await getPublicKey(0));
      storage.set(`address:m/44'/283'/0'/0/0`, addr0);
      foundAddresses.push(addr0);
      console.log('No addresses found; stored default address 0:', addr0);
    } catch (e) {
      console.warn('Failed to derive/store default address 0 after empty scan:', e);
    }
  }

  return foundAddresses;
}

/**
 * Return stored public addresses only (no network calls).
 */
export async function getPublicAddresses(): Promise<string[]> {
  const addresses = storage
    .getAllKeys()
    .filter((k) => k.startsWith('address:'))
    .map((k) => storage.getString(k))
    .filter((a): a is string => !!a);

  return addresses;
}

/**
 * Return stored public addresses with their derivation index.
 */
export async function getPublicAddressEntries(): Promise<Array<{ index: number; address: string }>> {
  const prefix = "address:m/44'/283'/0'/0/";
  const keys = storage.getAllKeys().filter((k) => k.startsWith(prefix));

  const entries: Array<{ index: number; address: string }> = [];
  for (const key of keys) {
    const suffix = key.slice(prefix.length);
    const index = Number(suffix);
    if (!Number.isFinite(index)) continue;
    const address = storage.getString(key);
    if (!address) continue;
    entries.push({ index, address });
  }

  entries.sort((a, b) => a.index - b.index);
  return entries;
}

export async function addNextAddress(): Promise<{ key: string; address: string } | null> {
  try {
    const prefix = "address:m/44'/283'/0'/0/";
    const keys = storage.getAllKeys().filter((k) => k.startsWith(prefix));
    const indices = keys
      .map((k) => {
        const suffix = k.slice(prefix.length);
        const n = Number(suffix);
        return Number.isFinite(n) ? n : NaN;
      })
      .filter((n) => Number.isFinite(n));

    const maxIndex = indices.length > 0 ? Math.max(...indices) : -1;
    const next = maxIndex + 1;

    const pk = await getPublicKey(next);
    const addr = encodeAddress(pk);
    const key = `${prefix}${next}`;
    storage.set(key, addr);
    return { key, address: addr };
  } catch (e) {
    console.warn('addNextAddress failed', e);
    return null;
  }
}

/**
 * Return the next derivation index for stored address keys (synchronous).
 */
export function getNextAddressIndex(): number {
  const prefix = "address:m/44'/283'/0'/0/";
  const keys = storage.getAllKeys().filter((k) => k.startsWith(prefix));
  const indices = keys
    .map((k) => {
      const suffix = k.slice(prefix.length);
      const n = Number(suffix);
      return Number.isFinite(n) ? n : NaN;
    })
    .filter((n) => Number.isFinite(n));

  const maxIndex = indices.length > 0 ? Math.max(...indices) : -1;
  return maxIndex + 1;
}
