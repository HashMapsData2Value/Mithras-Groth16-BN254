// These methods are used by both Mithras Contracts and Circuits package 
// and the Mithras Crypto package, so they have been moved to this new package 
// to avoid circular dependencies.

// const BLS12_381_SCALAR_MODULUS = BigUint(
//   "0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001",
// );
const BN254_SCALAR_MODULUS = BigInt(
  "0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001",
)

export function addressInScalarField(addr: Uint8Array): bigint {
  const asBigint = BigInt("0x" + Buffer.from(addr).toString("hex"));
  // return asBigint % BLS12_381_SCALAR_MODULUS;
  return asBigint % BN254_SCALAR_MODULUS;
}

export const TREE_DEPTH = 16;