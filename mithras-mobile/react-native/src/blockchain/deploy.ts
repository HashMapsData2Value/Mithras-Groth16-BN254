import { MithrasProtocolClient } from 'mithras-contracts-and-circuits/src/index';
import { APP_SPEC, MithrasClient } from 'mithras-contracts-and-circuits/contracts/clients/Mithras';
import { getAlgorandClient } from './network';
import { storage } from '../services/storage';
import { loadAssets } from '../utils/loadAssets';
import { readFile } from '@dr.pogodin/react-native-fs';
import { Buffer } from '@craftzdog/react-native-buffer';
import { Alert } from 'react-native';

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function addrToString(addrLike: any): string {
  if (typeof addrLike === 'string') return addrLike;
  if (addrLike?.addr?.toString) return addrLike.addr.toString();
  if (addrLike?.toString) return addrLike.toString();
  throw new Error('Unable to convert address to string');
}

async function findMithrasAppIdByCreator(
  algorandClient: any,
  creatorAddress: string,
): Promise<bigint | undefined> {
  // Match by compiled program bytes so we ignore temporary deleted budget apps.
  const targetApproval = new Uint8Array(
    Buffer.from((APP_SPEC as any)?.byteCode?.approval ?? '', 'base64'),
  );
  const targetClear = new Uint8Array(
    Buffer.from((APP_SPEC as any)?.byteCode?.clear ?? '', 'base64'),
  );
  if (targetApproval.length === 0 || targetClear.length === 0) {
    throw new Error('Missing compiled byteCode in Mithras APP_SPEC');
  }

  const acctInfo = (await algorandClient.client.algod
    .accountInformation(creatorAddress)
    .do()) as any;
  const createdApps: any[] = acctInfo?.['created-apps'] ?? [];

  let bestId: number | undefined;
  for (const app of createdApps) {
    const params = app?.params;
    if (!params) continue;
    if (app?.deleted) continue;
    const approvalB64: string | undefined = params?.['approval-program'];
    const clearB64: string | undefined = params?.['clear-state-program'];
    if (!approvalB64 || !clearB64) continue;

    const approval = new Uint8Array(Buffer.from(approvalB64, 'base64'));
    const clear = new Uint8Array(Buffer.from(clearB64, 'base64'));
    if (!bytesEqual(approval, targetApproval)) continue;
    if (!bytesEqual(clear, targetClear)) continue;

    const id: number | undefined = app?.id;
    if (typeof id !== 'number') continue;
    if (bestId === undefined || id > bestId) bestId = id;
  }

  return bestId !== undefined ? BigInt(bestId) : undefined;
}

/**
 * Finds the existing Mithras app on localnet by scanning the dispenser's created apps.
 * This avoids confusion with the temporary deleted apps created by `ensureBudget()`.
 */
export async function findMithrasAppLocalnet(): Promise<bigint | undefined> {
  const network = storage.getString('network');
  if (network !== 'localnet') return undefined;

  const algorandClient = await getAlgorandClient();
  const dispenser = await algorandClient.account.localNetDispenser();
  const creatorAddress = addrToString(dispenser);
  return await findMithrasAppIdByCreator(algorandClient, creatorAddress);
}

async function promptUseExistingOrDeployNew(existingAppId: string): Promise<'use-existing' | 'deploy-new'> {
  return await new Promise((resolve) => {
    Alert.alert(
      'Mithras already deployed',
      `mithrasAppId already stored (${existingAppId}). Deploy a new one and update?`,
      [
        {
          text: 'Use existing',
          style: 'cancel',
          onPress: () => resolve('use-existing'),
        },
        {
          text: 'Deploy new',
          style: 'destructive',
          onPress: () => resolve('deploy-new'),
        },
      ],
      { cancelable: true, onDismiss: () => resolve('use-existing') },
    );
  });
}


/**
 * Deploys the Mithras App to the localnet network.
 * Not possible to call to deploy to testnet and mainnet,
 * there is no point having users deploy their own instances on those networks.
 * 
 * NOTE: If there is already a Mithras app deployed to localnet, update the .env file!
 * @returns Mithras App Id
 */
export async function deployMithrasAppLocalnet(): Promise<bigint> {
  const network = storage.getString('network');
  if (network !== 'localnet') {
    throw new Error('Deploy is only supported on localnet');
  }

  const mithrasAppId = storage.getString('mithrasAppId');
  if (mithrasAppId) {
    const choice = await promptUseExistingOrDeployNew(mithrasAppId);
    if (choice === 'use-existing') {
      return BigInt(mithrasAppId);
    }
    // deploy new: clear stored id so we can overwrite after successful deploy
    storage.set('mithrasAppId', '');
  }
  const algorandClient = await getAlgorandClient()
  console.log("client:", algorandClient)
  console.log("algorandClient.account:", algorandClient.account)
  console.log("algorandClient.account.localNetDispenser:", algorandClient.account.localNetDispenser)
  console.log("about to get dispenser address")
  const dispenserAddress = await algorandClient.account.localNetDispenser()
  console.log("dispenserAddress", dispenserAddress)
  try {
    // Hermes cannot instantiate snarkjs curves/WebAssembly, so we must ship precompiled
    // verifier LogicSig programs + addresses and pass them into deploy().
    //
    // Prefer filesystem (copied out of native bundle) for parity across platforms, but
    // on iOS simulator/dev builds asset linking/copying can be flaky. Support Metro-bundled
    // JSON fallback so localnet deploy doesn't get blocked.
    let artifacts: {
      depositVerifierAddr: string;
      depositVerifierProgramB64: string;
      spendVerifierAddr: string;
      spendVerifierProgramB64: string;
      withdrawVerifierAddr: string;
      withdrawVerifierProgramB64: string;
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      artifacts = require('../../assets/keys/verifier_artifacts.json');
    } catch (e) {
      console.warn(
        'Failed to require verifier_artifacts.json from Metro bundle; falling back to native assets',
        e,
      );
      const artifactsPath = await loadAssets('verifier_artifacts.json', { force: true });
      const artifactsJson = await readFile(artifactsPath, 'utf8');
      artifacts = JSON.parse(artifactsJson);
    }

    const opts = {
      depositVerifierAddr: artifacts.depositVerifierAddr,
      spendVerifierAddr: artifacts.spendVerifierAddr,
      withdrawVerifierAddr: artifacts.withdrawVerifierAddr,
      depositVerifierProgram: new Uint8Array(
        Buffer.from(artifacts.depositVerifierProgramB64, 'base64'),
      ),
      spendVerifierProgram: new Uint8Array(
        Buffer.from(artifacts.spendVerifierProgramB64, 'base64'),
      ),
      withdrawVerifierProgram: new Uint8Array(
        Buffer.from(artifacts.withdrawVerifierProgramB64, 'base64'),
      ),
      onMobile: true,
    };

    console.log("before deployment");
    const deployment = await MithrasProtocolClient.deploy(algorandClient, dispenserAddress, opts);
    console.log("past deployment; appId=", deployment.appClient.appId.toString());

    // If you want to "grab" the Mithras app later (or if explorers show a deleted budget app),
    // resolve it by matching the compiled approval/clear programs.
    try {
      const creatorAddress = addrToString(dispenserAddress);
      const resolvedId = await findMithrasAppIdByCreator(algorandClient, creatorAddress);
      console.log('resolved mithras appId by creator/program match:', resolvedId?.toString());
    } catch (e) {
      console.warn('Failed to resolve Mithras appId by creator/program match (non-fatal):', e);
    }

    // Sanity check: confirm on-chain status and that verifier addresses were written.
    // Note: explorers may show additional *temporary* apps created during opcode budget top-ups.
    try {
      const appIdNum = Number(deployment.appClient.appId);
      const appInfo = (await algorandClient.client.algod.getApplicationByID(appIdNum).do()) as any;
      console.log(
        'algod app info:',
        JSON.stringify(
          {
            id: appInfo?.id,
            deleted: appInfo?.deleted,
            createdAtRound: appInfo?.['created-at-round'],
            // Program blobs are base64; just log lengths.
            approvalLen: (appInfo?.params as any)?.['approval-program']?.length,
            clearLen: (appInfo?.params as any)?.['clear-state-program']?.length,
          },
          null,
          2,
        ),
      );

      const depositVerifier = await deployment.appClient.state.global.depositVerifier();
      const spendVerifier = await deployment.appClient.state.global.spendVerifier();
      const withdrawVerifier = await deployment.appClient.state.global.withdrawVerifier();
      console.log('mithras global state verifiers:', {
        depositVerifier,
        spendVerifier,
        withdrawVerifier,
      });
    } catch (e) {
      console.warn('Failed to fetch app info after deploy (non-fatal):', e);
    }

    const appClient = algorandClient.client.getTypedAppClientById(MithrasClient, {
      appId: deployment.appClient.appId,
      defaultSender: dispenserAddress,
    });

    storage.set('mithrasAppId', deployment.appClient.appId.toString());

    return appClient.appId;
  } catch (e) {
    console.error('Failed to prepare verifier assets for deploy:', e);
    throw e;
  }
}
