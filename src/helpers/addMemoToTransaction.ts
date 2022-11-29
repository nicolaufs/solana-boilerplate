import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

export const addMemoToTransaction = async (
  connection: Connection,
  transaction: Transaction,
  fromKeypair: Keypair,
  memo: string
) => {
  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: fromKeypair.publicKey, isSigner: true, isWritable: true },
      ],
      data: Buffer.from(memo, 'utf-8'),
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
    })
  );

  await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
};
