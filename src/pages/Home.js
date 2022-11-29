
import React, { useCallback, useState } from "react";
import {
    Box,
    Text,
    VStack,
    Grid,
    useToast,
    Button,
    Heading,
    HStack,
    Code,
    TabPanel,
    TabPanels,
    Tabs,
    TabList,
    Tab,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
} from "@chakra-ui/react";

import { ColorModeSwitcher } from "../ColorModeSwitcher";

import {
    useConnection,
    useWallet,
} from "@solana/wallet-adapter-react";

import {
    WalletDisconnectButton,
    WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useSolanaAccount } from "../hooks/useSolanaAccount";
import { Greet } from "../Greet";
require("@solana/wallet-adapter-react-ui/styles.css");

function WalletNotConnected() {
    return (
        <VStack height="70vh" justify="space-around">
            <VStack>
                <Text fontSize="2xl">
                    {" "}
                    Looks like your wallet is not connnected. Connect a wallet to get started!
                </Text>
                <WalletMultiButton />
            </VStack>
        </VStack>
    );
}

function Home() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const { account, transactions } = useSolanaAccount();
    const toast = useToast();
    const [airdropProcessing, setAirdropProcessing] = useState(false);

    const getAirdrop = useCallback(async () => {
        setAirdropProcessing(true);
        try {
            var airdropSignature = await connection.requestAirdrop(
                publicKey,
                2 * LAMPORTS_PER_SOL
            );

            const latestBlockHash = await connection.getLatestBlockhash();

            await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: airdropSignature,
            });
        } catch (error) {
            toast({ title: "Airdrop failed", description: error });
        }
        setAirdropProcessing(false);
    }, [toast, publicKey, connection]);

    return (
        <Box textAlign="center" fontSize="xl">
            <Grid minH="100vh" p={3}>
                <Tabs variant="soft-rounded" colorScheme="green">
                    <TabList width="full">
                        <HStack justify="space-between" width="full">
                            <HStack>
                                <Tab>Home</Tab>
                                <Tab>Transaction History</Tab>
                            </HStack>
                            <HStack>
                                {publicKey && <WalletDisconnectButton bg="green" />}
                                <ColorModeSwitcher justifySelf="flex-end" />
                            </HStack>
                        </HStack>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            {publicKey && (
                                <SimpleGrid columns={2} spacing={10}>
                                    <VStack spacing={8} borderRadius={10} borderWidth={2} p={10}>
                                        <FormControl id="pubkey">
                                            <FormLabel>Wallet Public Key</FormLabel>
                                            <Input type="text" value={publicKey.toBase58()} readOnly />
                                        </FormControl>
                                        <FormControl id="balance">
                                            <FormLabel>Balance</FormLabel>
                                            <Input
                                                type="text"
                                                value={
                                                    account
                                                        ? account.lamports / LAMPORTS_PER_SOL + " SOL"
                                                        : "Loading.."
                                                }
                                                readOnly
                                            />
                                        </FormControl>
                                        <Button onClick={getAirdrop} isLoading={airdropProcessing}>
                                            Get Airdrop of 2 SOL
                                        </Button>
                                    </VStack>
                                    <VStack>
                                        <Greet />
                                    </VStack>
                                </SimpleGrid>
                            )}
                            {!publicKey && <WalletNotConnected />}
                        </TabPanel>
                        <TabPanel>
                            {publicKey && (
                                <VStack spacing={8}>
                                    <Heading>Transactions</Heading>
                                    {transactions && (
                                        <VStack>
                                            {transactions.map((v, i, arr) => (
                                                <HStack key={"transaction-" + i}>
                                                    <Text>Signature: </Text>
                                                    <Code>{v.signature}</Code>
                                                </HStack>
                                            ))}
                                        </VStack>
                                    )}
                                </VStack>
                            )}
                            {!publicKey && <WalletNotConnected />}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Grid>
        </Box>
    );
}



export default Home