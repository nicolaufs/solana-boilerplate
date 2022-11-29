import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { burnChecked, getMint, closeAccount } from '@solana/spl-token';

export const burnTokens = async (
  connection: Connection,
  feePayer: Keypair,
  mint: PublicKey,
  fromWallet: PublicKey,
  tokenAccount: PublicKey,
  amount: number
) => {
  // Get mint info
  const mintInfo = await getMint(connection, mint);

  // 1) use build-in function
  let txhash = await burnChecked(
    connection, // connection
    feePayer, // payer
    tokenAccount, // token account
    mint, // mint
    fromWallet, // owner
    amount * 10 ** mintInfo.decimals, // amount, if your deciamls is 8, send 10^8 for 1 token
    mintInfo.decimals // decimals
  );
  console.log(`txhash: ${txhash}`);
};

export const closeTokenAccount = async (
  connection: Connection,
  feePayer: Keypair,
  tokenAccountPubkey: PublicKey,
  fromWallet: PublicKey
) => {
  let txhash = await closeAccount(
    connection, // connection
    feePayer, // payer
    tokenAccountPubkey, // token account which you want to close
    fromWallet, // destination
    fromWallet // owner of token account
  );
};
