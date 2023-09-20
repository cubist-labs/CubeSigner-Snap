import {
  Input,
  Spinner,
  FormControl,
  FormLabel,
  Box,
  InputGroup,
  Text,
  SimpleGrid,
  Flex,
  InputRightElement,
  Spacer,
  Link,
} from "@chakra-ui/react";
import React, { useCallback, useState, useEffect, useContext } from "react";
import { CubeSignerContext, useWallets } from "../hooks";
import { Chain, Wallet, getChainsByKeyType } from "../utils";
import { CubeSignerActionType, TransactionActionType } from "../lib";
import { LargeButton } from "./Buttons";
import { WalletSelect } from "./WalletSelectComponent";
import { ChainSelect } from "./ChainSelectComponent";
import { FaExternalLinkAlt } from "react-icons/fa";

/**
 * Signer component allows a signed in user to select a Key (Account) they want
 * to interact with.
 *
 * @returns Component used for selecting and interacting with a Cubist account.
 */
export const SignerComponent = () => {
  const [cubeSignerState, cubeSigerDispatch] = useContext(CubeSignerContext);
  const { selectedWallet: wallet, provider } = cubeSignerState;

  const { wallets } = useWallets();

  /** Current wallet's balance. */
  const [balance, setBalance] = useState<bigint>();

  /** Loading state of balance. */
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);

  /** Tx's gas fee */
  const [gasFee, setGasFee] = useState<bigint>();

  /** Loading state of gas fee. */
  const [loadingGasFee, setLoadingGasFee] = useState<boolean>(false);

  /** Set of blockchains we can make transactions on. */
  const [chains, setChains] = useState<Chain[]>([]);

  /** String input for the amount of money to transfer. */
  const [txValue, setTxValue] = useState<string>("0.00");

  /** String input for who is receiving the money */
  const [toAddr, setToAddr] = useState<string>("");

  /** Updates balance/gas fee state on provider or wallet update. Resets if either is undefined */
  useEffect(() => {
    if (wallet && provider) {
      setLoadingBalance(true);
      setLoadingGasFee(true);

      const balancePromise = provider.fetchBalance(wallet);
      const gasFeePromise = provider.fetchGasFee(wallet.materialId);

      Promise.all([balancePromise, gasFeePromise])
        .then(([balance, gasFee]) => {
          setBalance(balance);
          setGasFee(gasFee);
        })
        .finally(() => {
          setLoadingBalance(false);
          setLoadingGasFee(false);
        });
    } else {
      setBalance(BigInt(0));
      setGasFee(BigInt(0));
    }
  }, [wallet, provider]);

  /** Updates set of chains on wallet key type update. */
  useEffect(() => {
    setChains(getChainsByKeyType(wallet?.type!));
  }, [wallet?.type]);

  /**
   * Helper function for clearing user input.
   */
  const resetForm = useCallback(() => {
    setTxValue("0");
    setToAddr("");
  }, [setToAddr, setTxValue]);

  /** Sends a signature request . */
  const onSignButtonClick = useCallback(async () => {
    cubeSigerDispatch({ type: TransactionActionType.Sending });

    try {
      const sendTxRequest = {
        from: wallet!,
        toAddr,
        txValue,
      };

      const signResponse = await provider?.sendTransaction(sendTxRequest);
      resetForm();
      cubeSigerDispatch({ type: TransactionActionType.Published, payload: signResponse! });
    } catch {
      cubeSigerDispatch({ type: TransactionActionType.Failed });
    }
  }, [toAddr, txValue, wallet, provider, resetForm, cubeSigerDispatch]);

  /**
   * Handles navigating the user to their wallet on click.
   */
  const onBackToWalletClick = useCallback(async () => {
    resetForm();
    cubeSigerDispatch({ type: CubeSignerActionType.WalletReset });
  }, [resetForm, cubeSigerDispatch]);

  const onBackToTransactionClick = useCallback(async () => {
    cubeSigerDispatch({ type: TransactionActionType.Cleared });
  }, [cubeSigerDispatch]);

  /**
   * Handles selecting a wallet from our account selection dropdown.
   *
   * @param {React.ChangeEvent} e - the dropdown's change event, containing the selected wallet.
   */
  const walletSelectedHandler = useCallback(
    (wallet: Wallet) => {
      cubeSigerDispatch({
        type: CubeSignerActionType.WalletSelected,
        payload: wallet,
      });
    },
    [cubeSigerDispatch]
  );

  /**
   * Handles selecting a chain.
   *
   * @param {React.ChangeEvent} e - the dropdown's change event, containing the selected chain's id.
   */
  const chainSelectedHandler = useCallback(
    (chain: Chain) => {
      cubeSigerDispatch({ type: CubeSignerActionType.ChainSelected, payload: chain });
    },
    [cubeSigerDispatch]
  );

  return (
    <Box display={"flex"}>
      {cubeSignerState.sending && <Spinner />}
      {cubeSignerState.error && (
        <Box display={"block"} color={"#000C49"} width={"100%"}>
          <Flex justify={"center"} margin={12}>
            <LargeButton onClick={onBackToTransactionClick}>Go Back</LargeButton>
          </Flex>
        </Box>
      )}
      {cubeSignerState.tx && (
        <>
          <Box display={"block"} color={"#000C49"} width={"100%"}>
            <Text marginBottom={0} fontWeight={500}>
              Transaction Hash
            </Text>
            <Link
              fontWeight={300}
              textDecoration={"underline"}
              isExternal={true}
              href={
                provider?.chain.explorerUrl(cubeSignerState.tx.transactionHash) ||
                provider?.getExplorerUrl(cubeSignerState.tx)
              }
            >
              {cubeSignerState.tx.transactionHash} <FaExternalLinkAlt />
            </Link>
            <Flex justify={"center"} margin={12}>
              <LargeButton onClick={onBackToWalletClick}>Back to your Wallets</LargeButton>
            </Flex>
          </Box>
        </>
      )}
      {!cubeSignerState.error && !cubeSignerState.sending && !cubeSignerState.tx && wallet && (
        <SimpleGrid columns={2} gap={4}>
          <Box>
            <Text fontSize={20} fontWeight={400} marginTop={0} marginBottom={"4px"}>
              From{" "}
            </Text>
            <WalletSelect
              wallets={wallets!}
              selectedWallet={wallet}
              onSelectHandler={walletSelectedHandler}
            />
          </Box>
          <Box>
            <Text fontSize={20} fontWeight={400} marginTop={0} marginBottom={"4px"}>
              Network
            </Text>
            <ChainSelect
              chains={chains || []}
              chain={provider?.chain || null}
              onSelectHandler={chainSelectedHandler}
            />
          </Box>
          <Box>
            <Text fontSize={20} fontWeight={400} marginTop={0} marginBottom={"4px"}>
              Balance
            </Text>
            <Flex
              justify={"left"}
              textAlign={"center"}
              width={"580px"}
              height={"28px"}
              flexShrink={"0"}
              padding={"25px 0"}
              fontSize={16}
              borderRadius={" 22px"}
              border={"1px solid #F7F5F0"}
              bg={"rgba(247, 245, 240, 0.40)"}
            >
              <Box margin={"-12px 20px"}>{provider?.chain.asset.Icon()}</Box>
              <Box>
                {loadingBalance ? (
                  <Spinner size={"sm"} />
                ) : provider ? (
                  provider.chain.asset.balanceDisplayText(balance!)
                ) : (
                  "--"
                )}
              </Box>
            </Flex>
          </Box>

          <FormControl>
            <FormLabel fontSize={20} fontWeight={400}>
              To
            </FormLabel>
            <Input
              borderRadius={"22px"}
              border={"1px solid #F7F5F0"}
              bg={"rgba(247, 245, 240, 0.40)"}
              width={"550px"}
              height={"76px"}
              flexShrink={0}
              paddingLeft={8}
              fontSize={16}
              placeholder="To Address (0x...9876)"
              value={toAddr}
              onChange={(e) => {
                setToAddr(e.currentTarget.value);
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize={20} fontWeight={400}>
              Amount
            </FormLabel>
            <InputGroup>
              <Input
                borderRadius={"22px"}
                border={"1px solid #F7F5F0"}
                bg={"rgba(247, 245, 240, 0.40)"}
                fontSize={24}
                fontWeight={500}
                width={505}
                height={"76px"}
                flexShrink={0}
                marginBottom="12px"
                paddingLeft={20}
                value={txValue}
                onChange={(e) => {
                  setTxValue(e.currentTarget.value);
                }}
              />
              <InputRightElement right={12} fontSize={16} height={"76"}>
                {provider?.chain.asset.unit}
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Box>
            <Text fontSize={20} fontWeight={400} marginTop={0} marginBottom={"4px"}>
              Gas Fee{" "}
              <Text display={"inline-flex"} marginTop={0} marginBottom={"1px"} fontWeight={100}>
                (estimated)
              </Text>
            </Text>
            <Flex
              justify={"right"}
              textAlign={"center"}
              width={580}
              height={"28px"}
              flexShrink={"0"}
              padding={"25px 0"}
              borderRadius={" 22px"}
              fontSize={16}
              border={"1px solid #F7F5F0"}
              bg={"rgba(247, 245, 240, 0.40)"}
            >
              <Box margin={"0 20px"}>
                {loadingGasFee ? (
                  <Spinner size={"sm"} />
                ) : provider ? (
                  provider.chain.asset.balanceDisplayText(gasFee!)
                ) : (
                  "--"
                )}
              </Box>
            </Flex>
          </Box>
          <Spacer>{/** here to force buttons to the right in the grid pattern. */}</Spacer>
          <Box>
            <LargeButton
              style={{
                float: "right",
                marginTop: "32px",
              }}
              onClick={onSignButtonClick}
            >
              Continue
            </LargeButton>
          </Box>
        </SimpleGrid>
      )}
    </Box>
  );
};
