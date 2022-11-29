//  https://github.com/metaplex-foundation/js#the-nft-model

// ! to be done....

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';

import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
} from '@solana/web3.js';
import { Metaplex, isMetadata } from '@metaplex-foundation/js';
import Arweave from 'arweave';

const connection = new Connection(clusterApiUrl('mainnet-beta'));
const metaplex = new Metaplex(connection);

/* 
const wallet = useWallet();
metaplex.use(walletAdapterIdentity(wallet));
 */

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false,
});

export const getNFTFromMint = async (mintAddress: PublicKey) => {
  // Create an AbortController that aborts in 100ms.
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), 100);

  // Pass the AbortController's signal to the operation.
  const nft = await metaplex.nfts().findByMint(
    { mintAddress },
    {
      signal: abortController.signal,
    }
  );

  /* 
const editionAddress = nft.edition.address;

if (nft.edition.isOriginal) {
    const totalPrintedNfts = nft.edition.supply;
    const maxNftsThatCanBePrinted = nft.edition.maxSupply;
} else {
    const mintAddressOfOriginalNft = nft.edition.parent;
    const editionNumber = nft.edition.number;
}
 */

  return nft;
};

export const getNFTsFromMints = async (mints: PublicKey[]) => {
  const metadatas = await metaplex.nfts().findAllByMintList({
    mints,
  });
  const nfts = metadatas.map(async metadata =>
    isMetadata(metadata) ? await metaplex.nfts().load({ metadata }) : metadata
  );

  return nfts;
};

export const getNFTsFromOwner = async (owner: PublicKey) => {
  const metadatas = await metaplex.nfts().findAllByOwner({
    owner,
  });

  const nfts = metadatas.map(async metadata =>
    isMetadata(metadata) ? await metaplex.nfts().load({ metadata }) : metadata
  );

  return nfts;
};

export const getNFTsFromCreator = async (creator: PublicKey) => {
  const metadatas = await metaplex.nfts().findAllByCreator({
    creator,
  });

  const nfts = metadatas.map(async metadata =>
    isMetadata(metadata) ? await metaplex.nfts().load({ metadata }) : metadata
  );

  return nfts;
};

export async function createNFT(
  connection: Connection,
  signer: Signer,
  multiSigners: Signer[] | undefined,
  mintAuthority: Keypair,
  freezeAuthority: Keypair,
  toAccount: PublicKey
) {
  // Create token type with zero decimal
  const mint = await createMint(
    connection,
    signer,
    mintAuthority!.publicKey,
    freezeAuthority!.publicKey,
    0
  );

  // Create account to hold token of this new type
  const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    signer,
    mint,
    toAccount
  );

  // Mint only 1 token into the account
  await mintTo(
    connection,
    signer,
    mint,
    associatedTokenAccount.address,
    toAccount,
    1,
    multiSigners ? multiSigners : undefined
  );

  // Disable future minting
  let transaction = new Transaction().add(
    createSetAuthorityInstruction(
      mint,
      mintAuthority.publicKey,
      AuthorityType.MintTokens,
      null,
      multiSigners ? multiSigners : undefined
    )
  );

  await sendAndConfirmTransaction(connection, transaction, [signer]);
}
