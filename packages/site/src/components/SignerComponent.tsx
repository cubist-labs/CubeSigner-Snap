import {
  Input,
  Spinner,
  FormControl,
  FormLabel,
  Box,
  InputRightAddon,
  InputGroup,
  Select,
  Text,
  Link,
} from "@chakra-ui/react";
import React, { useCallback, useState, useEffect, useContext, useReducer } from "react";
import { useWallets, useChains, CubeSignerContext, CubeSignerActionType } from "../hooks";
import { balanceDisplayText } from "../utils";
import { SignTransactionActions, signTransactionReducer, initialTransactionState } from "../lib";
import { Button } from "./Buttons";
import { Container, ErrorMessage } from "./_styledElements";
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

  /** Current wallet's balance. */
  const [balance, setBalance] = useState<bigint>();

  /** Loading state of balance. */
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);

  /** Set of wallets associated with the account. */
  const { wallets, loadingWallets, loadingWalletsError } = useWallets();

  /** Set of blockchains we can make transactions on. */
  const { chains } = useChains();

  /** String input for the amount of money to transfer. */
  const [txValue, setTxValue] = useState<string>("0");

  /** String input for who is receiving the money */
  const [toAddr, setToAddr] = useState<string>("");

  /** Tx signing state manager */
  const [signTransactionState, signTransactionDispatch] = useReducer(
    signTransactionReducer,
    initialTransactionState
  );

  /** Updates balance state on provider or wallet update. Resets if either is undefined */
  useEffect(() => {
    if (wallet && provider) {
      setLoadingBalance(true);
      provider
        .fetchBalance(wallet)
        .then((balance) => {
          setBalance(balance);
        })
        .finally(() => {
          setLoadingBalance(false);
        });
    } else {
      setBalance(BigInt(0));
    }
  }, [wallet, provider]);

  /**
   * Helper function for clearing user input.
   */
  const resetForm = useCallback(() => {
    setTxValue("0");
    setToAddr("");
  }, [setToAddr, setTxValue]);

  /** Sends a signature request . */
  const onSignButtonClick = useCallback(async () => {
    signTransactionDispatch({ type: SignTransactionActions.Sending });

    try {
      const sendTxRequest = {
        fromAddr: wallet?.material_id!,
        toAddr,
        txValue,
      };

      const signResponse = await provider?.sendTransaction(sendTxRequest);
      resetForm();
      signTransactionDispatch({ type: SignTransactionActions.Published, payload: signResponse });
    } catch {
      signTransactionDispatch({ type: SignTransactionActions.Failed });
    }
  }, [toAddr, txValue, wallet, provider, resetForm, signTransactionDispatch]);

  /**
   * Handles selecting a wallet from our account selection dropdown.
   *
   * @param {React.ChangeEvent} e - the dropdown's change event, containing the selected wallet.
   */
  const walletSelectedHandler = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const keyId = e.currentTarget.value;
      const wallet = wallets?.find((wallet) => wallet.key_id === keyId)!;

      cubeSigerDispatch({
        type: CubeSignerActionType.WalletSelected,
        payload: wallet,
      });
    },
    [wallets]
  );

  /**
   * Handles selecting a chain.
   *
   * @param {React.ChangeEvent} e - the dropdown's change event, containing the selected chain's id.
   */
  const chainSelectedHandler = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const chainId = Number.parseInt(e.currentTarget.value);
      const chain = chains?.find((chain) => chain.id === chainId)!;
      cubeSigerDispatch({ type: CubeSignerActionType.ChainSelected, payload: chain });
    },
    [chains, cubeSigerDispatch]
  );

  // renders component.
  if (loadingWallets) {
    return (
      <Box margin={"8px"}>
        <Spinner size={"lg"} />
      </Box>
    );
  } else if (loadingWalletsError) {
    return (
      <ErrorMessage>
        <b>Unable to fetch wallets, consider creating a new access token.</b>
      </ErrorMessage>
    );
  } else {
    return (
      <Container style={{ width: "800px" }}>
        {wallets && (
          <Select
            width="300px"
            placeholder="Select Account"
            value={wallet?.key_id}
            variant="outline"
            onChange={walletSelectedHandler}
          >
            {wallets.map((wallet) => (
              <option key={wallet.key_id} value={wallet.key_id}>
                {wallet.key_type} | {wallet.material_id}
              </option>
            ))}
          </Select>
        )}
        <Select
          width="300px"
          placeholder="Select Chain"
          value={provider?.chain.id}
          variant="outline"
          onChange={chainSelectedHandler}
        >
          {chains
            ?.filter((chain) => chain.currency === wallet?.currency)
            .map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
        </Select>

        {wallet && provider && (
          <>
            <Box float={"left"} width={"300px"}>
              Balance:{" "}
              {loadingBalance ? (
                <Spinner size={"sm"} />
              ) : (
                balanceDisplayText(balance!, provider?.chain.currency)
              )}
            </Box>
            <FormControl marginBottom="14px">
              <FormLabel>Wallet</FormLabel>
              <Input
                width="280px"
                marginBottom="12px"
                placeholder="To Address (0x...9876)"
                value={toAddr}
                onChange={(e) => {
                  setToAddr(e.currentTarget.value);
                }}
              />
            </FormControl>
            <FormControl marginBottom="12px">
              <FormLabel>Amount</FormLabel>
              <InputGroup>
                <Input
                  width="280px"
                  marginBottom="12px"
                  value={txValue}
                  onChange={(e) => {
                    setTxValue(e.currentTarget.value);
                  }}
                />
                <InputRightAddon children={wallet?.currency} />
              </InputGroup>
            </FormControl>
            {signTransactionState.error && <Box>{"Failed to send transaction."}</Box>}
            {signTransactionState.tx?.transactionHash && (
              <Box>
                <Text>Transaction Hash</Text>
                <Link
                  textDecoration={"underline"}
                  isExternal={true}
                  href={provider.getExplorerUrl(signTransactionState.tx)}
                >
                  {signTransactionState.tx.transactionHash} <FaExternalLinkAlt />
                </Link>
              </Box>
            )}
            {signTransactionState.sending ? (
              <Box>
                {"Sending transaction"} <Spinner />
              </Box>
            ) : (
              <Button style={{ marginTop: "4px" }} onClick={onSignButtonClick}>
                Sign
              </Button>
            )}
          </>
        )}
      </Container>
    );
  }
};
