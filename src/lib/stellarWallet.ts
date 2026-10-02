import * as StellarSdk from '@stellar/stellar-sdk';
import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';

export const TESTNET_HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

export const DEFAULT_PLATFORM_RECIPIENT = 'GDJ2Y5K65KFLXW743R3XTRJNZS24H7U77QUPB4AAYCQG4D22K3542E5E';

export async function connectWallet(): Promise<string> {
  console.log("Initializing Freighter connection handshake...");
  
  // Direct window detection check as fallback to helper functions
  const hasInjectedWallet = typeof window !== 'undefined' && (window as any).stellarKeystore;
  
  let connection = false;
  try {
    const connectionState = await isConnected();
    connection = !!(
      connectionState &&
      typeof (connectionState as any).isConnected === 'boolean'
        ? (connectionState as any).isConnected
        : connectionState
    );
  } catch (e) {
    console.warn("isConnected check threw error:", e);
  }

  if (!connection && !hasInjectedWallet) {
    throw new Error('Freighter wallet extension not detected. Please install Freighter and verify it is enabled in your browser extensions.');
  }

  console.log("Requesting account access from Freighter...");
  try {
    const accessObj = await requestAccess();
    if (accessObj && typeof accessObj === 'object' && 'address' in accessObj) {
      console.log("Access granted via requestAccess:", (accessObj as any).address);
      return (accessObj as { address: string }).address;
    }
  } catch (err: any) {
    console.error("Freighter requestAccess failed:", err);
  }

  console.log("Attempting fallback address retrieval...");
  try {
    const addressObj = await getAddress();
    if (typeof addressObj === 'string' && addressObj) {
      return addressObj;
    }
    if (addressObj && typeof addressObj === 'object' && 'address' in addressObj) {
      return (addressObj as { address: string }).address;
    }
  } catch (err: any) {
    console.error("Freighter getAddress failed:", err);
  }

  throw new Error('Could not retrieve wallet address. Please open Freighter, sign in, and refresh this page.');
}

export async function sendTestnetPayment(params: {
  senderPublicKey: string;
  recipientPublicKey: string;
  amount: string;
  memoText?: string;
}): Promise<{ hash: string }> {
  const server = new StellarSdk.Horizon.Server(TESTNET_HORIZON_URL);
  const account = await server.loadAccount(params.senderPublicKey);

  let txBuilder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: TESTNET_PASSPHRASE,
  }).addOperation(
    StellarSdk.Operation.payment({
      destination: params.recipientPublicKey,
      asset: StellarSdk.Asset.native(),
      amount: parseFloat(params.amount).toFixed(7),
    })
  );

  if (params.memoText) {
    txBuilder = txBuilder.addMemo(
      StellarSdk.Memo.text(params.memoText.substring(0, 28))
    );
  }

  const tx = txBuilder.setTimeout(30).build();

  const signResult = await signTransaction(tx.toXDR(), {
    networkPassphrase: TESTNET_PASSPHRASE,
  });

  const signedXdr = typeof signResult === 'string' ? signResult : (signResult as any).signedTxXdr;

  if (!signedXdr) {
    throw new Error('Transaction signing was cancelled or failed.');
  }

  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    TESTNET_PASSPHRASE
  );

  try {
    const result = await server.submitTransaction(transaction);
    return { hash: result.hash };
  } catch (error: any) {
    if (error?.response?.data?.extras?.result_codes) {
      const codes = error.response.data.extras.result_codes;
      const opCodes = codes.operations ? ` (${codes.operations.join(', ')})` : '';
      throw new Error(`Stellar network rejected transaction: ${codes.transaction}${opCodes}`);
    }
    throw error;
  }
}