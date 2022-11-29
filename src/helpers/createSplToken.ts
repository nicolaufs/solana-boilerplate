import {
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  getAccount,
  mintTo,
} from '@solana/spl-token';
import { Connection, Keypair } from '@solana/web3.js';

export async function createSplToken(
  connection: Connection,
  payer: Keypair,
  mintAuthority: Keypair,
  freezeAuthority: Keypair
) {
  // Creating your own fungible token
  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    freezeAuthority.publicKey,
    9 // We are using 9 to match the CLI decimal default exactly
  );
  console.log(mint.toBase58());

  // Get mint info
  const mintInfo = await getMint(connection, mint);

  console.log(mintInfo.supply);

  // Mint some of the created token
  // 1. Create Account to hold the balance of the new token
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  console.log(tokenAccount.address.toBase58());

  // check account to see it is empty
  const tokenAccountInfo = await getAccount(connection, tokenAccount.address);

  console.log(tokenAccountInfo.amount);

  // 2. Mint amount
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    mintAuthority,
    100000000000 // because decimals for the mint are set to 9
  );

  // check supply and balance in mint and account respectively
  const newMintInfo = await getMint(connection, mint);

  console.log(newMintInfo.supply);

  const newTokenAccountInfo = await getAccount(
    connection,
    tokenAccount.address
  );

  console.log(newTokenAccountInfo.amount);

  return { mint, tokenAccount };
}
