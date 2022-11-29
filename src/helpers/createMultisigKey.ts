import { createMultisig } from '@solana/spl-token';
import { Connection, Signer } from '@solana/web3.js';

export async function createMultisigKey(
  connection: Connection,
  signer: Signer,
  multiSigners: Signer[],
  minMultiSigners: number
) {
  const multisigKey = await createMultisig(
    connection,
    signer,
    multiSigners.map(m => m.publicKey),
    minMultiSigners
  );

  console.log(
    `Created ${minMultiSigners}/${
      multiSigners.length
    } multisig ${multisigKey.toBase58()}`
  );

  return multisigKey;
}
