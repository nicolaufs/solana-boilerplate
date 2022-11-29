import { AccountLayout, RawAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';

export async function useTokenAccounts() {
  //pubkey: String | null
  const [tokenAccounts, setTokenAccounts] = useState<RawAccount[]>();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const init = useCallback(async () => {
    if (publicKey) {
      const fetchedTokenAccounts = await connection.getTokenAccountsByOwner(
        publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );

      const tokenAccounts = fetchedTokenAccounts.value.map(tokenAccount => {
        const accountData = AccountLayout.decode(tokenAccount.account.data);
        return accountData;
      });
      setTokenAccounts(tokenAccounts);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (publicKey) {
      setInterval(init, 2000);
    }
  }, [init, publicKey]);

  return tokenAccounts;
}
