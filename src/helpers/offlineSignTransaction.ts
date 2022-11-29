import {
  Connection,
  Keypair,
  Message,
  NonceAccount,
  NONCE_ACCOUNT_LENGTH,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';

// * To use nonce accounts
// 1. Create a nonce account (createNonceAccount)
// 2. Create transaction with nonce advance instruction and append instructions
// 3. Make transaction be signed by signers and send it

export const createNonceAccount = async (
  connection: Connection,
  signer: Signer,
  nonceAccountAuth: Signer
) => {
  const nonceAccount = Keypair.generate();
  console.log(`nonce account: ${nonceAccount.publicKey.toBase58()}`);

  let transaction = new Transaction().add(
    // create nonce account
    SystemProgram.createAccount({
      fromPubkey: signer.publicKey,
      newAccountPubkey: nonceAccount.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        NONCE_ACCOUNT_LENGTH
      ),
      space: NONCE_ACCOUNT_LENGTH,
      programId: SystemProgram.programId,
    }),
    // init nonce account
    SystemProgram.nonceInitialize({
      noncePubkey: nonceAccount.publicKey, // nonce account pubkey
      authorizedPubkey: nonceAccountAuth.publicKey, // nonce account authority (for advance and close)
    })
  );

  const confirmation = await sendAndConfirmTransaction(
    connection,
    transaction,
    [signer, nonceAccount]
  );

  return { nonceAccount, confirmation };
};

export const setTransactionToNonceAccount = async (
  connection: Connection,
  feePayer: Signer,
  signers: Signer[],
  nonceAccountAuth: Signer,
  nonceAccountPubkey: PublicKey,
  instructions: TransactionInstruction[],
  amount: number
) => {
  // get nonce account data
  const nonceAccountData = await connection.getNonce(
    nonceAccountPubkey,
    'confirmed'
  );
  console.log(nonceAccountData);

  const nonceAccountInfo = await connection.getAccountInfo(
    nonceAccountPubkey,
    'confirmed'
  );
  const nonceAccount = NonceAccount.fromAccountData(nonceAccountInfo!.data);
  console.log(nonceAccount);

  let transaction = new Transaction().add(
    // nonce advance must be the first insturction
    SystemProgram.nonceAdvance({
      noncePubkey: nonceAccountPubkey,
      authorizedPubkey: nonceAccountAuth.publicKey,
    }),
    ...instructions
    // append transaction instructions
    //(here you do what you really want to do e.g.:
    /*
    SystemProgram.transfer({
      fromPubkey: signer.publicKey,
      toPubkey: nonceAccountAuth.publicKey,
      lamports: amount,
    }),
    createTransferCheckedInstruction(
      fromAddress, // source
      tokenMint.mint, // mint
      toAddress, // destination
      ownerPubkey, // owner of source account
      amount * 10 ** tokenMint.decimals, // amount to transfer
      tokenMint.decimals // decimals of token
    ),
    // mint nft to account
    createMintToInstruction(
      mint,
      associatedTokenAccount.address,
      toAccount,
      1,
      multiSigners ? multiSigners : undefined,
      TOKEN_PROGRAM_ID
    )
    */
  );

  // assign `nonce` as recentBlockhash
  transaction.recentBlockhash = nonceAccount.nonce;
  // assign feePayer pubkey
  transaction.feePayer = feePayer.publicKey;

  // to be done offline or online
  /* transaction.sign(
    ...signers,
    nonceAccountAuth
  ); // fee payer + nonce account authority + ... 

  const signature = await connection.sendRawTransaction(
    transaction.serialize()
  ); */

  return transaction;
};

// * To complete a offline transaction:
// 1. Create transaction and sign it with feePayer signature
// 2. Get offline signatures (offlineSignTransaction)
// 3. Verify signatures (verifyTransactionSignature)
// 4. Recover transaction, populate with signatures and send it (recoverAndSendTransaction)

export const offlineSignTransaction = (
  transaction: Transaction,
  signer: Signer
) => {
  const signature = nacl.sign.detached(
    transaction.serializeMessage(),
    signer.secretKey
  );

  return signature;
};

export const verifyTransactionSiganture = (
  transaction: Transaction,
  signature: Uint8Array,
  signerPubkey: PublicKey
) => {
  let verificationResult = nacl.sign.detached.verify(
    transaction.serializeMessage(),
    signature,
    signerPubkey.toBytes() // you should use the raw pubkey (32 bytes) to verify
  );
  console.log(`verify feePayer signature: ${verificationResult}`);
  return verificationResult;
};

export const recoverAndSendTransaction = async (
  connection: Connection,
  transaction: Transaction,
  signatures: Uint8Array[]
) => {
  // Recover Tranasction (use populate with signature)
  let signedTransaction = Transaction.populate(
    Message.from(transaction.serializeMessage()),
    signatures.map(s => bs58.encode(s))
  );

  // Send transaction
  console.log(
    `txhash: ${await connection.sendRawTransaction(
      signedTransaction.serialize()
    )}`
  );
};

// * Partially sign transactions
// 1. Create transaction
// 2. Make it partially signed by signers (partiallySignTransaction)
// 3. Finally feePayer signs and sends transaction
export const partiallySignTransaction = (
  transaction: Transaction,
  signer: Signer
) => {
  // Partial sign
  transaction.partialSign(signer);
  // Serialize the transaction and convert to base64 to return it
  const serializedTransaction = transaction.serialize({
    // We will need the other signers to deserialize and sign the transaction
    requireAllSignatures: false,
  });
  const transactionBase64 = serializedTransaction.toString('base64');
  const signedTransaction = deserializeTransaction(transactionBase64);
  return { signedTransaction, transactionBase64 };
};

export const deserializeTransaction = (transactionBase64: string) => {
  // Derialize the transaction and return it
  const transaction = Transaction.from(
    Buffer.from(transactionBase64, 'base64')
  );
  return transaction;
};
