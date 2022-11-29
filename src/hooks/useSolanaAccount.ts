import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AccountInfo, ConfirmedSignatureInfo } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

export const useSolanaAccount = () => {
  const [account, setAccount] = useState<AccountInfo<Buffer> | null>(null);
  const [transactions, setTransactions] = useState<
    ConfirmedSignatureInfo[] | null
  >(null);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const init = useCallback(async () => {
    if (publicKey) {
      let acc = await connection.getAccountInfo(publicKey);
      setAccount(acc);
      let transactions = await connection.getConfirmedSignaturesForAddress2(
        publicKey,
        {
          limit: 10,
        }
      );
      setTransactions(transactions);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (publicKey) {
      init();
      connection.onAccountChange(publicKey, init, 'confirmed');
    }
  }, [init, publicKey]);

  /* useEffect(() => {
        if (publicKey) {
          setInterval(init, 1000);
        }
      }, [init, publicKey]); */

  // afegir clearInterval en cas de que lusuari canvii de wallet

  return { account, transactions };
};
