/* import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
  performReverseLookup,
  getDNSRecordAddress,
  NAME_PROGRAM_ID,
  getHandleAndRegistryKey,
} from '@bonfida/spl-name-service';

import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

const SOL_TLD_AUTHORITY = new PublicKey(
  '58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx'
);

export const resolveDomain = async (domain: string) => {
  const hashedName = await getHashedName(domain.replace('.sol', ''));
  const nameAccountKey = await getNameAccountKey(
    hashedName,
    undefined,
    SOL_TLD_AUTHORITY // SOL TLD Authority
  );
  const owner = await NameRegistryState.retrieve(
    new Connection(clusterApiUrl('mainnet-beta')),
    nameAccountKey
  );
  console.log(owner.registry.owner.toBase58());
  return owner;
};

export const getDomain = async (pubkey: PublicKey): Promise<string> => {
  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const domainName = await performReverseLookup(connection, pubkey); // bonfida

  return domainName;
};

export const resolveSubomain = async (domain: string) => {
  const parentDomain = domain.split('.')[0];
  const subDomain = domain.split('.')[0];

  const hashedParentDomain = await getHashedName(parentDomain);
  const parentDomainKey = await getNameAccountKey(
    hashedParentDomain,
    undefined,
    SOL_TLD_AUTHORITY
  );

  const subDomainKey = await getDNSRecordAddress(parentDomainKey, subDomain);

  const owner = await NameRegistryState.retrieve(
    new Connection(clusterApiUrl('mainnet-beta')),
    subDomainKey
  );
  console.log(owner.registry.owner.toBase58());
  return owner;
};

export const getDomains = async (
  connection: Connection,
  userAccount: PublicKey
): Promise<string[]> => {
  const filters = [
    {
      memcmp: {
        offset: 32,
        bytes: userAccount.toBase58(),
      },
    },
  ];
  const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    filters,
  });
  return await Promise.all(accounts.map(async a => getDomain(a.pubkey)));
};

export const resolveTwitterHandle = async (
  connection: Connection,
  pubkey: PublicKey
) => {
  return await getHandleAndRegistryKey(connection, pubkey);

  //const registry = await getTwitterRegistry(connection, handle);
};
 */

//*-------------------

/* import { Connection, PublicKey } from "@solana/web3.js"
import { getDomainKey, NameRegistryState, getAllDomains, performReverseLookup } from "@bonfida/spl-name-service"
import "dotenv/config"

const { QUICKNODE_RPC_ENDPOINT } = process.env

const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC_ENDPOINT as string)

async function getPublicKeyFromSolDomain(domain: string): Promise<string>{
  const { pubkey } = await getDomainKey(domain)
  const owner = (await NameRegistryState.retrieve(
    SOLANA_CONNECTION, pubkey
  )).registry.owner.toBase58()
  console.log(`The owner of SNS Domain "${domain}" is:`, owner)
  return owner
}

async function getSolDomainsFromPublicKey(wallet: string): Promise<string[]>{
  const ownerWallet = new PublicKey(wallet)
  const allDomainKeys = await getAllDomains(SOLANA_CONNECTION, ownerWallet)
  const allDomainNames = await Promise.all(
    allDomainKeys.map(
      key=>{return performReverseLookup(SOLANA_CONNECTION, key)}
    )
  )
  console.log(`\n${wallet} owns the following SNS domains:`)
  allDomainNames.forEach((domain, i) => console.log(` ${i+1}.`, domain))
  return allDomainNames
}

// You can replace these search examples with your own wallet or other Solana Naming Service queries.
const DOMAIN_TO_SEARCH = 'bonfida'
const WALLET_TO_SEARCH = 'E645TckHQnDcavVv92Etc6xSWQaq8zzPtPRGBheviRAk'

getPublicKeyFromSolDomain(DOMAIN_TO_SEARCH)
getSolDomainsFromPublicKey(WALLET_TO_SEARCH) */
