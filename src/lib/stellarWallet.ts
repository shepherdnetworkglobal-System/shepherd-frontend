import * as StellarSdk from '@stellar/stellar-sdk';
import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';

export const TESTNET_HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

export const DEFAULT_PLATFORM_RECIPIENT = 'GDJ2Y5K65KFLXW743R3XTRJNZS24H7U77QUPB4AAYCQG4D22K3542E5E';

export async function connectWallet(): Promise<string> {
  console.log("Initializing Freighter connection handshake...");
  
  // Promise wrapper with 15-second timeout to prevent infinite hanging
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Freighter connection timed out. Please open the extension and unlock it."));
    }, 15000);
  });

  const connectLogic = async (): Promise<string> => {
    const hasInjectedWallet = typeof window !== 'undefined' && ((window as any).stellarKeystore || (window as any).freighter);

    let connection = false;
    try {
      const connectionStatus = await isConnected();
      connection = !!(connectionStatus && typeof connectionStatus === 'object'
        ? (connectionStatus as { isConnected?: boolean }).isConnected
        : connectionStatus);
    } catch (e) { console.warn(e); }

    if (!connection && !hasInjectedWallet) {
      throw new Error("Freighter wallet extension not detected. Please install it.");
    }

    // Force access request which triggers the Freighter popup
    const accessObj = await requestAccess();
    
    if (typeof accessObj === 'string') return accessObj;
    if (accessObj && typeof accessObj === 'object' && 'address' in accessObj) {
      return (accessObj as { address: string }).address;
    }

    const addressObj = await getAddress();
    if (typeof addressObj === 'string') return addressObj;
    if (addressObj && typeof addressObj === 'object' && 'address' in addressObj) {
      return (addressObj as { address: string }).address;
    }

    throw new Error("Could not retrieve wallet address. Please ensure you are logged into Freighter.");
  };

  return Promise.race([connectLogic(), timeoutPromise]);
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