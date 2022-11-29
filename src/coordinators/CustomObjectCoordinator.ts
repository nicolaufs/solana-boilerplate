import { Connection, PublicKey, TokenAccountsFilter } from '@solana/web3.js';
import { CustomObject } from '../models/CustomObject';
import bs58 from 'bs58';

const PROGRAM_ID = '';

export class ObjectCordinator {
  static accounts: PublicKey[] = [];

  // Get Program Accounts Pubkey (without info, info t be fetched when paginating)
  static async prefetchAccounts(
    connection: Connection,
    search: string,
    sorted = true
  ) {
    const accounts = await connection.getProgramAccounts(
      new PublicKey(PROGRAM_ID),
      {
        // based on CustomObject borshAccountSchema
        // ( 1 byte for initialized + 1 byte for param2 -> offset: 2 )
        // length of 18 tu ensure anough characters
        dataSlice: sorted
          ? { offset: 2, length: 18 }
          : { offset: 0, length: 0 },
        // The offset to the title fields is 2, but the first 4 bytes are the length of the
        // title so the actual offset to the string itself is 6
        filters:
          search === ''
            ? []
            : [
                {
                  memcmp: {
                    offset: 6,
                    bytes: bs58.encode(Buffer.from(search)),
                  },
                },
              ],
      }
    );

    accounts.sort((a, b) => {
      const lengthA = a.account.data.readUInt32LE(0);
      const lengthB = b.account.data.readUInt32LE(0);
      // first 4 bytes of a dynamic field in Borsh are used to store the length of the field in bytes
      const dataLengthBytes = 4;
      const dataA = a.account.data.subarray(
        dataLengthBytes,
        dataLengthBytes + lengthA
      );
      // first 4 bytes of a dynamic field in Borsh are used to store the length of the field in bytes
      const dataB = b.account.data.subarray(
        dataLengthBytes,
        dataLengthBytes + lengthB
      );
      return dataA.compare(dataB);
    });

    this.accounts = accounts.map(account => account.pubkey);
  }

  static async fetchPage(
    connection: Connection,
    page: number,
    perPage: number,
    search: string,
    sorted = true
  ): Promise<CustomObject[]> {
    // 1. Get Program Accounts Pubkeys
    if (this.accounts.length === 0) {
      await this.prefetchAccounts(connection, search, sorted);
    }

    // 2. Find pubkeys from list that belong to page
    const paginatedPublicKeys = this.accounts.slice(
      (page - 1) * perPage,
      page * perPage
    );

    if (paginatedPublicKeys.length === 0) {
      return [];
    }

    // 3. Get Accounts Info
    const accounts = await connection.getMultipleAccountsInfo(
      paginatedPublicKeys
    );

    const objects = accounts.reduce((accum: CustomObject[], account) => {
      const ob = CustomObject.deserialize(account?.data);
      if (!ob) {
        return accum;
      }

      return [...accum, ob];
    }, []);

    return objects;
  }
}

export const getProgramAccounts = async (
  connection: Connection,
  programId: PublicKey,
  includeAccountData = false
) => {
  const accounts = await connection.getProgramAccounts(programId, {
    dataSlice: includeAccountData ? undefined : { offset: 0, length: 0 },
  });

  const accountKeys = accounts.map(account => account.pubkey);

  return includeAccountData ? accounts : accountKeys;

  // https://soldev.app/course/paging-ordering-filtering-data

  /* Fetch account data when paginated
  const paginatedKeys = accountKeys.slice(0, 10);
  const accountInfos = await connection.getMultipleAccountsInfo(paginatedKeys);
  const deserializedObjects = accountInfos.map(accountInfo => {
    // put logic to deserialize accountInfo.data here
  });
  */
};
