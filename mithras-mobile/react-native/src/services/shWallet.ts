import { MithrasAddr } from "mithras-crypto";
import { ed25519, x25519 } from "@noble/curves/ed25519.js";
import { derivePrivateNodeKeyMaterial } from "./hdWallet";
import { storage } from "./storage";

enum KeyAccountContext {
  SpendKey = 1,
  ViewKey = 2,
}

export async function getShieldedSpendPublicKey(index: number): Promise<Uint8Array> {
  const seedMaterial = await derivePrivateNodeKeyMaterial(index, KeyAccountContext.SpendKey);
  return ed25519.getPublicKey(seedMaterial);
}

export async function getShieldedViewKeypair(index: number): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
  const seedMaterial = await derivePrivateNodeKeyMaterial(index, KeyAccountContext.ViewKey);
  // Convert an Ed25519 seed into an X25519 keypair (libsodium-compatible conversion).
  const privateKey = ed25519.utils.toMontgomerySecret(seedMaterial);
  const publicKey = x25519.getPublicKey(privateKey);
  return { privateKey, publicKey };
}

export const genShieldedAddress = async (index: number) => {

  // We dedicate accounts 1 and 2 to spend and view keys respectively.
  // Spend key is Ed25519; view key is X25519.
  const spendPublicKey = await getShieldedSpendPublicKey(index);
  const viewKeypair = await getShieldedViewKeypair(index);

  const newMithrasAddr = MithrasAddr.fromKeys(
    spendPublicKey, // m/44'/283'/1'/0/index (ed25519 pub)
    viewKeypair.publicKey, // m/44'/283'/2'/0/index (x25519 pub)
    1,
    1,
    1,
  );
  return { newMithrasAddr };
}

export const createShieldedAddr = async (index: number) => {
  const { newMithrasAddr } = await genShieldedAddress(index);
  // Store the new address in local storage for later retrieval.
  const key = "shAddress:m/44'/283'/{1,2}/0/" + index;
  storage.set(key, newMithrasAddr.encode());
  return { key, address: newMithrasAddr.encode() };
}

export const addShieldedAddr = async () => {
  // Calculate the next index based on existing keys.
  const prefix = "shAddress:m/44'/283'/{1,2}/0/";
  const keys = storage.getAllKeys().filter(k => k.startsWith(prefix));
  const indices = keys
    .map(k => {
      const suffix = k.slice(prefix.length);
      const n = Number(suffix);
      return Number.isFinite(n) ? n : NaN;
    })
    .filter(n => Number.isFinite(n));

  const maxIndex = indices.length > 0 ? Math.max(...indices) : -1;
  const nextIndex = maxIndex + 1;

  // Generate and store the new shielded address.
  return await createShieldedAddr(nextIndex);
}

export async function getShieldedAddresses(): Promise<string[]> {
  const prefix = "shAddress:m/44'/283'/{1,2}/0/";
  const foundAddresses = storage
    .getAllKeys()
    .filter(k => k.startsWith(prefix))
    .map(k => storage.getString(k))
    .filter((addr): addr is string => typeof addr === "string");

  return foundAddresses;
}

export async function getShieldedAddressEntries(): Promise<Array<{ index: number; address: string }>> {
  const prefix = "shAddress:m/44'/283'/{1,2}/0/";
  const keys = storage.getAllKeys().filter(k => k.startsWith(prefix));

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

export async function getDefaultShieldedAddress(): Promise<{ index: number; address: MithrasAddr }> {
  const prefix = "shAddress:m/44'/283'/{1,2}/0/";
  const keys = storage.getAllKeys().filter(k => k.startsWith(prefix));
  const indices = keys
    .map(k => {
      const suffix = k.slice(prefix.length);
      const n = Number(suffix);
      return Number.isFinite(n) ? n : NaN;
    })
    .filter(n => Number.isFinite(n));

  const index = indices.length > 0 ? Math.min(...indices) : 0;
  const encoded = storage.getString(`${prefix}${index}`);
  if (encoded) {
    return { index, address: MithrasAddr.decode(encoded) };
  }

  // None stored yet: create index 0.
  const { newMithrasAddr } = await genShieldedAddress(index);
  const key = `${prefix}${index}`;
  storage.set(key, newMithrasAddr.encode());
  return { index, address: newMithrasAddr };
}