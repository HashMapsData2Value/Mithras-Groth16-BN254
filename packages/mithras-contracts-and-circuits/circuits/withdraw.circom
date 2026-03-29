pragma circom 2.1.8;

include "./mimc.circom";
include "./merkle_path_verify.circom";

// Default tree depth to 32 (matches MerklePathVerify main)
template Withdraw(DEPTH) {
    // Public outputs
    signal output utxo_root;
    signal output utxo_nullifier;
    signal output withdraw_tag;

    // Public inputs
    signal input withdraw_amount;
    signal input fee;
    signal input utxo_spender; // P' (receiver of UTXO)
    signal input withdraw_receiver;

    // Private inputs
    signal input utxo_spending_secret;
    signal input utxo_nullifier_secret;
    signal input utxo_amount;

    signal input path_selectors[DEPTH];
    signal input utxo_path[DEPTH];

    // Compute the UTXO commitment leaf (same as Deposit/Spend)
    component H_utxo = MiMC_Sum(4);
    H_utxo.msgs[0] <== utxo_spending_secret;
    H_utxo.msgs[1] <== utxo_nullifier_secret;
    H_utxo.msgs[2] <== utxo_amount;
    H_utxo.msgs[3] <== utxo_spender;

    signal utxo_commitment;
    utxo_commitment <== H_utxo.out;

    // Verify Merkle path; expose derived root
    component mpv = MerklePathVerify(DEPTH);
    mpv.leaf <== utxo_commitment;
    for (var i = 0; i < DEPTH; i++) {
        mpv.pathElements[i] <== utxo_path[i];
        mpv.pathSelectors[i] <== path_selectors[i];
    }
    utxo_root <== mpv.root;

    // Withdrawal constraint: withdraw_amount + fee exhausts the note
    signal total;
    total <== withdraw_amount + fee;
    total === utxo_amount;

    // Compute nullifier for spent UTXO (same as Spend)
    component H_null = MiMC_Sum(2);
    H_null.msgs[0] <== utxo_commitment;
    H_null.msgs[1] <== utxo_nullifier_secret;
    utxo_nullifier <== H_null.out;

    // Bind withdrawal parameters (recipient/amount/fee) into the proof without
    // changing the nullifier (nullifier must remain note-deterministic).
    component H_tag = MiMC_Sum(4);
    H_tag.msgs[0] <== utxo_nullifier;
    H_tag.msgs[1] <== withdraw_receiver;
    H_tag.msgs[2] <== withdraw_amount;
    H_tag.msgs[3] <== fee;
    withdraw_tag <== H_tag.out;
}

component main {public [withdraw_amount, fee, utxo_spender, withdraw_receiver]} = Withdraw(16);
