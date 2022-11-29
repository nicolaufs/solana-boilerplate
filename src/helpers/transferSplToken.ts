import { Connection, PublicKey, Keypair, Signer } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  getMint,
  transfer,
  transferChecked,
} from '@solana/spl-token';

export const transferSplToken = async (
  connection: Connection,
  fromWallet: Signer,
  toWallet: PublicKey,
  mint: PublicKey,
  fromTokenAccount: PublicKey | null,
  toTokenAccount: PublicKey | null,
  amount: number,
  senderFunding = true
): Promise<string> => {
  if (!fromTokenAccount) {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey
    );
    fromTokenAccount = tokenAccount.address;
  }

  if (!toTokenAccount) {
    // Get the token account of the toWallet address, and if it does not exist, create it
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      toWallet
    );

    toTokenAccount = tokenAccount.address;
  }

  const mintInfo = await getMint(connection, mint);

  // Transfer the token to the "toTokenAccount"
  const signature = await transferChecked(
    connection, // connection
    fromWallet, // payer
    fromTokenAccount, // from (should be a token account)
    mint, // mint
    toTokenAccount, // to (should be a token account)
    fromWallet, // from's owner
    amount * 10 ** mintInfo.decimals, // amount, if your deciamls is 8, send 10^8 for 1 token
    mintInfo.decimals // decimals
  );

  return signature;
};
